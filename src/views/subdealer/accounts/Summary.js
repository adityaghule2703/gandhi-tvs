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
  CFormInput,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CCol,
  CRow
} from '@coreui/react';
import { axiosInstance, getDefaultSearchFields, SearchOutlinedIcon, useTableFilter, usePagination } from 'src/utils/tableImports';
import CIcon from '@coreui/icons-react';
import { cilMagnifyingGlass } from '@coreui/icons';

function Summary() {
  const [activeTab, setActiveTab] = useState(0);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [subdealerSearchTerm, setSubdealerSearchTerm] = useState('');
  const [completeSearchTerm, setCompleteSearchTerm] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');

  const {
    data: bookingsData,
    setData: setBookingsData,
    filteredData: filteredBookings,
    setFilteredData: setFilteredBookings,
    handleFilter: handleBookingsFilter
  } = useTableFilter([]);

  const {
    data: subdealerData,
    setData: setSubdealerData,
    filteredData: filteredSubdealer,
    setFilteredData: setFilteredSubdealer,
    handleFilter: handleSubdealerFilter
  } = useTableFilter([]);

  const [completePayments, setCompletePayments] = useState([]);
  const [filteredCompletePayments, setFilteredCompletePayments] = useState([]);

  const [pendingPayments, setPendingPayments] = useState([]);
  const [filteredPendingPayments, setFilteredPendingPayments] = useState([]);

  const { currentRecords: currentCustomerRecords, PaginationOptions: CustomerPaginationOptions } = usePagination(filteredBookings);
  const { currentRecords: currentSubdealerRecords, PaginationOptions: SubdealerPaginationOptions } = usePagination(filteredSubdealer);
  const { currentRecords: currentCompleteRecords, PaginationOptions: CompletePaginationOptions } = usePagination(filteredCompletePayments);
  const { currentRecords: currentPendingRecords, PaginationOptions: PendingPaginationOptions } = usePagination(filteredPendingPayments);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/bookings`);
      const subdealerBookings = response.data.data.bookings.filter((booking) => booking.bookingType === 'SUBDEALER');

      setBookingsData(subdealerBookings);
      setFilteredBookings(subdealerBookings);

      const complete = subdealerBookings.filter((booking) => parseFloat(booking.balanceAmount || 0) === 0);
      setCompletePayments(complete);
      setFilteredCompletePayments(complete);

      const pending = subdealerBookings.filter((booking) => parseFloat(booking.balanceAmount || 0) !== 0);
      setPendingPayments(pending);
      setFilteredPendingPayments(pending);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchSubdealerData();
  }, []);

  const fetchSubdealerData = async () => {
    try {
      const response = await axiosInstance.get(`/subdealers/financials/all`);
      setSubdealerData(response.data.data.subdealers);
      setFilteredSubdealer(response.data.data.subdealers);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  const handleCustomerSearch = (searchValue) => {
    setCustomerSearchTerm(searchValue);
    handleBookingsFilter(searchValue, getDefaultSearchFields('booking'));
  };

  const handleSubdealerSearch = (searchValue) => {
    setSubdealerSearchTerm(searchValue);
    handleSubdealerFilter(searchValue, getDefaultSearchFields('subdealer'));
  };

  const handleCompleteSearch = (searchValue) => {
    setCompleteSearchTerm(searchValue);
    const filtered = completePayments.filter(booking => 
      getDefaultSearchFields('booking').some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], booking);
        return String(value || '').toLowerCase().includes(searchValue.toLowerCase());
      })
    );
    setFilteredCompletePayments(filtered);
  };

  const handlePendingSearch = (searchValue) => {
    setPendingSearchTerm(searchValue);
    const filtered = pendingPayments.filter(booking => 
      getDefaultSearchFields('booking').some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], booking);
        return String(value || '').toLowerCase().includes(searchValue.toLowerCase());
      })
    );
    setFilteredPendingPayments(filtered);
  };

  const getTotalSummary = () => {
    const totalBookings = bookingsData.length;
    const totalComplete = completePayments.length;
    const totalPending = pendingPayments.length;
    const totalSubdealers = subdealerData.length;

    return { totalBookings, totalComplete, totalPending, totalSubdealers };
  };

  const summary = getTotalSummary();

  return (
    <div>
      <div className='title'>Summary Dashboard</div>
      
      {/* Summary Cards */}
      <CRow className="mb-4">
        <CCol md={3}>
          <CCard className="text-center bg-primary text-white">
            <CCardBody>
              <h4>{summary.totalBookings}</h4>
              <p>Total Bookings</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard className="text-center bg-success text-white">
            <CCardBody>
              <h4>{summary.totalComplete}</h4>
              <p>Complete Payments</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard className="text-center bg-warning text-white">
            <CCardBody>
              <h4>{summary.totalPending}</h4>
              <p>Pending Payments</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={3}>
          <CCard className="text-center bg-info text-white">
            <CCardBody>
              <h4>{summary.totalSubdealers}</h4>
              <p>Total Subdealers</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header'>
          <CNav variant="tabs" role="tablist" className="border-0">
            <CNavItem>
              <CNavLink
                active={activeTab === 0}
                onClick={() => setActiveTab(0)}
                className={`fw-bold ${activeTab === 0 ? 'text-primary' : 'text-muted'}`}
              >
                Customer
                <CBadge color="primary" className="ms-2">
                  {bookingsData.length}
                </CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 1}
                onClick={() => setActiveTab(1)}
                className={`fw-bold ${activeTab === 1 ? 'text-primary' : 'text-muted'}`}
              >
                Sub Dealer
                <CBadge color="info" className="ms-2">
                  {subdealerData.length}
                </CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 2}
                onClick={() => setActiveTab(2)}
                className={`fw-bold ${activeTab === 2 ? 'text-primary' : 'text-muted'}`}
              >
                Complete Payment
                <CBadge color="success" className="ms-2">
                  {completePayments.length}
                </CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 3}
                onClick={() => setActiveTab(3)}
                className={`fw-bold ${activeTab === 3 ? 'text-primary' : 'text-muted'}`}
              >
                Pending List
                <CBadge color="warning" className="ms-2">
                  {pendingPayments.length}
                </CBadge>
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>
        
        <CCardBody>
          <CTabContent>
            {/* Customer Tab */}
            <CTabPane visible={activeTab === 0} className="p-0">
              <div className="d-flex justify-content-between mb-3">
                <div></div>
                <div className='d-flex'>
                  <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
                  <CFormInput
                    type="text"
                    className="d-inline-block square-search"
                    value={customerSearchTerm}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
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
                    {currentCustomerRecords.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="9" className="text-center">
                          {customerSearchTerm ? 'No matching bookings found' : 'No bookings available'}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      currentCustomerRecords.map((booking, index) => (
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
                            <CBadge color={booking.balanceAmount === 0 ? 'success' : 'warning'}>
                              ₹{booking.balanceAmount || '0'}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </div>
              
              <div className="d-flex justify-content-center mt-3">
                <CustomerPaginationOptions />
              </div>
            </CTabPane>

            {/* Sub Dealer Tab */}
            <CTabPane visible={activeTab === 1} className="p-0">
              <div className="d-flex justify-content-between mb-3">
                <div></div>
                <div className='d-flex'>
                  <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
                  <CFormInput
                    type="text"
                    className="d-inline-block square-search"
                    value={subdealerSearchTerm}
                    onChange={(e) => handleSubdealerSearch(e.target.value)}
                    placeholder="Search subdealers..."
                  />
                </div>
              </div>
              
              <div className="responsive-table-wrapper">
                <CTable striped bordered hover className='responsive-table'>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Sr.no</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Total Bookings</CTableHeaderCell>
                      <CTableHeaderCell>Total Amount</CTableHeaderCell>
                      <CTableHeaderCell>Total Received</CTableHeaderCell>
                      <CTableHeaderCell>Total Balance</CTableHeaderCell>
                      <CTableHeaderCell>OnAccount Balance</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentSubdealerRecords.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center">
                          {subdealerSearchTerm ? 'No matching subdealers found' : 'No subdealers available'}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      currentSubdealerRecords.map((subdealer, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{subdealer.name}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="primary">{subdealer.financials?.bookingSummary?.totalBookings || '0'}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>₹{subdealer.financials?.bookingSummary?.totalBookingAmount || '0'}</CTableDataCell>
                          <CTableDataCell>₹{subdealer.financials?.bookingSummary?.totalReceivedAmount || '0'}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="warning">₹{subdealer.financials?.bookingSummary?.totalBalanceAmount || '0'}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color="info">₹{subdealer.financials?.onAccountSummary?.totalBalance || '0'}</CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </div>
              
              <div className="d-flex justify-content-center mt-3">
                <SubdealerPaginationOptions />
              </div>
            </CTabPane>

            {/* Complete Payment Tab */}
            <CTabPane visible={activeTab === 2} className="p-0">
              <div className="d-flex justify-content-between mb-3">
                <div></div>
                <div className='d-flex'>
                  <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
                  <CFormInput
                    type="text"
                    className="d-inline-block square-search"
                    value={completeSearchTerm}
                    onChange={(e) => handleCompleteSearch(e.target.value)}
                    placeholder="Search complete payments..."
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
                    {currentCompleteRecords.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="9" className="text-center">
                          {completeSearchTerm ? 'No matching complete payments found' : 'No complete payments available'}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      currentCompleteRecords.map((booking, index) => (
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
              
              <div className="d-flex justify-content-center mt-3">
                <CompletePaginationOptions />
              </div>
            </CTabPane>

            {/* Pending List Tab */}
            <CTabPane visible={activeTab === 3} className="p-0">
              <div className="d-flex justify-content-between mb-3">
                <div></div>
                <div className='d-flex'>
                  <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
                  <CFormInput
                    type="text"
                    className="d-inline-block square-search"
                    value={pendingSearchTerm}
                    onChange={(e) => handlePendingSearch(e.target.value)}
                    placeholder="Search pending payments..."
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
                    {currentPendingRecords.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="9" className="text-center">
                          {pendingSearchTerm ? 'No matching pending payments found' : 'No pending payments available'}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      currentPendingRecords.map((booking, index) => (
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
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </div>
              
              <div className="d-flex justify-content-center mt-3">
                <PendingPaginationOptions />
              </div>
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </div>
  );
}

export default Summary;