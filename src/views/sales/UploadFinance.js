import React, { useState, useEffect } from 'react';
import '../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilFile, cilLocationPin, cilTag, cilUser } from '@coreui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from 'utils/sweetAlerts';
import axiosInstance from 'axiosInstance';
import FormButtons from 'utils/FormButtons';

function UploadFinance() {
  const [formData, setFormData] = useState({
    bookingId: '',
    customerName: '',
    address: '',
    financeLetter: null,
    bookingType: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({
        ...prev,
        bookingId: location.state.bookingId,
        customerName: location.state.customerName,
        address: location.state.address,
        bookingType: location.state.bookingType
      }));
    }
  }, [location.state]);

  console.log(formData.bookingType);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiredFields = {
      financeLetter: 'Finance Letter is required'
    };

    let formErrors = {};
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!formData[field]) {
        formErrors[field] = message;
      }
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      await axiosInstance.post(`/finance-letters/${formData.bookingId}/submit`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await showFormSubmitToast('Finance documents uploaded successfully!');

      if (formData.bookingType === 'SUBDEALER') {
        navigate('/subdealer-all-bookings');
      } else {
        navigate('/booking-list');
      }
    } catch (error) {
      console.error('Error uploading finance document:', error);
      showFormSubmitError(error.response?.data?.message || 'Failed to upload finance documents');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/booking-list');
  };

  return (
    <div>
      <h4>Customer Finance Upload Details</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Booking ID</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilTag} />
                  </CInputGroupText>
                  <CFormInput type="text" name="bookingId" value={formData.bookingId} onChange={handleTextChange} readOnly />
                </CInputGroup>
                {errors.bookingId && <p className="error">{errors.bookingId}</p>}
              </div>

              <div className="input-box">
                <span className="details">Customer Name</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput type="text" name="customerName" value={formData.customerName} onChange={handleTextChange} readOnly />
                </CInputGroup>
              </div>

              <div className="input-box">
                <span className="details">Address</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>
                  <CFormInput type="text" name="address" value={formData.address} onChange={handleTextChange} readOnly />
                </CInputGroup>
              </div>

              <div className="input-box">
                <div className="details-container">
                  <span className="details">Finance Letter</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilFile} />
                  </CInputGroupText>
                  <CFormInput type="file" name="financeLetter" onChange={handleFileChange} accept="image/*,.pdf" />
                </CInputGroup>
                {errors.financeLetter && <p className="error">{errors.financeLetter}</p>}
              </div>
            </div>
            <FormButtons onCancel={handleCancel} submitText={isSubmitting ? 'Uploading...' : 'Submit'} disabled={isSubmitting} />
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadFinance;
