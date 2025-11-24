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
import { Link } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilCloudUpload, cilSearch, cilZoomOut, cilZoom } from '@coreui/icons';
import { axiosInstance, getDefaultSearchFields, showError, useTableFilter } from '../../utils/tableImports';
import '../../css/invoice.css';
import '../../css/table.css';
import KYCDocuments from './KYCDocuments';
import { hasPermission } from '../../utils/permissionUtils';

function RTOPaper() {
  const [activeTab, setActiveTab] = useState(0);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [selectedRtoId, setSelectedRtoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: pendingData,
    setData: setPendingData,
    filteredData: filteredPendings,
    setFilteredData: setFilteredPendings,
    handleFilter: handlePendingFilter
  } = useTableFilter([]);

  const {
    data: approvedData,
    setData: setApprovedData,
    filteredData: filteredApproved,
    setFilteredData: setFilteredApproved,
    handleFilter: handleApprovedFilter
  } = useTableFilter([]);

  useEffect(() => {
    fetchData();
    fetchLocationData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/rtoProcess/rtopaperspending`);
      setPendingData(response.data.data);
      setFilteredPendings(response.data.data);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationData = async () => {
    try {
      const response = await axiosInstance.get(`/rtoProcess/rtopaperapproved`);
      setApprovedData(response.data.data);
      setFilteredApproved(response.data.data);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  const handleViewKYC = async (rtoItem) => {
    try {
      const bookingId = rtoItem.bookingId?.id;
      setSelectedRtoId(rtoItem._id);

      if (!bookingId) {
        showError('Booking ID not found');
        return;
      }

      const response = await axiosInstance.get(`/kyc/${bookingId}/documents`);

      const kycDataWithStatus = {
        ...response.data.data,
        status: rtoItem.documentStatus?.kyc?.status || 'PENDING',
        chassisNumber: rtoItem.bookingId?.chassisNumber,
        bookingNumber: rtoItem.bookingId?.bookingNumber,
        customerName: rtoItem.bookingId?.customerName
      };

      setKycData(kycDataWithStatus);
      setShowKycModal(true);
    } catch (error) {
      console.log('Error fetching KYC details', error);
      showError(error);
    }
  };

  const refreshData = () => {
    fetchData();
    fetchLocationData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    if (activeTab === 0) handlePendingFilter('', getDefaultSearchFields('rto'));
    else handleApprovedFilter('', getDefaultSearchFields('rto'));
  };

  const renderPendingTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Model Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Customer Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Contact Number1</CTableHeaderCell>
              <CTableHeaderCell scope="col">RTO Paper</CTableHeaderCell>
              <CTableHeaderCell scope="col">Upload KYC</CTableHeaderCell>
              {hasPermission('RTO_PROCESS', 'UPDATE') && <CTableHeaderCell scope="col">Action</CTableHeaderCell>}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredPendings.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan={hasPermission('RTO_PROCESS', 'UPDATE') ? "9" : "8"} style={{ color: 'red', textAlign: 'center' }}>
                  No data available
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredPendings.map((rtoItem, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{rtoItem.bookingId?.bookingNumber || ''}</CTableDataCell>
                  <CTableDataCell>{rtoItem.bookingId?.model?.model_name || ''}</CTableDataCell>
                  <CTableDataCell>{rtoItem.bookingId?.chassisNumber || ''}</CTableDataCell>
                  <CTableDataCell>{rtoItem.bookingId?.customerName || ''}</CTableDataCell>
                  <CTableDataCell>{rtoItem.bookingId?.customerMobile || ''}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={rtoItem.rtoPaperStatus === 'Not Submitted' ? 'danger' : 'secondary'} shape="rounded-pill">
                      {rtoItem.rtoPaperStatus || 'Pending'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {!rtoItem.kycStatus || rtoItem.kycStatus === 'NOT_UPLOADED' || rtoItem.kycStatus === 'REJECTED' ? (
                      <Link
                        to={`/upload-kyc/${rtoItem.bookingId?.id}`}
                        state={{
                          bookingId: rtoItem.bookingId?.id,
                          customerName: rtoItem.bookingId?.customerName,
                          address: `${rtoItem.bookingId?.customerAddress || ''}`,
                          chassisNumber: rtoItem.bookingId?.chassisNumber
                        }}
                      >
                        <CButton size="sm" className="upload-kyc-btn icon-only">
                          <CIcon icon={cilCloudUpload} />
                        </CButton>
                      </Link>
                    ) : (
                      <span className={`status-badge ${(rtoItem.kycStatus || '').toLowerCase()}`}>
                        {rtoItem.kycStatus || 'N/A'}
                      </span>
                    )}
                  </CTableDataCell>
                  {hasPermission('RTO_PROCESS', 'UPDATE') && (
                    <CTableDataCell>
                      <CButton 
                        size="sm" 
                        className="action-btn"
                        onClick={() => handleViewKYC(rtoItem)}
                      >
                        <CIcon icon={cilZoom} className="me-1" />
                        View
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

  const renderCompletedTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Model Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Customer Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Contact Number1</CTableHeaderCell>
              <CTableHeaderCell scope="col">RTO Paper</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredApproved.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="7" style={{ color: 'red', textAlign: 'center' }}>
                  No data available
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredApproved.map((rtoItem, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{rtoItem.bookingId?.bookingNumber || ''}</CTableDataCell>
                  <CTableDataCell>{rtoItem.bookingId?.model?.model_name || ''}</CTableDataCell>
                  <CTableDataCell>{rtoItem.bookingId?.chassisNumber || ''}</CTableDataCell>
                  <CTableDataCell>{rtoItem.bookingId?.customerName || ''}</CTableDataCell>
                  <CTableDataCell>{rtoItem.bookingId?.customerMobile || ''}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={rtoItem.rtoPaperStatus === 'Submitted' ? 'success' : 'danger'} shape="rounded-pill">
                      {rtoItem.rtoPaperStatus || 'Pending'}
                    </CBadge>
                  </CTableDataCell>
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
      <div className='title'>RTO Paper Management</div>
      
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
                RTO PAPER PENDING
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
                COMPLETED
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (activeTab === 0) handlePendingFilter(e.target.value, getDefaultSearchFields('rto'));
                  else handleApprovedFilter(e.target.value, getDefaultSearchFields('rto'));
                }}
              />
            </div>
          </div>

          <CTabContent>
            <CTabPane visible={activeTab === 0}>
              {renderPendingTable()}
            </CTabPane>
            <CTabPane visible={activeTab === 1}>
              {renderCompletedTable()}
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>

      <KYCDocuments
        open={showKycModal}
        onClose={() => setShowKycModal(false)}
        kycData={kycData}
        refreshData={refreshData}
        rtoId={selectedRtoId}
      />
    </div>
  );
}

export default RTOPaper;