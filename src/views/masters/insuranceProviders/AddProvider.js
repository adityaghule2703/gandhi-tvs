import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';
import FormButtons from '../../../utils/FormButtons';

function AddProvider() {
  const [formData, setFormData] = useState({
    provider_name: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchInsuranceProvider(id);
    }
  }, [id]);
  const fetchInsuranceProvider = async (id) => {
    try {
      const res = await axiosInstance.get(`/insurance-providers/${id}`);
      setFormData(res.data.data);
    } catch (error) {
      console.error('Error fetching insurance providers:', error);
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

    if (!formData.provider_name) formErrors.provider_name = 'This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      if (id) {
        await axiosInstance.put(`/insurance-providers/${id}`, formData);
        await showFormSubmitToast('Insurance Provider updated successfully!', () => navigate('/insurance-provider/provider-list'));

        navigate('/insurance-provider/provider-list');
      } else {
        await axiosInstance.post('/insurance-providers', formData);
        await showFormSubmitToast('Insurance Provider added successfully!', () => navigate('/insurance-provider/provider-list'));

        navigate('/insurance-provider/provider-list');
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/insurance-provider/provider-list');
  };
  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} Insurance Provider</h4>
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
                  <CFormInput type="text" name="provider_name" value={formData.provider_name} onChange={handleChange} />
                </CInputGroup>
                {errors.provider_name && <p className="error">{errors.provider_name}</p>}
              </div>
              <FormButtons onCancel={handleCancel} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddProvider;
