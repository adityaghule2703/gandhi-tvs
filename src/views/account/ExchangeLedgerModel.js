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
import axiosInstance from '../../axiosInstance';

const ExchangeLedgerModel = ({ show, onClose, brokerData, refreshData }) => {
  const branchId = brokerData?.branchId;

  const [formData, setFormData] = useState({
    brokerId: brokerData?.broker?._id || '',
    branch: branchId || '',
    type: '',
    modeOfPayment: '',
    amount: '',
    remark: '',
    referenceNumber: '',
    cashLocation: '',
    bank: '',
    subPaymentMode: ''
  });

  const [cashLocations, setCashLocations] = useState([]);
  const [bankLocations, setBankLocations] = useState([]);
  const [submodes, setSubModes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [commissionInfo, setCommissionInfo] = useState(null);
  const [editFixedAmount, setEditFixedAmount] = useState(false);

  useEffect(() => {
    if (brokerData?.broker?.branches?.length > 0) {
      const targetBranch = branchId
        ? brokerData.broker.branches.find((b) => b.branchId === branchId)
        : brokerData.broker.branches.find((b) => b.isActive);

      if (targetBranch) {
        setCommissionInfo({
          type: targetBranch.commissionType,
          range: targetBranch.commissionRange,
          fixedAmount: targetBranch.fixedCommission
        });

        if (targetBranch.commissionType === 'FIXED' && targetBranch.fixedCommission) {
          setFormData((prev) => ({
            ...prev,
            amount: targetBranch.fixedCommission
          }));
        }
      }
    }
  }, [brokerData, branchId]);

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
    if (!formData.branch) {
      setError('Please select a branch/location');
      setIsLoading(false);
      return;
    }

    try {
      let paymentData = {
        brokerId: formData.brokerId,
        type: formData.type,
        modeOfPayment: formData.modeOfPayment,
        amount: parseFloat(formData.amount),
        remark: formData.remark,
        referenceNumber: formData.referenceNumber
      };

      switch (formData.modeOfPayment) {
        case 'Cash':
          paymentData.cashLocation = formData.cashLocation;
          break;
        case 'Bank':
          paymentData.bank = formData.bank;
          paymentData.subPaymentMode = formData.subPaymentMode;
          break;
        default:
          break;
      }

      const response = await axiosInstance.post(`/broker-ledger/on-account/${formData.brokerId}/${formData.branch}`, paymentData);

      setSuccess('Payment successfully recorded!');
      if (refreshData) {
        refreshData();
      }
      onClose();
      setFormData({
        brokerId: brokerData?.broker?._id || '',
        branch: branchId || '',
        type: '',
        modeOfPayment: '',
        amount: '',
        remark: '',
        referenceNumber: '',
        cashLocation: '',
        bank: '',
        subPaymentMode: ''
      });
      setEditFixedAmount(false);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Failed to process payment. Please try again.');
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
    const fetchSubmode = async () => {
      try {
        const response = await axiosInstance.get('/banksubpaymentmodes');
        setSubModes(response.data.data);
      } catch (error) {
        console.error('Error fetching bank submode:', error);
      }
    };
    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get('/branches');
        setBranches(response.data.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    if (show) {
      fetchCashLocations();
      fetchBankLocations();
      fetchSubmode();
      fetchBranches();
      setFormData({
        brokerId: brokerData?.broker?._id || '',
        branch: branchId || '',
        type: '',
        modeOfPayment: '',
        amount: brokerData?.broker?.branches?.[0]?.commissionType === 'FIXED' ? brokerData.broker.branches[0].fixedCommission : '',
        remark: '',
        referenceNumber: '',
        cashLocation: '',
        bank: '',
        subPaymentMode: ''
      });
      setError(null);
      setSuccess(null);
      setEditFixedAmount(false);
    }
  }, [show, brokerData, branchId]);

  const renderPaymentSpecificFields = () => {
    switch (formData.modeOfPayment) {
      case 'Cash':
        return (
          <CCol md={6}>
            <label className="form-label">Cash Location</label>
            <CFormSelect name="cashLocation" value={formData.cashLocation} onChange={handleChange} required disabled={isLoading}>
              <option value="">Select Cash Location</option>
              {cashLocations.map((location) => (
                <option key={location._id} value={location._id}>
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
              <label className="form-label">Submode</label>
              <CFormSelect name="subPaymentMode" value={formData.subPaymentMode} onChange={handleChange} required disabled={isLoading}>
                <option value="">Select submode</option>
                {submodes.map((submode) => (
                  <option key={submode._id} value={submode._id}>
                    {submode.payment_mode}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <label className="form-label">Bank</label>
              <CFormSelect name="bank" value={formData.bank} onChange={handleChange} required disabled={isLoading}>
                <option value="">Select Bank</option>
                {bankLocations.map((bank) => (
                  <option key={bank._id} value={bank._id}>
                    {bank.name}
                  </option>
                ))}
              </CFormSelect>
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
        <CModalHeader className="text-white" style={{ backgroundColor: '#243c7c' }}>
          <CModalTitle className="text-white">Broker: {brokerData?.broker?.name || ''}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <label className="form-label">Location</label>
                <CFormSelect
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  disabled={isLoading || Boolean(branchId)}
                >
                  <option value="">Select Location</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <label className="form-label">Mode of Payment</label>
                <CFormSelect name="modeOfPayment" value={formData.modeOfPayment} onChange={handleChange} required disabled={isLoading}>
                  <option value="">-- Select Mode --</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Exchange">Exchange</option>
                  <option value="UPI">UPI</option>
                  <option value="Pay Order">Pay Order</option>
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow className="mb-3">{renderPaymentSpecificFields()}</CRow>
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
                  disabled={isLoading || (commissionInfo?.type === 'FIXED' && !editFixedAmount)}
                />
              </CCol>
              <CCol md={6}>
                <label className="form-label">Reference Number</label>
                <CFormInput
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <label className="form-label">Remark</label>
                <CFormInput
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Enter remarks..."
                  disabled={isLoading}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          <div>
            <CButton color="primary" onClick={handleSubmit} className="me-2" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Save Payment'}
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

export default ExchangeLedgerModel;
