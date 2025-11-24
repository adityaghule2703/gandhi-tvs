import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLocationPin, cilUser } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';
import FormButtons from '../../../utils/FormButtons';

function AddRto() {
  const [formData, setFormData] = useState({
    rto_code: '',
    rto_name: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchCustomer(id);
    }
  }, [id]);
  const fetchCustomer = async (id) => {
    try {
      const res = await axiosInstance.get(`/rtos/${id}`);
      setFormData(res.data.data);
    } catch (error) {
      console.error('Error fetching RTO:', error);
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

    if (!formData.rto_code) formErrors.rto_code = 'This field is required';
    if (!formData.rto_name) formErrors.rto_name = 'This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      if (id) {
        await axiosInstance.put(`/rtos/${id}`, formData);
        await showFormSubmitToast('RTO updated successfully!', () => navigate('/rto/rto-list'));

        navigate('/rto/rto-list');
      } else {
        await axiosInstance.post('/rtos', formData);
        await showFormSubmitToast('RTO added successfully!', () => navigate('/rto/rto-list'));

        navigate('/rto/rto-list');
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/rto/rto-list');
  };
  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} RTO Details</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">RTO Code</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput type="text" name="rto_code" value={formData.rto_code} onChange={handleChange} />
                </CInputGroup>
                {errors.rto_code && <p className="error">{errors.rto_code}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">RTO Name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>
                  <CFormInput type="text" name="rto_name" value={formData.rto_name} onChange={handleChange} />
                </CInputGroup>
                {errors.rto_name && <p className="error">{errors.rto_name}</p>}
              </div>
              <FormButtons onCancel={handleCancel} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddRto;
