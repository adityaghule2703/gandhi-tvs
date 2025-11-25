import React, { useState, useEffect } from 'react';
import '../../../css/invoice.css';
import '../../../css/table.css';
import '../../../css/form.css';
import { 
  CNav, 
  CNavItem, 
  CNavLink, 
  CTabContent, 
  CTabPane,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge
} from '@coreui/react';
import { axiosInstance, getDefaultSearchFields, SearchOutlinedIcon, useTableFilter } from 'src/utils/tableImports';
import SubdealerReceiptModal from './SubdealerReceiptModel';
import { hasPermission } from 'src/utils/permissionUtils';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilMagnifyingGlass } from '@coreui/icons';

function SubdealerReceipts() {
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [completedSearchTerm, setCompletedSearchTerm] = useState('');

  const {
    data: pendingBookingsData,
    setData: setPendingBookingsData,
    filteredData: filteredPendingBookings,
    setFilteredData: setFilteredPendingBookings,
    handleFilter: handlePendingBookingsFilter
  } = useTableFilter([]);

  const {
    data: completedBookingsData,
    setData: setCompletedBookingsData,
    filteredData: filteredCompletedBookings,
    setFilteredData: setFilteredCompletedBookings,
    handleFilter: handleCompletedBookingsFilter
  } = useTableFilter([]);

  const {
    data: ledgerData,
    setData: setLedgerData,
    filteredData: filteredLedger,
    setFilteredData: setFilteredLedger,
    handleFilter: handleLedgerFilter
  } = useTableFilter([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/bookings`);
      const bookings = response.data.data.bookings.filter(
        (booking) => booking.bookingType === 'SUBDEALER' && booking.payment.type === 'FINANCE'
      );
      setAllBookings(bookings);

      const pendingBookings = bookings.filter((booking) => booking.balanceAmount !== 0);
      setPendingBookingsData(pendingBookings);
      setFilteredPendingBookings(pendingBookings);

      const completedBookings = bookings.filter((booking) => booking.balanceAmount === 0);
      setCompletedBookingsData(completedBookings);
      setFilteredCompletedBookings(completedBookings);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    try {
      const response = await axiosInstance.get(`/ledger/summary/branch`);
      setLedgerData(response.data.data.byBranch);
      setFilteredLedger(response.data.data.byBranch);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  const handleAddClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handlePendingSearch = (searchValue) => {
    setPendingSearchTerm(searchValue);
    handlePendingBookingsFilter(searchValue, getDefaultSearchFields('booking'));
  };

  const handleCompletedSearch = (searchValue) => {
    setCompletedSearchTerm(searchValue);
    handleCompletedBookingsFilter(searchValue, getDefaultSearchFields('booking'));
  };

  return (
    <div>
      <div className='title'>Subdealer Receipts</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header'>
          <CNav variant="tabs" role="tablist" className="border-0">
            <CNavItem>
              <CNavLink
                active={activeTab === 0}
                onClick={() => setActiveTab(0)}
                className={`fw-bold ${activeTab === 0 ? 'text-primary' : 'text-muted'}`}
              >
                Pending Payment
                <CBadge color="warning" className="ms-2">
                  {pendingBookingsData.length}
                </CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 1}
                onClick={() => setActiveTab(1)}
                className={`fw-bold ${activeTab === 1 ? 'text-primary' : 'text-muted'}`}
              >
                Complete Payment
                <CBadge color="success" className="ms-2">
                  {completedBookingsData.length}
                </CBadge>
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>
        
        <CCardBody>
          <CTabContent>
            <CTabPane visible={activeTab === 0} className="p-0">
              <div className="d-flex justify-content-between mb-3">
                <div></div>
                <div className='d-flex'>
                  <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
                  <CFormInput
                    type="text"
                    className="d-inline-block square-search"
                    value={pendingSearchTerm}
                    onChange={(e) => handlePendingSearch(e.target.value)}
                    placeholder="Search pending bookings..."
                  />
                </div>
              </div>
              
              <div className="responsive-table-wrapper">
                <CTable striped bordered hover className='responsive-table'>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Sr.no</CTableHeaderCell>
                      <CTableHeaderCell>Booking ID</CTableHeaderCell>
                      <CTableHeaderCell>Model Name</CTableHeaderCell>
                      <CTableHeaderCell>Booking Date</CTableHeaderCell>
                      <CTableHeaderCell>Customer Name</CTableHeaderCell>
                      <CTableHeaderCell>Chassis Number</CTableHeaderCell>
                      <CTableHeaderCell>Total</CTableHeaderCell>
                      <CTableHeaderCell>Received</CTableHeaderCell>
                      <CTableHeaderCell>Balance</CTableHeaderCell>
                      {hasPermission('FINANCE_DISBURSEMENT', 'CREATE') && <CTableHeaderCell>Action</CTableHeaderCell>}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredPendingBookings.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={hasPermission('FINANCE_DISBURSEMENT', 'CREATE') ? "10" : "9"} className="text-center">
                          {pendingSearchTerm ? 'No matching pending bookings found' : 'No pending bookings available'}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      filteredPendingBookings.map((booking, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{booking.bookingNumber}</CTableDataCell>
                          <CTableDataCell>{booking.model?.model_name || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : ''}</CTableDataCell>
                          <CTableDataCell>{booking.customerDetails?.name || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{booking.chassisNumber || 'N/A'}</CTableDataCell>
                          <CTableDataCell>₹{booking.discountedAmount || '0'}</CTableDataCell>
                          <CTableDataCell>₹{booking.receivedAmount || '0'}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="warning">₹{booking.balanceAmount || '0'}</CBadge>
                          </CTableDataCell>
                          {hasPermission('FINANCE_DISBURSEMENT', 'CREATE') && (
                            <CTableDataCell>
                              <CButton 
                                size="sm" 
                                color="primary"
                                className="action-btn"
                                onClick={() => handleAddClick(booking)}
                              >
                                <CIcon icon={cilPlus} className='icon'/> Add
                              </CButton>
                            </CTableDataCell>
                          )}
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CTabPane>
            
            <CTabPane visible={activeTab === 1} className="p-0">
              <div className="d-flex justify-content-between mb-3">
                <div></div>
                <div className='d-flex'>
                  <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
                  <CFormInput
                    type="text"
                    className="d-inline-block square-search"
                    value={completedSearchTerm}
                    onChange={(e) => handleCompletedSearch(e.target.value)}
                    placeholder="Search completed payments..."
                  />
                </div>
              </div>
              
              <div className="responsive-table-wrapper">
                <CTable striped bordered hover className='responsive-table'>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Sr.no</CTableHeaderCell>
                      <CTableHeaderCell>Booking ID</CTableHeaderCell>
                      <CTableHeaderCell>Model Name</CTableHeaderCell>
                      <CTableHeaderCell>Booking Date</CTableHeaderCell>
                      <CTableHeaderCell>Customer Name</CTableHeaderCell>
                      <CTableHeaderCell>Chassis Number</CTableHeaderCell>
                      <CTableHeaderCell>Total</CTableHeaderCell>
                      <CTableHeaderCell>Received</CTableHeaderCell>
                      <CTableHeaderCell>Balance</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredCompletedBookings.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="9" className="text-center">
                          {completedSearchTerm ? 'No matching completed payments found' : 'No completed payments available'}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      filteredCompletedBookings.map((booking, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{booking.bookingNumber}</CTableDataCell>
                          <CTableDataCell>{booking.model?.model_name || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : ''}</CTableDataCell>
                          <CTableDataCell>{booking.customerDetails?.name || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{booking.chassisNumber || 'N/A'}</CTableDataCell>
                          <CTableDataCell>₹{booking.discountedAmount || '0'}</CTableDataCell>
                          <CTableDataCell>₹{booking.receivedAmount || '0'}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="success">₹{booking.balanceAmount || '0'}</CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>

      <SubdealerReceiptModal show={showModal} onClose={() => setShowModal(false)} bookingData={selectedBooking} />
    </div>
  );
}

export default SubdealerReceipts;