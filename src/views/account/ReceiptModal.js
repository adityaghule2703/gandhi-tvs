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
  CFormSelect,
  CRow,
  CCol,
  CBackdrop,
  CAlert
} from '@coreui/react';
import '../../css/receipt.css';
import axiosInstance from '../../axiosInstance';
import tvsLogo from '../../assets/images/logo.png';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const ReceiptModal = ({ show, onClose, bookingData }) => {
  const [formData, setFormData] = useState({
    bookingId: bookingData?._id || '',
    totalAmount: bookingData?.discountedAmount || 0,
    balanceAmount: bookingData?.balanceAmount || 0,
    modeOfPayment: '',
    amount: '',
    remark: '',
    cashLocation: '',
    bank: '',
    subPaymentMode: '',
    gcAmount: bookingData?.payment?.gcAmount || 0,
    transactionReference: '',
    amountToBeCredited: 0
  });

  const [cashLocations, setCashLocations] = useState([]);
  const [bankLocations, setBankLocations] = useState([]);
  const [paymentSubModes, setPaymentSubModes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value
      };
      if (name === 'amount') {
        const amountValue = parseFloat(value) || 0;
        const gcAmountValue = parseFloat(prev.gcAmount) || 0;

        updatedData.amountToBeCredited = amountValue - gcAmountValue;
        // updatedData.balanceAmount = parseFloat(prev.totalAmount) - amountValue;
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let paymentData = {
        bookingId: formData.bookingId,
        paymentMode: formData.modeOfPayment,
        amount: parseFloat(formData.amount),
        remark: formData.remark,
        transactionReference: formData.transactionReference
      };

      switch (formData.modeOfPayment) {
        case 'Cash':
          paymentData.cashLocation = formData.cashLocation;
          break;
        case 'Bank':
          paymentData.bank = formData.bank;
          paymentData.subPaymentMode = formData.subPaymentMode;
          break;
        case 'Finance Disbursement':
          paymentData.financer = bookingData?.payment?.financer?._id || bookingData?.payment?.financer;
          paymentData.gcAmount = parseFloat(formData.gcAmount);
          paymentData.amountToBeCredited = parseFloat(formData.amountToBeCredited);
          break;
        case 'Exchange':
        case 'Pay Order':
          paymentData.bank = formData.bank;
          break;
        default:
          break;
      }

      const response = await axiosInstance.post('/ledger/receipt', paymentData);

      setSuccess('Payment successfully recorded!');
      console.log('Payment response:', response.data);

      setFormData({
        bookingId: bookingData?._id || '',
        totalAmount: bookingData?.discountedAmount || 0,
        balanceAmount: bookingData?.balanceAmount || 0,
        modeOfPayment: '',
        amount: '',
        remark: '',
        cashLocation: '',
        bank: '',
        subPaymentMode: '',
        gcAmount: bookingData?.payment?.gcAmount || 0,
        transactionReference: '',
        amountToBeCredited: 0
      });
      setTimeout(() => {
        onClose();
      }, 2000);
      navigate('/view-ledgers');
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || 'Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCashLocations = async () => {
      try {
        const response = await axiosInstance.get('/cash-locations');
        setCashLocations(response.data.data.cashLocations);
      } catch (error) {
        console.error('Error fetching cash locations:', error);
      }
    };

    const fetchBankLocations = async () => {
      try {
        const response = await axiosInstance.get('/banks');
        setBankLocations(response.data.data.banks);
      } catch (error) {
        console.error('Error fetching bank locations:', error);
      }
    };

    const fetchPaymentSubModes = async () => {
      try {
        const response = await axiosInstance.get('/banksubpaymentmodes');
        setPaymentSubModes(response.data.data || []);
      } catch (error) {
        console.error('Error fetching payment sub-modes:', error);
        setPaymentSubModes([]);
      }
    };

    if (show) {
      fetchCashLocations();
      fetchBankLocations();
      fetchPaymentSubModes();

      const gcAmount = bookingData?.payment?.gcAmount || 0;
      setFormData({
        bookingId: bookingData?._id || '',
        totalAmount: bookingData?.discountedAmount || 0,
        balanceAmount: bookingData?.balanceAmount || 0,
        modeOfPayment: '',
        amount: '',
        remark: '',
        cashLocation: '',
        bank: '',
        subPaymentMode: '',
        gcAmount: gcAmount,
        transactionReference: '',
        amountToBeCredited: 0 - gcAmount
      });
      setError(null);
      setSuccess(null);
    }
  }, [show, bookingData]);

  const renderPaymentSpecificFields = () => {
    switch (formData.modeOfPayment) {
      case 'Cash':
        return (
          <CCol md={6}>
            <label className="form-label">Cash Location</label>
            <CFormSelect name="cashLocation" value={formData.cashLocation} onChange={handleChange} required disabled={isLoading}>
              <option value="">Select Cash Location</option>
              {cashLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        );
      case 'Bank':
        return (
          <>
            <CCol md={6}>
              <label className="form-label">Payment Sub Mode</label>
              <CFormSelect name="subPaymentMode" value={formData.subPaymentMode} onChange={handleChange} required disabled={isLoading}>
                <option value="">Select Payment Sub Mode</option>
                {paymentSubModes.map((subMode) => (
                  <option key={subMode.id} value={subMode._id}>
                    {subMode.payment_mode}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <label className="form-label">Bank Location</label>
              <CFormSelect name="bank" value={formData.bank} onChange={handleChange} required disabled={isLoading}>
                <option value="">Select Bank Location</option>
                {bankLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </>
        );
      case 'Finance Disbursement':
        return (
          <>
            <CCol md={6}>
              <label className="form-label">Financer Name</label>
              <CFormInput type="text" value={bookingData?.payment?.financer?.name || 'N/A'} readOnly className="bg-light" />
            </CCol>
            <CCol md={6}>
              <label className="form-label">GC Amount (₹)</label>
              <CFormInput type="number" name="gcAmount" value={formData.gcAmount} readOnly className="bg-light" />
            </CCol>
            <CCol md={6}>
              <label className="form-label mt-3">Amount Credited To Customer Ledger (₹)</label>
              <CFormInput type="number" name="amountToBeCredited" value={formData.amountToBeCredited} readOnly className="bg-light" />
            </CCol>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <CBackdrop visible={show} className="modal-backdrop" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
      <CModal visible={show} onClose={onClose} size="lg" alignment="center">
      <CModalHeader>
          <CModalTitle>Account Receipt</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

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

          <CRow className="mb-3">
            <CCol md={6}>
              <label className="form-label">Total Amount (₹)</label>
              <CFormInput type="number" name="totalAmount" value={formData.totalAmount} readOnly className="bg-light font-weight-bold" />
            </CCol>
            <CCol md={6}>
              <label className="form-label">Balance Amount (₹)</label>
              <CFormInput
                type="number"
                name="balanceAmount"
                value={formData.balanceAmount}
                readOnly
                className={`bg-light font-weight-bold ${parseFloat(formData.balanceAmount) > 0 ? 'text-danger' : 'text-success'}`}
              />
            </CCol>
          </CRow>

          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <label className="form-label">Amount (₹)</label>
                <CFormInput
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
              </CCol>
              <CCol md={6}>
                <label className="form-label">Mode of Payment</label>
                <CFormSelect name="modeOfPayment" value={formData.modeOfPayment} onChange={handleChange} disabled={isLoading}>
                  <option value="">--Select--</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Finance Disbursement">Finance Disbursement</option>
                  <option value="Exchange">Exchange</option>
                  <option value="Pay Order">Pay Order</option>
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">{renderPaymentSpecificFields()}</CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <label className="form-label">Reference Number</label>
                <CFormInput type="text" name="transactionReference" value={formData.transactionReference} onChange={handleChange} />
              </CCol>
              <CCol md={6}>
                <label className="form-label">Remark</label>
                <CFormInput type="text" name="remark" value={formData.remark} onChange={handleChange} placeholder="Enter any remarks..." />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          <div>
            <CButton color="primary" onClick={handleSubmit} className="me-2" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Save Payment'}
            </CButton>
            {/* <CButton color="info" variant="outline" onClick={handleViewLedger}>
              View Ledger
            </CButton> */}
          </div>
          <CButton color="secondary" onClick={onClose} disabled={isLoading}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default ReceiptModal;
