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

const RefundModel = ({ show, onClose, bookingData }) => {
  const [formData, setFormData] = useState({
    bookingId: bookingData?._id || '',
    modeOfPayment: '',
    amount: '',
    remark: '',
    cashLocation: '',
    bank: '',
    subPaymentMode: '',
    gcAmount: bookingData?.payment?.gcAmount || 0,
    transactionReference: '',
    refundReason: ''
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
        transactionReference: formData.transactionReference,
        refundReason: formData.refundReason
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

      const response = await axiosInstance.post('/ledger/refund', paymentData);

      setSuccess('Payment successfully recorded!');
      console.log('Payment response:', response.data);

      setFormData({
        bookingId: bookingData?._id || '',
        modeOfPayment: '',
        amount: '',
        remark: '',
        cashLocation: '',
        bank: '',
        subPaymentMode: '',
        gcAmount: bookingData?.payment?.gcAmount || 0,
        transactionReference: '',
        refundReason: ''
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
        modeOfPayment: '',
        amount: '',
        remark: '',
        cashLocation: '',
        bank: '',
        subPaymentMode: '',
        gcAmount: gcAmount,
        transactionReference: '',
        refundReason: ''
      });
      setError(null);
      setSuccess(null);
    }
  }, [show, bookingData]);

  const handleViewLedger = async (booking) => {
    try {
      const res = await axiosInstance.get(`/ledger/report/${booking._id}`);
      const ledgerData = res.data.data;
      const ledgerUrl = `${config.baseURL}/ledger.html?bookingId=${booking._id}`;

      const approvedEntries = ledgerData.entries.filter((entry) => entry.approvalStatus != 'Pending');

      const totals = {
        totalCredit: approvedEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0),
        totalDebit: approvedEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0),
        finalBalance: approvedEntries.reduce((sum, entry) => {
          const credit = entry.credit || 0;
          const debit = entry.debit || 0;
          return sum + (credit - debit);
        }, 0)
      };

      const win = window.open('', '_blank');
      win.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Customer Ledger - Approved Entries Only</title>
              <style>
                @page {
                  size: A4;
                  margin: 15mm 10mm;
                }
                body {
                  font-family: Arial;
                  width: 100%;
                  margin: 0;
                  padding: 0;
                  font-size: 14px;
                  line-height: 1.3;
                  font-family: Courier New;
                }
                .container {
                  width: 190mm;
                  margin: 0 auto;
                  padding: 5mm;
                }
                .header-container {
                  display: flex;
                  justify-content:space-between;
                  margin-bottom: 3mm;
                }
                .header-text{
                  font-size:20px;
                  font-weight:bold;
                }
                .logo {
                  width: 30mm;
                  height: auto;
                  margin-right: 5mm;
                } 
                .header {
                  text-align: left;
                }
                .divider {
                  border-top: 2px solid #AAAAAA;
                  margin: 3mm 0;
                }
                .header h2 {
                  margin: 2mm 0;
                  font-size: 12pt;
                  font-weight: bold;
                }
                .header div {
                  font-size: 14px;
                }
                .customer-info {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 2mm;
                  margin-bottom: 5mm;
                  font-size: 14px;
                }
                .customer-info div {
                  display: flex;
                }
                .customer-info strong {
                  min-width: 30mm;
                  display: inline-block;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 5mm;
                  font-size: 14px;
                  page-break-inside: avoid;
                }
                th, td {
                  border: 1px solid #000;
                  padding: 2mm;
                  text-align: left;
                }
                th {
                  background-color: #f0f0f0;
                  font-weight: bold;
                }
                .footer {
                  margin-top: 10mm;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                  font-size: 14px;
                }
                .footer-left {
                  text-align: left;
                }
                .footer-right {
                  text-align: right;
                }
                .qr-code {
                  width: 35mm;
                  height: 35mm;
                }
                .text-right {
                  text-align: right;
                }
                .text-left {
                  text-align: left;
                }
                .text-center {
                  text-align: center;
                }
                .note {
                  font-style: italic;
                  color: #666;
                  margin-bottom: 5mm;
                  text-align: center;
                }
                @media print {
                  body {
                    width: 190mm;
                    height: 277mm;
                  }
                  .no-print {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header-container">
                  <img src="${tvsLogo}" class="logo" alt="TVS Logo">
                  <div class="header-text"> GANDHI TVS</div>
                </div>
                <div class="header">
                  <div>
                    Authorised Main Dealer: TVS Motor Company Ltd.<br>
                    Registered office: 'JOGPREET' Asher Estate, Near Ichhamani Lawns,<br>
                    Upnagar, Nashik Road, Nashik - 422101<br>
                    Phone: 7498903672
                  </div>
                </div>
                <div class="divider"></div>
                <div class="customer-info">
                  <div><strong>Customer Name:</strong> ${ledgerData.customerDetails?.name || ''}</div>
                  <div><strong>Ledger Date:</strong> ${ledgerData.ledgerDate || new Date().toLocaleDateString('en-GB')}</div>
                  <div><strong>Customer Address:</strong> ${ledgerData.customerDetails?.address || ''}</div>
                  <div><strong>Customer Phone:</strong> ${ledgerData.customerDetails?.phone || ''}</div>
                  <div><strong>Chassis No:</strong> ${ledgerData.vehicleDetails?.chassisNo || ''}</div>
                  <div><strong>Engine No:</strong> ${ledgerData.vehicleDetails?.engineNo || ''}</div>
                  <div><strong>Finance Name:</strong> ${ledgerData.financeDetails?.financer || ''}</div>
                  <div><strong>Sale Executive:</strong> ${ledgerData.salesExecutive || ''}</div>
                </div>
                
                <table>
                  <thead>
                    <tr>
                      <th width="15%">Date</th>
                      <th width="35%">Description</th>
                      <th width="15%">Receipt/VC No</th>
                      <th width="10%" class="text-right">Credit (₹)</th>
                      <th width="10%" class="text-right">Debit (₹)</th>
                      <th width="15%" class="text-right">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      approvedEntries.length > 0
                        ? approvedEntries
                            .map(
                              (entry) => `
                          <tr>
                            <td>${entry.date}</td>
                            <td>${entry.description || ''}</td>
                            <td>${entry.receiptNo || ''}</td>
                            <td class="text-right">${entry.credit ? entry.credit.toLocaleString('en-IN') : '-'}</td>
                            <td class="text-right">${entry.debit ? entry.debit.toLocaleString('en-IN') : '-'}</td>
                            <td class="text-right">${entry.balance ? entry.balance.toLocaleString('en-IN') : '-'}</td>
                          </tr>
                        `
                            )
                            .join('')
                        : `<tr><td colspan="6" class="text-center">No approved entries found</td></tr>`
                    }
                    <tr>
                      <td colspan="3" class="text-left"><strong>Total</strong></td>
                      <td class="text-right"><strong>${totals.totalCredit.toLocaleString('en-IN')}</strong></td>
                      <td class="text-right"><strong>${totals.totalDebit.toLocaleString('en-IN')}</strong></td>
                      <td class="text-right"><strong>${totals.finalBalance.toLocaleString('en-IN')}</strong></td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="footer">
                  <div class="footer-left">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ledgerUrl)}" 
                         class="qr-code" 
                         alt="QR Code" />
                  </div>
                  <div class="footer-right">
                    <p>For, Gandhi TVS</p>
                    <p>Authorised Signatory</p>
                  </div>
                </div>
              </div>
              
              <script>
                window.onload = function() {
                  setTimeout(() => {
                    window.print();
                  }, 300);
                };
              </script>
            </body>
          </html>
        `);
    } catch (err) {
      console.error('Error fetching ledger:', err);
      setError('Failed to load ledger. Please try again.');
    }
  };

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
                  <option key={subMode.id} value={subMode.id}>
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
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">{renderPaymentSpecificFields()}</CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <label className="form-label">Refund Reason</label>
                <CFormInput type="text" name="refundReason" value={formData.refundReason} onChange={handleChange} />
              </CCol>
              <CCol md={6}>
                <label className="form-label">Reference Number</label>
                <CFormInput type="text" name="transactionReference" value={formData.transactionReference} onChange={handleChange} />
              </CCol>
            </CRow>
            <CRow>
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
            <CButton color="info" variant="outline" onClick={handleViewLedger}>
              View Ledger
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

export default RefundModel;
