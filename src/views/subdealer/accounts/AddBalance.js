import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CSpinner,
  CAlert,
  CBadge,
  CFormTextarea,
  CInputGroup
} from '@coreui/react';
import axiosInstance from 'src/axiosInstance';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilCheckCircle, cilSearch } from '@coreui/icons';

function SubdealerCustomerManagement() {
  const [subdealers, setSubdealers] = useState([]);
  const [selectedSubdealer, setSelectedSubdealer] = useState('');
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subdealerData, setSubdealerData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [visible, setVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    remark: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubdealers = async () => {
      try {
        const response = await axiosInstance.get('/subdealers');
        setSubdealers(response.data.data.subdealers || []);
      } catch (error) {
        console.error('Error fetching subdealers:', error);
        setError('Failed to load subdealers');
      }
    };

    fetchSubdealers();
  }, []);

  useEffect(() => {
    if (selectedSubdealer) {
      fetchSubdealerFinancialSummary();
      fetchSubdealerReceipts();
    } else {
      setBookings([]);
      setFilteredBookings([]);
      setReceipts([]);
      setSubdealerData(null);
      setSelectedReceipt('');
      setSearchTerm('');
    }
  }, [selectedSubdealer]);

  useEffect(() => {
    // Filter bookings based on search term and zero balance
    if (bookings.length > 0) {
      let filtered = bookings.filter((booking) => booking.balanceAmount != 0);

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (booking) => booking.customerDetails.name.toLowerCase().includes(term) || booking.bookingNumber.toLowerCase().includes(term)
        );
      }

      setFilteredBookings(filtered);
    } else {
      setFilteredBookings([]);
    }
  }, [bookings, searchTerm]);

  const fetchSubdealerFinancialSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get(`/subdealers/${selectedSubdealer}/financial-summary`);
      setSubdealerData(response.data.data);
      setBookings(response.data.data.recentTransactions || []);
    } catch (error) {
      console.error('Error fetching subdealer financial summary:', error);
      setError('Failed to load financial data for this subdealer');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubdealerReceipts = async () => {
    try {
      const response = await axiosInstance.get(`/subdealersonaccount/${selectedSubdealer}/on-account/receipts`);
      setReceipts(response.data.docs || []);
    } catch (error) {
      console.error('Error fetching subdealer receipts:', error);
      setError('Failed to load receipt data');
    }
  };

  const handleSubdealerChange = (e) => {
    setSelectedSubdealer(e.target.value);
    setSelectedReceipt('');
  };

  const handleReceiptChange = (e) => {
    setSelectedReceipt(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const openAddModal = (booking) => {
    setSelectedBooking(booking);
    setPaymentData({
      amount: '',
      remark: ''
    });
    setVisible(true);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitPayment = async () => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      setError('Valid amount is required');
      return;
    }

    if (!selectedReceipt) {
      setError('Please select a UTR receipt first');
      return;
    }

    if (!selectedBooking || !selectedBooking._id) {
      setError('Booking information is missing');
      return;
    }

    if (parseFloat(paymentData.amount) > getRemainingAmount(selectedReceipt)) {
      setError('Amount cannot exceed the remaining amount of the selected UTR');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        allocations: [
          {
            bookingId: selectedBooking._id,
            amount: parseFloat(paymentData.amount),
            remark: paymentData.remark || ''
          }
        ]
      };

      await axiosInstance.post(`/subdealersonaccount/receipts/${selectedReceipt}/allocate`, payload);

      setSuccess('Payment allocated successfully!');
      setVisible(false);

      fetchSubdealerFinancialSummary();
      fetchSubdealerReceipts();
    } catch (error) {
      console.error('Error allocating payment:', error);
      setError('Failed to allocate payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getRemainingAmount = (receiptId) => {
    const receipt = receipts.find((r) => r._id === receiptId);
    if (!receipt) return 0;
    return receipt.amount - receipt.allocatedTotal;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING_APPROVAL: { color: 'warning', text: 'Pending' },
      APPROVED: { color: 'success', text: 'Approved' },
      ALLOCATED: { color: 'info', text: 'Allocated' }
    };

    const config = statusConfig[status] || { color: 'secondary', text: status };
    return <CBadge color={config.color}>{config.text}</CBadge>;
  };

  return (
    <div>
      <h4>Distribute OnAccount Balance</h4>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <h5>Subdealer Booking Management</h5>
            </CCardHeader>
            <CCardBody>
              {error && (
                <CAlert color="danger" dismissible onClose={() => setError('')}>
                  {error}
                </CAlert>
              )}

              {success && (
                <CAlert color="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </CAlert>
              )}

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel htmlFor="subdealerSelect">Select Subdealer</CFormLabel>
                  <CFormSelect id="subdealerSelect" value={selectedSubdealer} onChange={handleSubdealerChange}>
                    <option value="">-- Select Subdealer --</option>
                    {subdealers.map((subdealer) => (
                      <option key={subdealer._id} value={subdealer._id}>
                        {subdealer.name} - {subdealer.location}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="receiptSelect">Select UTR/Receipt</CFormLabel>
                  <CFormSelect id="receiptSelect" value={selectedReceipt} onChange={handleReceiptChange} disabled={!selectedSubdealer}>
                    <option value="">-- Select UTR/Receipt --</option>
                    {receipts.map((receipt) => {
                      const remainingAmount = receipt.amount - receipt.allocatedTotal;
                      return (
                        <option key={receipt._id} value={receipt._id} disabled={remainingAmount <= 0}>
                          {receipt.refNumber} - ₹{remainingAmount.toLocaleString()} remaining
                        </option>
                      );
                    })}
                  </CFormSelect>
                  <small className="text-muted">Select a UTR to allocate payments against available funds</small>
                </CCol>
              </CRow>

              {subdealerData && (
                <CCard className="mb-4">
                  <CCardHeader>
                    <h6>Subdealer Summary: {subdealerData.subdealer.name}</h6>
                  </CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol md={3}>
                        <strong>Total Bookings:</strong> {subdealerData.bookingSummary.totalBookings}
                      </CCol>
                      <CCol md={3}>
                        <strong>Total Amount:</strong> ₹{subdealerData.bookingSummary.totalBookingAmount.toLocaleString()}
                      </CCol>
                      <CCol md={3}>
                        <strong>Received:</strong> ₹{subdealerData.bookingSummary.totalReceivedAmount.toLocaleString()}
                      </CCol>
                      <CCol md={3}>
                        <strong>Remaining:</strong> ₹{subdealerData.financialOverview.totalOutstanding.toLocaleString()}
                      </CCol>
                    </CRow>
                    {receipts.length > 0 && (
                      <CRow className="mt-3">
                        <CCol>
                          <strong>OnAccount Balance:</strong> ₹
                          {receipts.reduce((sum, receipt) => sum + (receipt.amount - receipt.allocatedTotal), 0).toLocaleString()}
                        </CCol>
                      </CRow>
                    )}
                  </CCardBody>
                </CCard>
              )}

              {!loading && selectedSubdealer && (
                <CRow className="mb-3">
                  <CCol md={4}>
                    <CInputGroup>
                      <CFormInput
                        placeholder="Search by customer name or booking number..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                      <CButton type="button" color="secondary">
                        <CIcon icon={cilSearch} style={{ height: '25px' }} />
                      </CButton>
                    </CInputGroup>
                    <small className="text-muted">Showing only NPF customers</small>
                  </CCol>
                </CRow>
              )}

              {loading && (
                <div className="text-center">
                  <CSpinner />
                  <p>Loading booking data...</p>
                </div>
              )}

              {!loading && selectedSubdealer && filteredBookings.length > 0 && (
                <CTable striped hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Booking #</CTableHeaderCell>
                      <CTableHeaderCell>Customer Name</CTableHeaderCell>
                      <CTableHeaderCell>Total Amount (₹)</CTableHeaderCell>
                      <CTableHeaderCell>Received (₹)</CTableHeaderCell>
                      <CTableHeaderCell>Balance (₹)</CTableHeaderCell>
                      <CTableHeaderCell>Date</CTableHeaderCell>
                      <CTableHeaderCell>Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredBookings.map((booking, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{booking.bookingNumber}</CTableDataCell>
                        <CTableDataCell>{booking.customerDetails.name}</CTableDataCell>
                        <CTableDataCell>₹{booking.totalAmount.toLocaleString()}</CTableDataCell>
                        <CTableDataCell>₹{booking.receivedAmount.toLocaleString()}</CTableDataCell>
                        <CTableDataCell>₹{booking.balanceAmount.toLocaleString()}</CTableDataCell>
                        <CTableDataCell>{new Date(booking.createdAt).toLocaleDateString()}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="primary"
                            size="sm"
                            onClick={() => openAddModal(booking)}
                            disabled={!selectedReceipt}
                            title={!selectedReceipt ? 'Please select a UTR first' : 'Add payment'}
                          >
                            <CIcon icon={cilPlus} style={{ height: '15px' }} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}

              {!loading && selectedSubdealer && filteredBookings.length === 0 && (
                <div className="text-center py-4">
                  <p>
                    {searchTerm
                      ? `No bookings found with zero balance matching "${searchTerm}"`
                      : 'No bookings found with zero balance for this subdealer.'}
                  </p>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* <CModal visible={visible} onClose={() => setVisible(false)}>
          <CModalHeader onClose={() => setVisible(false)}>
            <CModalTitle>Allocate Payment</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel>Customer Name</CFormLabel>
                <CFormInput type="text" value={selectedBooking?.customerDetails?.name || ''} disabled readOnly />
              </div>

              <div className="mb-3">
                <CFormLabel>Booking Number</CFormLabel>
                <CFormInput type="text" value={selectedBooking?.bookingNumber || ''} disabled readOnly />
              </div>

              <div className="mb-3">
                <CFormLabel>Booking ID</CFormLabel>
                <CFormInput type="text" value={selectedBooking?._id || ''} disabled readOnly />
                <small className="text-muted">This will be sent to the server for allocation</small>
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="amount">Amount to Allocate (₹)</CFormLabel>
                <CFormInput
                  type="number"
                  id="amount"
                  name="amount"
                  value={paymentData.amount}
                  onChange={handlePaymentChange}
                  placeholder="Enter amount"
                  required
                  min="0.01"
                  step="0.01"
                  max={selectedReceipt ? getRemainingAmount(selectedReceipt) : undefined}
                />
                {selectedReceipt && (
                  <small className="text-muted">Maximum allocatable amount: ₹{getRemainingAmount(selectedReceipt).toLocaleString()}</small>
                )}
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="remark">Remark (Optional)</CFormLabel>
                <CFormTextarea
                  id="remark"
                  name="remark"
                  value={paymentData.remark}
                  onChange={handlePaymentChange}
                  placeholder="Enter any remarks"
                  rows={3}
                />
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSubmitPayment} disabled={submitting}>
              {submitting ? (
                <>
                  <CSpinner component="span" size="sm" aria-hidden="true" />
                  Allocating...
                </>
              ) : (
                <>Allocate Payment</>
              )}
            </CButton>
          </CModalFooter>
        </CModal> */}
        <CModal visible={visible} onClose={() => setVisible(false)}>
          <CModalHeader onClose={() => setVisible(false)}>
            <CModalTitle>Allocate Payment</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel>Customer Name</CFormLabel>
                    <CFormInput type="text" value={selectedBooking?.customerDetails?.name || ''} disabled readOnly />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel>Booking Number</CFormLabel>
                    <CFormInput type="text" value={selectedBooking?.bookingNumber || ''} disabled readOnly />
                  </div>
                </CCol>
              </CRow>

              <div className="mb-3">
                <CFormLabel>Booking ID</CFormLabel>
                <CFormInput type="text" value={selectedBooking?._id || ''} disabled readOnly />
              </div>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="amount">Amount to Allocate (₹)</CFormLabel>
                    <CFormInput
                      type="number"
                      id="amount"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handlePaymentChange}
                      placeholder="Enter amount"
                      required
                      min="0.01"
                      step="0.01"
                      max={selectedReceipt ? getRemainingAmount(selectedReceipt) : undefined}
                    />
                    {selectedReceipt && <small className="text-muted">Max: ₹{getRemainingAmount(selectedReceipt).toLocaleString()}</small>}
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="remark">Remark (Optional)</CFormLabel>
                    <CFormInput
                      id="remark"
                      name="remark"
                      value={paymentData.remark}
                      onChange={handlePaymentChange}
                      placeholder="Enter any remarks"
                      rows={3}
                    />
                  </div>
                </CCol>
              </CRow>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSubmitPayment} disabled={submitting}>
              {submitting ? (
                <>
                  <CSpinner component="span" size="sm" aria-hidden="true" />
                  Allocating...
                </>
              ) : (
                <>Allocate Payment</>
              )}
            </CButton>
          </CModalFooter>
        </CModal>
      </CRow>
    </div>
  );
}

export default SubdealerCustomerManagement;
