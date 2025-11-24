import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilDescription, cilListNumbered, cilText } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import FormButtons from '../../../utils/FormButtons';
import axiosInstance from '../../../axiosInstance';

function AddDeclaration() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    formType: '',
    priority: '',
    status: 'active'
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
      const res = await axiosInstance.get(`/declarations/${id}`);
      setFormData(res.data.data.declaration);
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
    if (!formData.priority) formErrors.priority = 'This field is required';
    if (!formData.formType) formErrors.formType = 'This field is required';
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      if (id) {
        await axiosInstance.patch(`/declarations/${id}`, formData);
        await showFormSubmitToast('Declarations updated successfully!', () => navigate('/declaration-master'));
      } else {
        await axiosInstance.post('/declarations', formData);
        await showFormSubmitToast('Declarations added successfully!', () => navigate('/declaration-master'));
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/declaration-master');
  };
  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} Declaration</h4>
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
                  <span className="details">Form Type</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilListNumbered} />
                  </CInputGroupText>
                  <CFormSelect name="formType" value={formData.formType} onChange={handleChange}>
                    <option value="">-Select Form Type-</option>
                    <option value="stock_transfer">Stock Transfer</option>
                    <option value="delivery_challan">Delivery Challan</option>
                    <option value="gst_invoice">GST Invoice</option>
                    <option value="deal_form">Deal Form</option>
                    <option value="booking_form">Booking Form</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.formType && <p className="error">{errors.formType}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Priority</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilDescription} />
                  </CInputGroupText>
                  <CFormInput type="number" name="priority" value={formData.priority} onChange={handleChange} />
                </CInputGroup>
                {errors.priority && <p className="error">{errors.priority}</p>}
              </div>
            </div>
            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddDeclaration;
