import React, { useState, useEffect } from 'react';
import { 
  CBadge, 
  CNav, 
  CNavItem, 
  CNavLink, 
  CTabContent, 
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
  CSpinner,
  CFormLabel
} from '@coreui/react';
import { axiosInstance, getDefaultSearchFields, showError, showSuccess } from '../../utils/tableImports';
import '../../css/invoice.css';
import '../../css/table.css';
import ReceiptModal from './ReceiptModal';
import { confirmVerify } from '../../utils/sweetAlerts';
import { hasPermission } from '../../utils/permissionUtils';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilZoomOut, cilPlus, cilCheckCircle } from '@coreui/icons';

function Receipt() {
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingsData, setBookingsData] = useState([]);
  const [pendingPaymentsData, setPendingPaymentsData] = useState([]);
  const [verifiedPaymentsData, setVerifiedPaymentsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    fetchPendingPayments();
    fetchVerifiedPayments();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/bookings`);
      const branchBookings = response.data.data.bookings.filter((booking) => booking.bookingType === 'BRANCH');
      setBookingsData(branchBookings);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await axiosInstance.get(`/ledger/pending`);
      setPendingPaymentsData(response.data.data.ledgerEntries);
    } catch (error) {
      console.log('Error fetching pending payments', error);
    }
  };

  const fetchVerifiedPayments = async () => {
    try {
      const response = await axiosInstance.get(`/payment/verified/bank/ledger`);
      setVerifiedPaymentsData(response.data.data.ledgerEntries);
    } catch (error) {
      console.log('Error fetching verified payments', error);
    }
  };

  const filterData = (data, searchTerm) => {
    if (!searchTerm) return data;

    const searchFields = getDefaultSearchFields('receipts');
    const term = searchTerm.toLowerCase();

    return data.filter((row) =>
      searchFields.some((field) => {
        const value = field.split('.').reduce((obj, key) => {
          if (!obj) return '';
          if (key.match(/^\d+$/)) return obj[parseInt(key)];
          return obj[key];
        }, row);

        if (value === undefined || value === null) return false;

        if (typeof value === 'boolean') {
          return (value ? 'yes' : 'no').includes(term);
        }
        if (field === 'createdAt' && value instanceof Date) {
          return value.toLocaleDateString('en-GB').includes(term);
        }
        if (typeof value === 'number') {
          return String(value).includes(term);
        }
        return String(value).toLowerCase().includes(term);
      })
    );
  };

  const filteredBookings = filterData(bookingsData, searchTerm);
  const completePayments = filterData(
    bookingsData.filter((booking) => parseFloat(booking.balanceAmount || 0) === 0),
    searchTerm
  );
  const pendingPayments = filterData(
    bookingsData.filter((booking) => parseFloat(booking.balanceAmount || 0) !== 0),
    searchTerm
  );
  const filteredPendingLedgerEntries = filterData(pendingPaymentsData, searchTerm);
  const filteredVerifiedLedgerEntries = filterData(verifiedPaymentsData, searchTerm);

  const handleAddClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleVerifyPayment = async (entry) => {
    try {
      const result = await confirmVerify({
        title: 'Confirm Payment Verification',
        text: `Are you sure you want to verify the payment of ₹${entry.amount} for booking ${entry.bookingDetails.bookingNumber}?`,
        confirmButtonText: 'Yes, verify it!'
      });

      if (result.isConfirmed) {
        await axiosInstance.patch(`/ledger/approve/${entry._id}`, {
          remark: ''
        });
        await showSuccess('Payment verified successfully!');
        fetchPendingPayments();
        fetchVerifiedPayments();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      showError(error, 'Failed to verify payment');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleResetSearch = () => {
    setSearchTerm('');
  };

  const renderCustomerTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Model Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Customer Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Mobile Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Total</CTableHeaderCell>
              <CTableHeaderCell scope="col">Received</CTableHeaderCell>
              <CTableHeaderCell scope="col">Balance</CTableHeaderCell>
              {hasPermission('LEDGER', 'CREATE') && <CTableHeaderCell scope="col">Action</CTableHeaderCell>}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredBookings.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={hasPermission('LEDGER', 'CREATE') ? "11" : "10"} style={{ color: 'red', textAlign: 'center' }}>
                  {searchTerm ? 'No matching bookings found' : 'No booking available'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredBookings.map((booking, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{booking.bookingNumber}</CTableDataCell>
                  <CTableDataCell>{booking.model.model_name}</CTableDataCell>
                  <CTableDataCell>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : ' '}</CTableDataCell>
                  <CTableDataCell>{booking.customerDetails.name}</CTableDataCell>
                  <CTableDataCell>{booking.customerDetails.mobile1}</CTableDataCell>
                  <CTableDataCell>{booking.chassisNumber}</CTableDataCell>
                  <CTableDataCell>{booking.discountedAmount || '0'}</CTableDataCell>
                  <CTableDataCell>{booking.receivedAmount || '0'}</CTableDataCell>
                  <CTableDataCell>{booking.balanceAmount || '0'}</CTableDataCell>
                  {hasPermission('LEDGER', 'CREATE') && (
                    <CTableDataCell>
                      <CButton 
                        size="sm" 
                        className="action-btn"
                        onClick={() => handleAddClick(booking)}
                      >
                        Add
                      </CButton>
                    </CTableDataCell>
                  )}
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>
    );
  };

  const renderPaymentVerificationTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Payment Mode</CTableHeaderCell>
              <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
              <CTableHeaderCell scope="col">Transaction Reference</CTableHeaderCell>
              <CTableHeaderCell scope="col">Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredPendingLedgerEntries.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="8" style={{ color: 'red', textAlign: 'center' }}>
                  {searchTerm ? 'No matching pending payments found' : 'No pending payments available'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredPendingLedgerEntries.map((entry, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{entry.bookingDetails?.bookingNumber || ''}</CTableDataCell>
                  <CTableDataCell>{entry.paymentMode || ''}</CTableDataCell>
                  <CTableDataCell>{entry.amount || ''}</CTableDataCell>
                  <CTableDataCell>{entry.transactionReference || ''}</CTableDataCell>
                  <CTableDataCell>{entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString('en-GB') : ' '}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={entry.approvalStatus === 'Pending' ? 'danger' : 'success'} shape="rounded-pill">
                      {entry.approvalStatus === 'Pending' ? 'PENDING' : 'VERIFIED'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      className="action-btn"
                      onClick={() => handleVerifyPayment(entry)}
                      disabled={entry.approvalStatus !== 'Pending'}
                    >
                      <CIcon icon={cilCheckCircle} className="me-1" />
                      Verify
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>
    );
  };

  const renderCompletePaymentTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Model Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Customer Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Mobile Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Total</CTableHeaderCell>
              <CTableHeaderCell scope="col">Received</CTableHeaderCell>
              <CTableHeaderCell scope="col">Balance</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {completePayments.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="10" style={{ color: 'red', textAlign: 'center' }}>
                  {searchTerm ? 'No matching complete payments found' : 'No complete payments available'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              completePayments.map((booking, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{booking.bookingNumber || ''}</CTableDataCell>
                  <CTableDataCell>{booking.model.model_name}</CTableDataCell>
                  <CTableDataCell>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : ' '}</CTableDataCell>
                  <CTableDataCell>{booking.customerDetails.name}</CTableDataCell>
                  <CTableDataCell>{booking.customerDetails.mobile1}</CTableDataCell>
                  <CTableDataCell>{booking.chassisNumber || ''}</CTableDataCell>
                  <CTableDataCell>{booking.discountedAmount || '0'}</CTableDataCell>
                  <CTableDataCell>{booking.receivedAmount || '0'}</CTableDataCell>
                  <CTableDataCell style={{ color: 'green' }}>{booking.balanceAmount || '0'}</CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>
    );
  };

  const renderPendingListTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Model Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Customer Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Mobile Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Total</CTableHeaderCell>
              <CTableHeaderCell scope="col">Received</CTableHeaderCell>
              <CTableHeaderCell scope="col">Balance</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {pendingPayments.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="10" style={{ color: 'red', textAlign: 'center' }}>
                  {searchTerm ? 'No matching pending payments found' : 'No pending payments available'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              pendingPayments.map((booking, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{booking.bookingNumber || ''}</CTableDataCell>
                  <CTableDataCell>{booking.model.model_name}</CTableDataCell>
                  <CTableDataCell>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : ' '}</CTableDataCell>
                  <CTableDataCell>{booking.customerDetails.name}</CTableDataCell>
                  <CTableDataCell>{booking.customerDetails.mobile1}</CTableDataCell>
                  <CTableDataCell>{booking.chassisNumber || ''}</CTableDataCell>
                  <CTableDataCell>{booking.discountedAmount || '0'}</CTableDataCell>
                  <CTableDataCell>{booking.receivedAmount || '0'}</CTableDataCell>
                  <CTableDataCell style={{ color: 'red' }}>{booking.balanceAmount || '0'}</CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>
    );
  };

  const renderVerifiedListTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Customer Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Payment Mode</CTableHeaderCell>
              <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
              <CTableHeaderCell scope="col">Transaction Reference</CTableHeaderCell>
              <CTableHeaderCell scope="col">Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Verified By</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredVerifiedLedgerEntries.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="8" style={{ color: 'red', textAlign: 'center' }}>
                  {searchTerm ? 'No matching verified payments found' : 'No verified payments available'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredVerifiedLedgerEntries.map((entry, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{entry.booking || ''}</CTableDataCell>
                  <CTableDataCell>{entry.bookingDetails?.customerDetails?.name || ''}</CTableDataCell>
                  <CTableDataCell>{entry.paymentMode}</CTableDataCell>
                  <CTableDataCell>{entry.amount}</CTableDataCell>
                  <CTableDataCell>{entry.transactionReference}</CTableDataCell>
                  <CTableDataCell>{entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString('en-GB') : ' '}</CTableDataCell>
                  <CTableDataCell>{entry.receivedByDetails?.name || ''}</CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Receipt Management</div>
      
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            <CButton 
              size="sm" 
              className="action-btn me-1"
            >
              <CIcon icon={cilSearch} className='icon' /> Search
            </CButton>
            {searchTerm && (
              <CButton 
                size="sm" 
                color="secondary" 
                className="action-btn me-1"
                onClick={handleResetSearch}
              >
                <CIcon icon={cilZoomOut} className='icon' /> Reset Search
              </CButton>
            )}
          </div>
        </CCardHeader>
        
        <CCardBody>
          <CNav variant="tabs" className="mb-3 border-bottom">
            <CNavItem>
              <CNavLink
                active={activeTab === 0}
                onClick={() => handleTabChange(0)}
                style={{ 
                  cursor: 'pointer',
                  borderTop: activeTab === 0 ? '4px solid #2759a2' : '3px solid transparent',
                  color: 'black',
                  borderBottom: 'none'
                }}
              >
                Customer
              </CNavLink>
            </CNavItem>
            {hasPermission('LEDGER', 'VERIFY') && (
              <CNavItem>
                <CNavLink
                  active={activeTab === 1}
                  onClick={() => handleTabChange(1)}
                  style={{ 
                    cursor: 'pointer',
                    borderTop: activeTab === 1 ? '4px solid #2759a2' : '3px solid transparent',
                    borderBottom: 'none',
                    color: 'black'
                  }}
                >
                  Payment Verification
                </CNavLink>
              </CNavItem>
            )}
            <CNavItem>
              <CNavLink
                active={activeTab === 2}
                onClick={() => handleTabChange(2)}
                style={{ 
                  cursor: 'pointer',
                  borderTop: activeTab === 2 ? '4px solid #2759a2' : '3px solid transparent',
                  borderBottom: 'none',
                  color: 'black'
                }}
              >
                Complete Payment
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 3}
                onClick={() => handleTabChange(3)}
                style={{ 
                  cursor: 'pointer',
                  borderTop: activeTab === 3 ? '4px solid #2759a2' : '3px solid transparent',
                  borderBottom: 'none',
                  color: 'black'
                }}
              >
                Pending List
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 4}
                onClick={() => handleTabChange(4)}
                style={{ 
                  cursor: 'pointer',
                  borderTop: activeTab === 4 ? '4px solid #2759a2' : '3px solid transparent',
                  borderBottom: 'none',
                  color: 'black'
                }}
              >
                Verified List
              </CNavLink>
            </CNavItem>
          </CNav>

          <div className="d-flex justify-content-between mb-3">
            <div></div>
            <div className='d-flex'>
              <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
              <CFormInput
                type="text"
                style={{maxWidth: '350px', height: '30px', borderRadius: '0'}}
                className="d-inline-block square-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <CTabContent>
            <CTabPane visible={activeTab === 0}>
              {renderCustomerTable()}
            </CTabPane>
            <CTabPane visible={activeTab === 1}>
              {renderPaymentVerificationTable()}
            </CTabPane>
            <CTabPane visible={activeTab === 2}>
              {renderCompletePaymentTable()}
            </CTabPane>
            <CTabPane visible={activeTab === 3}>
              {renderPendingListTable()}
            </CTabPane>
            <CTabPane visible={activeTab === 4}>
              {renderVerifiedListTable()}
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>

      <ReceiptModal show={showModal} onClose={() => setShowModal(false)} bookingData={selectedBooking} />
    </div>
  );
}

export default Receipt;