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
import { axiosInstance, getDefaultSearchFields, showError, showSuccess } from '../../../utils/tableImports';
import '../../../css/invoice.css';
import '../../../css/table.css';
import { confirmVerify } from '../../../utils/sweetAlerts';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilZoomOut, cilCheckCircle } from '@coreui/icons';

function PaymentVerification() {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingPaymentsData, setPendingPaymentsData] = useState([]);
  const [verifiedPaymentsData, setVerifiedPaymentsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalRecords: 0
  });

  useEffect(() => {
    fetchPendingPayments();
    fetchVerifiedPayments();
  }, []);

  const fetchPendingPayments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/broker-ledger/pending-on-account-payments?page=${page}`);
      setPendingPaymentsData(response.data.data.pendingOnAccountPayments || []);
      setPagination(
        response.data.data.pagination || {
          current: 1,
          total: 1,
          count: 0,
          totalRecords: 0
        }
      );
    } catch (error) {
      console.log('Error fetching pending payments', error);
      setPendingPaymentsData([]);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedPayments = async () => {
    try {
      const response = await axiosInstance.get(`/subdealersonaccount/on-account/receipts/approved`);
      setVerifiedPaymentsData(response.data.data.approvedPayments || []);
    } catch (error) {
      console.log('Error fetching verified payments', error);
      setVerifiedPaymentsData([]);
    }
  };

  const filterData = (data, searchTerm) => {
    if (!searchTerm || !data) return data || [];

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

  const filteredPendingLedgerEntries = filterData(pendingPaymentsData, searchTerm);
  const filteredVerifiedLedgerEntries = filterData(verifiedPaymentsData, searchTerm);

  const handleVerifyPayment = async (entry) => {
    try {
      const result = await confirmVerify({
        title: 'Confirm Payment Verification',
        text: `Are you sure you want to verify the payment of ₹${entry.amount || 0}?`,
        confirmButtonText: 'Yes, verify it!'
      });

      if (result.isConfirmed) {
        await axiosInstance.patch(`/broker-ledger/approve-on-account/${entry.broker._id}/${entry.branch._id}/${entry._id}`, {
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total) {
      fetchPendingPayments(newPage);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleResetSearch = () => {
    setSearchTerm('');
  };

  const renderPendingTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Broker Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Mobile</CTableHeaderCell>
              <CTableHeaderCell scope="col">Email</CTableHeaderCell>
              <CTableHeaderCell scope="col">Branch</CTableHeaderCell>
              <CTableHeaderCell scope="col">Reference Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Payment Mode</CTableHeaderCell>
              <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
              <CTableHeaderCell scope="col">Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredPendingLedgerEntries.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="11" style={{ color: 'red', textAlign: 'center' }}>
                  {searchTerm ? 'No matching pending payments found' : 'No pending payments available'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredPendingLedgerEntries.map((entry, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{(pagination.current - 1) * 10 + index + 1}</CTableDataCell>
                  <CTableDataCell>{entry.broker?.name || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{entry.broker?.mobile || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{entry.broker?.email || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{entry.branch?.name || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{entry.referenceNumber || 'N/A'}</CTableDataCell>
                  <CTableDataCell>
                    {entry.modeOfPayment || 'N/A'}
                    {entry.subPaymentMode ? ` (${entry.subPaymentMode.payment_mode})` : ''}
                  </CTableDataCell>
                  <CTableDataCell>₹{entry.amount ? entry.amount.toLocaleString('en-IN') : '0'}</CTableDataCell>
                  <CTableDataCell>{entry.date ? new Date(entry.date).toLocaleDateString('en-GB') : 'N/A'}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="danger" shape="rounded-pill">
                      PENDING
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton 
                      size="sm" 
                      className="action-btn"
                      onClick={() => handleVerifyPayment(entry)} 
                      title="Verify Payment"
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

        {/* Pagination Controls */}
        {pagination.total > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              Showing {(pagination.current - 1) * 10 + 1} to {(pagination.current - 1) * 10 + filteredPendingLedgerEntries.length} of{' '}
              {pagination.totalRecords} entries
            </div>
            <div>
              <CButton
                size="sm"
                color="outline-primary"
                className="me-2"
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
              >
                Previous
              </CButton>
              <span className="mx-2">
                Page {pagination.current} of {pagination.total}
              </span>
              <CButton
                size="sm"
                color="outline-primary"
                className="ms-2"
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.total}
              >
                Next
              </CButton>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVerifiedTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Broker Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">REF Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Bank</CTableHeaderCell>
              <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
              <CTableHeaderCell scope="col">Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Verified By</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredVerifiedLedgerEntries.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="7" style={{ color: 'red', textAlign: 'center' }}>
                  {searchTerm ? 'No matching verified payments found' : 'No verified payments available'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredVerifiedLedgerEntries.map((entry, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{entry.subdealer?.name || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{entry.refNumber || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{entry.bank?.name || 'N/A'}</CTableDataCell>
                  <CTableDataCell>₹{entry.amount ? entry.amount.toLocaleString('en-IN') : '0'}</CTableDataCell>
                  <CTableDataCell>{entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString('en-GB') : 'N/A'}</CTableDataCell>
                  <CTableDataCell>{entry.approvedBy?.name || 'N/A'}</CTableDataCell>
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
      <div className='title'>Payment Verification</div>
      
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
                Pending Verification
                <CBadge color="danger" shape="rounded-pill" className="ms-2">
                  {pagination.totalRecords}
                </CBadge>
              </CNavLink>
            </CNavItem>
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
                Verified Payments
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
              {renderPendingTable()}
            </CTabPane>
            <CTabPane visible={activeTab === 1}>
              {renderVerifiedTable()}
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </div>
  );
}

export default PaymentVerification;