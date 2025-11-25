import '../../../css/table.css';
import '../../../css/form.css';
import {
  React,
  useState,
  useEffect,
  Link,
  Menu,
  MenuItem,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  showError,
  axiosInstance,
  showSuccess
} from 'src/utils/tableImports';
import CIcon from '@coreui/icons-react';
import { cilCloudUpload, cilPrint, cilPlus } from '@coreui/icons';
import config from 'src/config.js';
import KYCView from 'src/views/sales/booking/KYCView';
import FinanceView from 'src/views/sales/booking/FinanceView';
import ViewBooking from 'src/views/sales/booking/BookingDetails';
import SubDealerChassisNumberModal from './SubdealerChassisModel';
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
  CTableDataCell
} from '@coreui/react';

const AllBooking = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState(''); // Added missing state

  // Data states for each tab
  const [allData, setAllData] = useState([]);
  const {
    data: pendingData,
    setData: setPendingData,
    filteredData: filteredPending,
    setFilteredData: setFilteredPending,
    handleFilter: handlePendingFilter
  } = useTableFilter([]);
  const {
    data: approvedData,
    setData: setApprovedData,
    filteredData: filteredApproved,
    setFilteredData: setFilteredApproved,
    handleFilter: handleApprovedFilter
  } = useTableFilter([]);
  const {
    data: allocatedData,
    setData: setAllocatedData,
    filteredData: filteredAllocated,
    setFilteredData: setFilteredAllocated,
    handleFilter: handleAllocatedFilter
  } = useTableFilter([]);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [kycModalVisible, setKycModalVisible] = useState(false);
  const [kycBookingId, setKycBookingId] = useState(null);
  const [kycData, setKycData] = useState(null);
  const [financeModalVisible, setFinanceModalVisible] = useState(false);
  const [financeBookingId, setFinanceBookingId] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [showChassisModal, setShowChassisModal] = useState(false);
  const [selectedBookingForChassis, setSelectedBookingForChassis] = useState(null);
  const [chassisLoading, setChassisLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState();
  const [isUpdateChassis, setIsUpdateChassis] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/bookings?bookingType=SUBDEALER`);
      const subdealerBookings = response.data.data.bookings.filter((booking) => booking.bookingType === 'SUBDEALER');

      setAllData(subdealerBookings);

      // Filter data for each tab
      const pendingBookings = subdealerBookings.filter(
        (booking) => booking.status === 'PENDING_APPROVAL' || booking.status === 'PENDING_APPROVAL (Discount_Exceeded)'
      );
      setPendingData(pendingBookings);
      setFilteredPending(pendingBookings);

      const approvedBookings = subdealerBookings.filter((booking) => booking.status === 'APPROVED');
      setApprovedData(approvedBookings);
      setFilteredApproved(approvedBookings);

      const allocatedBookings = subdealerBookings.filter((booking) => booking.status === 'ALLOCATED');
      setAllocatedData(allocatedBookings);
      setFilteredAllocated(allocatedBookings);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  const handleViewBooking = async (id) => {
    try {
      const response = await axiosInstance.get(`/bookings/${id}`);
      setSelectedBooking(response.data.data);
      setViewModalVisible(true);
      handleClose();
    } catch (error) {
      console.log('Error fetching booking details', error);
      showError('Failed to fetch booking details');
    }
  };

  const handleViewKYC = async (bookingId) => {
    try {
      console.log('Fetching KYC for booking ID:', bookingId);
      setKycBookingId(bookingId);
      const booking = allData.find((b) => b._id === bookingId);
      if (!booking) {
        showError('Booking not found');
        return;
      }
      const response = await axiosInstance.get(`/kyc/${bookingId}/documents`);
      console.log('KYC Response:', response.data);

      const kycDataWithStatus = {
        ...response.data.data,
        status: booking.documentStatus?.kyc?.status || 'PENDING',
        customerName: booking.customerDetails.name,
        address: `${booking.customerDetails.address}, ${booking.customerDetails.taluka}, ${booking.customerDetails.district}, ${booking.customerDetails.pincode}`,
        bookingType: 'SUBDEALER'
      };

      setKycData(kycDataWithStatus);
      setKycModalVisible(true);
      handleClose();
    } catch (error) {
      console.log('Error fetching KYC details', error);
      showError('Failed to fetch KYC details');
    }
  };

  const handleViewFinanceLetter = async (bookingId) => {
    try {
      setActionLoadingId(bookingId);
      setFinanceBookingId(bookingId);

      const booking = allData.find((b) => b._id === bookingId);
      if (!booking) {
        showError('Booking not found');
        return;
      }

      const financeDataWithStatus = {
        status: booking.documentStatus?.financeLetter?.status || 'PENDING',
        customerName: booking.customerDetails.name,
        bookingId: booking._id,
        bookingType: 'SUBDEALER'
      };

      setFinanceData(financeDataWithStatus);
      setFinanceModalVisible(true);
      handleClose();
    } catch (error) {
      console.log('Error viewing finance letter', error);
      showError(error.response?.data?.message || 'Failed to view finance letter');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateChassis = (bookingId) => {
    setSelectedBookingForChassis(bookingId);
    setIsUpdateChassis(true);
    setShowChassisModal(true);
    handleClose();
  };

  const handleAllocateChassis = async (bookingId) => {
    setSelectedBookingForChassis(bookingId);
    setShowChassisModal(true);
    handleClose();
  };

  const handleSaveChassisNumber = async (payload) => {
    try {
      setChassisLoading(true);

      let url = `/bookings/${selectedBookingForChassis}/allocate`;

      if (isUpdateChassis && payload.reason) {
        url += `?reason=${encodeURIComponent(payload.reason)}`;
      }

      const formData = new FormData();
      formData.append('chassisNumber', payload.chassisNumber);

      await axiosInstance.put(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showSuccess(`Chassis number ${isUpdateChassis ? 'updated' : 'allocated'} successfully!`);
      fetchData();
      setShowChassisModal(false);
      setIsUpdateChassis(false);
    } catch (error) {
      console.error(`Error ${isUpdateChassis ? 'updating' : 'allocating'} chassis number:`, error);
      showError(error.response?.data?.message || `Failed to ${isUpdateChassis ? 'update' : 'allocate'} chassis number`);
    } finally {
      setChassisLoading(false);
    }
  };

  const renderBookingTable = (records, tabIndex) => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Sr.no</CTableHeaderCell>
              <CTableHeaderCell>Booking ID</CTableHeaderCell>
              <CTableHeaderCell>Model Name</CTableHeaderCell>
              <CTableHeaderCell>Type</CTableHeaderCell>
              <CTableHeaderCell>Color</CTableHeaderCell>
              <CTableHeaderCell>Fullname</CTableHeaderCell>
              <CTableHeaderCell>Contact1</CTableHeaderCell>
              <CTableHeaderCell>Booking Date</CTableHeaderCell>
              <CTableHeaderCell>Upload Finance</CTableHeaderCell>
              <CTableHeaderCell>Upload KYC</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              {tabIndex === 2 && <CTableHeaderCell>Chassis Number</CTableHeaderCell>}
              <CTableHeaderCell>Print</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {records.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={tabIndex === 2 ? 14 : 13} className="text-center">
                  No subdealer bookings available
                </CTableDataCell>
              </CTableRow>
            ) : (
              records.map((booking, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{booking.bookingNumber}</CTableDataCell>
                  <CTableDataCell>{booking.model.model_name}</CTableDataCell>
                  <CTableDataCell>{booking.model.type}</CTableDataCell>
                  <CTableDataCell>{booking.color?.name || ''}</CTableDataCell>
                  <CTableDataCell>{booking.customerDetails.name}</CTableDataCell>
                  <CTableDataCell>{booking.customerDetails.mobile1}</CTableDataCell>
                  <CTableDataCell>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : 'N/A'}</CTableDataCell>

                  <CTableDataCell>
                    {booking.payment.type === 'FINANCE' && (
                      <>
                        {booking.documentStatus.financeLetter.status === 'NOT_UPLOADED' ||
                        booking.documentStatus.financeLetter.status === 'REJECTED' ? (
                          <Link
                            to={`/upload-finance/${booking.id}`}
                            state={{
                              bookingId: booking.id,
                              customerName: booking.customerDetails.name,
                              address: `${booking.customerDetails.address}, ${booking.customerDetails.taluka}, ${booking.customerDetails.district}, ${booking.customerDetails.pincode}`,
                              bookingType: 'SUBDEALER'
                            }}
                          >
                            <CButton size="sm" className="action-btn me-1">
                              <CIcon icon={cilCloudUpload} className='icon'/> Upload
                            </CButton>
                          </Link>
                        ) : null}
                        {booking.documentStatus.financeLetter.status !== 'NOT_UPLOADED' && (
                          <span className={`badge bg-${booking.documentStatus.financeLetter.status === 'APPROVED' ? 'success' : 'warning'}`}>
                            {booking.documentStatus.financeLetter.status}
                          </span>
                        )}
                      </>
                    )}
                  </CTableDataCell>

                  <CTableDataCell>
                    {booking.documentStatus.kyc.status === 'NOT_UPLOADED' ? (
                      <Link
                        to={`/upload-kyc/${booking.id}`}
                        state={{
                          bookingId: booking.id,
                          customerName: booking.customerDetails.name,
                          address: `${booking.customerDetails.address}, ${booking.customerDetails.taluka}, ${booking.customerDetails.district}, ${booking.customerDetails.pincode}`,
                          bookingType: 'SUBDEALER'
                        }}
                      >
                        <CButton size="sm" className="action-btn me-1">
                          <CIcon icon={cilCloudUpload} className='icon'/> Upload
                        </CButton>
                      </Link>
                    ) : (
                      <div className="d-flex align-items-center">
                        <span className={`badge bg-${booking.documentStatus.kyc.status === 'APPROVED' ? 'success' : 'warning'}`}>
                          {booking.documentStatus.kyc.status}
                        </span>
                        {booking.documentStatus.kyc.status === 'REJECTED' && (
                          <Link
                            to={`/upload-kyc/${booking.id}`}
                            state={{
                              bookingId: booking.id,
                              customerName: booking.customerDetails.name,
                              address: `${booking.customerDetails.address}, ${booking.customerDetails.taluka}, ${booking.customerDetails.district}, ${booking.customerDetails.pincode}`,
                              bookingType: 'SUBDEALER'
                            }}
                            className="ms-2"
                          >
                            <CButton size="sm" className="action-btn">
                              <CIcon icon={cilCloudUpload} className='icon'/> Re-upload
                            </CButton>
                          </Link>
                        )}
                      </div>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <span className={`badge bg-${booking.status === 'APPROVED' ? 'success' : booking.status === 'ALLOCATED' ? 'info' : 'warning'}`}>
                      {booking.status}
                    </span>
                  </CTableDataCell>
                  {tabIndex === 2 && <CTableDataCell>{booking.chassisNumber}</CTableDataCell>}
                  <CTableDataCell>
                    {booking.formPath && (
                      <a href={`${config.baseURL}${booking.formPath}`} target="_blank" rel="noopener noreferrer">
                        <CButton size="sm" className="action-btn">
                          <CIcon icon={cilPrint} className='icon'/>
                        </CButton>
                      </a>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <button className="action-button" onClick={(event) => handleClick(event, booking.id)}>
                      Action
                    </button>

                    <Menu id={`action-menu-${booking.id}`} anchorEl={anchorEl} open={menuId === booking.id} onClose={handleClose}>
                      <MenuItem onClick={() => handleViewBooking(booking.id)}>View Booking</MenuItem>
                      <Link className="Link" to={`/update-subdealer-booking/${booking.id}`}>
                        <MenuItem>Edit</MenuItem>
                      </Link>
                      {booking.payment.type === 'FINANCE' && booking.documentStatus?.financeLetter?.status !== 'NOT_UPLOADED' && (
                        <MenuItem onClick={() => handleViewFinanceLetter(booking._id)}>View Finance Letter</MenuItem>
                      )}
                      {booking.documentStatus?.kyc?.status !== 'NOT_UPLOADED' && (
                        <MenuItem onClick={() => handleViewKYC(booking.id)}>View KYC</MenuItem>
                      )}
                      {tabIndex === 1 && booking.status === 'APPROVED' && (
                        <MenuItem onClick={() => handleAllocateChassis(booking.id)}>Allocate Chassis</MenuItem>
                      )}

                      {tabIndex === 2 && booking.status === 'ALLOCATED' && (
                        <MenuItem onClick={() => handleUpdateChassis(booking.id)}>Update Chassis</MenuItem>
                      )}
                    </Menu>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>
    );
  };

  return (
    <div>
      <div className='title'>Subdealers Booking</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            <Link to="/subdealer-booking">
              <CButton size="sm" className="action-btn me-1">
                <CIcon icon={cilPlus} className='icon'/> New Booking
              </CButton>
            </Link>
          </div>
        </CCardHeader>
        
        <CCardBody>
          <div className="d-flex justify-content-between mb-3">
            <div></div>
            <div className='d-flex'>
              <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
              <CFormInput
                type="text"
                className="d-inline-block square-search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (activeTab === 0) handlePendingFilter(e.target.value, getDefaultSearchFields('booking'));
                  else if (activeTab === 1) handleApprovedFilter(e.target.value, getDefaultSearchFields('booking'));
                  else handleAllocatedFilter(e.target.value, getDefaultSearchFields('booking'));
                }}
                placeholder="Search bookings..."
              />
            </div>
          </div>

          {/* Tabs Navigation */}
          <CNav variant="tabs" className="mb-3">
            <CNavItem>
              <CNavLink active={activeTab === 0} onClick={() => setActiveTab(0)}>
                Pending Approvals
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
                Approved
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
                Allocated
              </CNavLink>
            </CNavItem>
          </CNav>

          {/* Tabs Content */}
          <CTabContent>
            {/* Pending Approvals Tab */}
            <CTabPane visible={activeTab === 0} className="p-3">
              {renderBookingTable(filteredPending, 0)}
            </CTabPane>

            {/* Approved Tab */}
            <CTabPane visible={activeTab === 1} className="p-3">
              {renderBookingTable(filteredApproved, 1)}
            </CTabPane>

            {/* Allocated Tab */}
            <CTabPane visible={activeTab === 2} className="p-3">
              {renderBookingTable(filteredAllocated, 2)}
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>

      <ViewBooking open={viewModalVisible} onClose={() => setViewModalVisible(false)} booking={selectedBooking} refreshData={fetchData} />
      <KYCView
        open={kycModalVisible}
        onClose={() => {
          setKycModalVisible(false);
          setKycBookingId(null);
        }}
        kycData={kycData}
        refreshData={fetchData}
        bookingId={kycBookingId}
      />
      <FinanceView
        open={financeModalVisible}
        onClose={() => {
          setFinanceModalVisible(false);
          setFinanceBookingId(null);
        }}
        financeData={financeData}
        refreshData={fetchData}
        bookingId={financeBookingId}
      />
      <SubDealerChassisNumberModal
        show={showChassisModal}
        onClose={() => {
          setShowChassisModal(false);
          setIsUpdateChassis(false);
        }}
        onSave={handleSaveChassisNumber}
        isLoading={chassisLoading}
        booking={allData.find((b) => b._id === selectedBookingForChassis)}
        isUpdate={isUpdateChassis}
      />
    </div>
  );
};

export default AllBooking;