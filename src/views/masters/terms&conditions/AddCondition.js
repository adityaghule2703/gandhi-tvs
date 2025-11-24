import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilDescription, cilListNumbered, cilText } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import FormButtons from '../../../utils/FormButtons';
import axiosInstance from '../../../axiosInstance';

function AddCondition() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isActive: true,
    order: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchCondition(id);
    }
  }, [id]);

  const fetchCondition = async (id) => {
    try {
      const res = await axiosInstance.get(`/terms-conditions/${id}`);
      setFormData(res.data.data);
    } catch (error) {
      console.error('Error fetching condition:', error);
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

    if (!formData.content) formErrors.content = 'This field is required';
    if (!formData.order) formErrors.order = 'This field is required';
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      if (id) {
        await axiosInstance.put(`/terms-conditions/${id}`, formData);
        await showFormSubmitToast('Condition updated successfully!', () => navigate('/conditions/conditions-list'));
      } else {
        await axiosInstance.post('/terms-conditions', formData);
        await showFormSubmitToast('Condition added successfully!', () => navigate('/conditions/conditions-list'));
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/conditions/conditions-list');
  };
  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} Terms and Conditions</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <span className="details">Title</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilText} />
                  </CInputGroupText>
                  <CFormInput type="text" name="title" value={formData.title} onChange={handleChange} />
                </CInputGroup>
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Content</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilDescription} />
                  </CInputGroupText>
                  <CFormInput type="text" name="content" value={formData.content} onChange={handleChange} />
                </CInputGroup>
                {errors.content && <p className="error">{errors.content}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Sequence</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilListNumbered} />
                  </CInputGroupText>
                  <CFormInput type="text" name="order" value={formData.order} onChange={handleChange} />
                </CInputGroup>
                {errors.order && <p className="error">{errors.order}</p>}
              </div>
              <div className="input-box">
                <span className="details">Is active</span>
                <CInputGroup>
                  <CFormSwitch
                    className="custom-switch-toggle"
                    name="isActive"
                    label={formData.isActive === true ? 'Yes' : 'No'}
                    checked={formData.isActive === true}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        isActive: e.target.checked ? true : false
                      });

                      if (errors.isActive) {
                        setErrors({ ...errors, isActive: '' });
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
    </div>
  );
}
export default AddCondition;
