import React, { useState, useEffect } from 'react';
import '../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilDollar, cilList, cilLocationPin, cilUser } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from 'src/utils/sweetAlerts.jsx';
import axiosInstance from 'src/axiosInstance.js';
import FormButtons from 'src/utils/FormButtons';

function AddSubdealer() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    rateOfInterest: '',
    type: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchSubdealer(id);
    }
  }, [id]);
  const fetchSubdealer = async (id) => {
    try {
      const res = await axiosInstance.get(`/subdealers/${id}`);
      setFormData(res.data.data.subdealer);
    } catch (error) {
      console.error('Error fetching subdealer:', error);
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
    if (!formData.location) formErrors.location = 'This field is required';
    if (!formData.rateOfInterest) formErrors.rateOfInterest = 'This field is required';
    if (!formData.type) formErrors.type = 'This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      if (id) {
        await axiosInstance.put(`/subdealers/${id}`, formData);
        await showFormSubmitToast('Subdealer updated successfully!', () => navigate('/subdealer-list'));

        navigate('/subdealer-list');
      } else {
        await axiosInstance.post('/subdealers', formData);
        await showFormSubmitToast('Subdealer added successfully!', () => navigate('/subdealer-list'));

        navigate('/subdealer-list');
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/subdealer-list');
  };
  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} Subdealer</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput type="text" name="name" value={formData.name} onChange={handleChange} />
                </CInputGroup>
                {errors.name && <p className="error">{errors.name}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Location</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>
                  <CFormInput type="text" name="location" value={formData.location} onChange={handleChange} />
                </CInputGroup>
                {errors.location && <p className="error">{errors.location}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Rate Of Interest</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilDollar} />
                  </CInputGroupText>
                  <CFormInput type="number" name="rateOfInterest" value={formData.rateOfInterest} onChange={handleChange} />
                </CInputGroup>
                {errors.rateOfInterest && <p className="error">{errors.rateOfInterest}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Type</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilList} />
                  </CInputGroupText>
                  <CFormSelect name="type" value={formData.type} onChange={handleChange}>
                    <option value="">-Select-</option>
                    <option value="B2B">B2B</option>
                    <option value="B2C">B2C</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.type && <p className="error">{errors.type}</p>}
              </div>
            </div>
            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddSubdealer;
