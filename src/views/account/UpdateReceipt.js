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
import axiosInstance from 'axiosInstance';
const UpdateReceipt = ({ show, onClose, bookingData }) => {
  const [formData, setFormData] = useState({
    bookingId: bookingData?._id || '',
    totalAmount: bookingData?.discountedAmount || 0,
    balanceAmount: bookingData?.balanceAmount || bookingData?.discountedAmount || 0,
    modeOfPayment: '',
    amount: '',
    remark: '',
    cashLocation: '',
    bank: '',
    gcAmount: ''
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

    if (name === 'amount') {
      const amountValue = parseFloat(value) || 0;
      setFormData((prev) => ({
        ...prev,
        balanceAmount: parseFloat(prev.totalAmount) - amountValue
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosInstance.post('/ledger/receipt', formData);

      setSuccess('Payment successfully recorded!');
      console.log('Payment response:', response.data);

      setFormData({
        bookingId: bookingData?._id || '',
        totalAmount: bookingData?.discountedAmount || 0,
        balanceAmount: bookingData?.discountedAmount || 0,
        modeOfPayment: '',
        amount: '',
        remark: '',
        cashLocation: '',
        bank: '',
        gcAmount: ''
      });
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CBackdrop visible={show} className="modal-backdrop" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
      <CModal visible={show} onClose={onClose} size="lg" alignment="center">
        <CModalHeader className="text-white" style={{ backgroundColor: '#243c7c' }}>
          <CModalTitle className="text-white">Account Receipt</CModalTitle>
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
              <label className="form-label">Account Head</label>
              <CFormInput type="text" value={bookingData?.customerDetails?.name || ''} readOnly className="bg-light" />
            </CCol>
            <CCol md={6}>
              <label className="form-label">Short Narration</label>
              <CFormInput type="text" value={bookingData?.chassisNumber || ''} readOnly className="bg-light" />
            </CCol>
          </CRow>

          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <label className="form-label">Date</label>
                <CFormInput type="date" name="date" value={formData.remark} onChange={handleChange} disabled={isLoading} />
              </CCol>
              <CCol md={6}>
                <label className="form-label">Remark</label>
                <CFormInput type="text" name="remark" value={formData.remark} onChange={handleChange} disabled={isLoading} />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          <div>
            <CButton color="primary" onClick={handleSubmit} className="me-2" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Approved'}
            </CButton>
            <CButton color="info" variant="outline">
              Reject
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

export default UpdateReceipt;
