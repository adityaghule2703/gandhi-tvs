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

const UpdateRCConfirmation = ({ show, onClose, rcData, onUpdateSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [rcDispatchDate, setRcDispatchDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    if (!rcDispatchDate) {
      setError('Please select RC Dispatch Date');
      setIsLoading(false);
      return;
    }

    try {
      if (!rcData || !rcData._id) {
        throw new Error('Invalid RC data');
      }

      const response = await axiosInstance.patch(`/rtoProcess/${rcData._id}`, {
        rcConfirmation: true,
        rcDispatchDate: rcDispatchDate
      });

      setSuccess('RC Confirmation status and dispatch date successfully updated!');
      console.log('RC Confirmation update response:', response.data);
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }

      setTimeout(() => {
        onClose();
        setRcDispatchDate('');
      }, 2000);
    } catch (err) {
      console.error('RC update error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update RC status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      setError(null);
      setSuccess(null);
      if (rcData && rcData.rcDispatchDate) {
        setRcDispatchDate(rcData.rcDispatchDate.split('T')[0]);
      } else {
        setRcDispatchDate('');
      }
    }
  }, [show, rcData]);

  return (
    <>
      <CBackdrop visible={show} className="modal-backdrop" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
      <CModal visible={show} onClose={onClose} size="lg" alignment="center">
        <CModalHeader className="text-white" style={{ backgroundColor: '#243c7c' }}>
          <CModalTitle className="text-white">RTO RC CONFIRMATION</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          <div className="booking-header mb-2 p-1 bg-light rounded">
            <h5 className="mb-0">
              Booking Number: <strong>{rcData?.bookingId?.bookingNumber || ''}</strong>
            </h5>
          </div>
          <hr></hr>

          <CRow className="mb-3">
            <CCol md={6}>
              <label className="form-label">Customer Name</label>
              <CFormInput type="text" value={rcData?.bookingId?.customerName || ''} readOnly className="bg-light" />
            </CCol>
            <CCol md={6}>
              <label className="form-label">Chassis Number</label>
              <CFormInput type="text" value={rcData?.bookingId?.chassisNumber || ''} readOnly className="bg-light" />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <label className="form-label">RC Dispatch Date *</label>
              <CFormInput type="date" value={rcDispatchDate} onChange={(e) => setRcDispatchDate(e.target.value)} required />
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          <div>
            <CButton color="primary" onClick={handleSubmit} className="me-2" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'UPDATE RC CONFIRMATION'}
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

export default UpdateRCConfirmation;
