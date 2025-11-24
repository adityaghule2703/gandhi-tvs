import React, { useState, useEffect } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CRow,
  CCol,
  CBackdrop,
  CAlert
} from '@coreui/react';
import '../../css/receipt.css';
import axiosInstance from '../../axiosInstance';

const UpdateHSRPInstallation = ({ show, onClose, hsrpData, onUpdateSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!hsrpData || !hsrpData._id) {
        throw new Error('Invalid HSRP data');
      }

      const response = await axiosInstance.patch(`/rtoProcess/${hsrpData._id}`, {
        hsrbInstallation: true
      });

      setSuccess('HSRP Installation status successfully updated!');
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
      console.log('HSRP update response:', response.data);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('HSRP update error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update HSRP status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      setError(null);
      setSuccess(null);
    }
  }, [show, hsrpData]);

  return (
    <>
      <CBackdrop visible={show} className="modal-backdrop" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
      <CModal visible={show} onClose={onClose} size="lg" alignment="center">
        <CModalHeader className="text-white" style={{ backgroundColor: '#243c7c' }}>
          <CModalTitle className="text-white">RTO HSRP pending</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          <div className="booking-header mb-2 p-1 bg-light rounded">
            <h5 className="mb-0">
              Booking Number: <strong>{hsrpData?.bookingId?.bookingNumber || ''}</strong>
            </h5>
          </div>
          <hr></hr>

          <CRow className="mb-3">
            <CCol md={6}>
              <label className="form-label">Customer Name</label>
              <CFormInput type="text" value={hsrpData?.bookingId?.customerName || ''} readOnly className="bg-light" />
            </CCol>
            <CCol md={6}>
              <label className="form-label">Chassis Number</label>
              <CFormInput type="text" value={hsrpData?.bookingId?.chassisNumber || ''} readOnly className="bg-light" />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          <div>
            <CButton color="primary" onClick={handleSubmit} className="me-2" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'UPDATE HSRP INSTALLATION'}
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

export default UpdateHSRPInstallation;
