import React, { useState, useEffect } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CRow,
  CCol,
  CBackdrop,
  CAlert
} from '@coreui/react';
import '../../css/receipt.css';
import axiosInstance from '../../axiosInstance';

const UpdateRTO = ({ show, onClose, bookingData, onSuccess }) => {
  const [formData, setFormData] = useState({
    bookingId: '',
    applicationNumber: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.bookingId || !formData.applicationNumber) {
      setError('Both Booking ID and Application Number are required');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        bookingId: formData.bookingId.toString(),
        applicationNumber: formData.applicationNumber
      };

      const response = await axiosInstance.post('/rtoProcess', payload);

      if (response.data.success) {
        setSuccess('RTO application number successfully updated!');
        if (onSuccess) {
          onSuccess(); // Trigger the refresh in parent component
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to update RTO details');
      }
    } catch (err) {
      console.error('RTO update error:', err);
      setError(err.response?.data?.message || 'Failed to update RTO details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (show && bookingData) {
      setFormData({
        bookingId: bookingData._id || '',
        applicationNumber: bookingData.rtoApplicationNumber || ''
      });
      setError(null);
      setSuccess(null);
    }
  }, [show, bookingData]);

  return (
    <>
      <CBackdrop visible={show} className="modal-backdrop" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
      <CModal visible={show} onClose={onClose} size="lg" alignment="center">
        <CModalHeader className="text-white" style={{ backgroundColor: '#243c7c' }}>
          <CModalTitle className="text-white">Update RTO Application</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          <div className="booking-header mb-2 p-1 bg-light rounded">
            <h5 className="mb-0">
              Booking Number: <strong>{bookingData?.bookingNumber || ''}</strong>
            </h5>
          </div>
          <hr></hr>

          <CRow className="mb-3">
            <CCol md={6}>
              <label className="form-label">Customer Name</label>
              <CFormInput type="text" value={bookingData?.customerDetails?.name || ''} readOnly className="bg-light" />
            </CCol>
            <CCol md={6}>
              <label className="form-label">Chassis Number</label>
              <CFormInput type="text" value={bookingData?.chassisNumber || ''} readOnly className="bg-light" />
            </CCol>
          </CRow>

          <CForm onSubmit={handleSubmit}>
            <input type="hidden" name="bookingId" value={formData.bookingId} />
            <CRow className="mb-3">
              <CCol md={6}>
                <label className="form-label">Application Number *</label>
                <CFormInput
                  type="text"
                  name="applicationNumber"
                  value={formData.applicationNumber}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          <div>
            <CButton color="primary" onClick={handleSubmit} className="me-2" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Save Changes'}
            </CButton>
          </div>
          <CButton color="secondary" onClick={onClose} disabled={isLoading}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default UpdateRTO;
