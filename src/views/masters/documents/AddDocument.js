import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilFile, cilListRich } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import FormButtons from '../../../utils/FormButtons';
import axiosInstance from '../../../axiosInstance';

function AddDocument() {
  const [formData, setFormData] = useState({
    name: '',
    isRequired: true,
    description: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchDocument(id);
    }
  }, [id]);

  const fetchDocument = async (id) => {
    try {
      const res = await axiosInstance.get(`/finance-documents/${id}`);
      setFormData(res.data.data);
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.name) formErrors.name = 'This field is required';
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      if (id) {
        await axiosInstance.put(`/finance-documents/${id}`, formData);
        await showFormSubmitToast('Document updated successfully!', () => navigate('/documents/documents-list'));
      } else {
        await axiosInstance.post('/finance-documents', formData);
        await showFormSubmitToast('Document added successfully!', () => navigate('/documents/documents-list'));
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/documents/documents-list');
  };
  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} Documents</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Document name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilFile} />
                  </CInputGroupText>
                  <CFormInput type="text" name="name" value={formData.name} onChange={handleChange} />
                </CInputGroup>
                {errors.name && <p className="error">{errors.name}</p>}
              </div>
              <div className="input-box">
                <span className="details">Description</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilListRich} />
                  </CInputGroupText>
                  <CFormInput type="text" name="description" value={formData.description} onChange={handleChange} />
                </CInputGroup>
              </div>
              <div className="input-box">
                <span className="details">Is Required</span>
                <CInputGroup>
                  <CFormSwitch
                    className="custom-switch-toggle"
                    name="isRequired"
                    label={formData.isRequired === true ? 'Yes' : 'No'}
                    checked={formData.isRequired === true}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        isRequired: e.target.checked ? true : false
                      });

                      if (errors.isRequired) {
                        setErrors({ ...errors, isRequired: '' });
                      }
                    }}
                  />
                </CInputGroup>
              </div>
            </div>
            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
      {/* <DocumentList/> */}
    </div>
  );
}
export default AddDocument;
