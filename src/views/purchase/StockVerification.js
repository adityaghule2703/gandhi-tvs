import React, { useState, useEffect } from 'react';
import { 
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
  CFormLabel,
  CFormCheck
} from '@coreui/react';
import { axiosInstance, getDefaultSearchFields, showError, showSuccess, useTableFilter } from '../../utils/tableImports';
import '../../css/invoice.css';
import '../../css/table.css';
import Swal from 'sweetalert2';
import { hasPermission } from '../../utils/permissionUtils';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilCheckCircle, cilZoomOut } from '@coreui/icons';

function StockVerification() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const branchId = storedUser.branch?._id;
  const userRole = (localStorage.getItem('userRole') || '').toUpperCase();

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
      const res = await axiosInstance.get('/vehicles/status/not_approved');
      let vehicles = res.data?.data?.vehicles || [];

      if (userRole !== 'SUPERADMIN' && branchId) {
        vehicles = vehicles.filter((v) => v.unloadLocation?._id === branchId);
      }

      setPendingData(vehicles);
      setFilteredPendings(vehicles);
    } catch (err) {
      console.error('Error fetching pending', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationData = async () => {
    try {
      const res = await axiosInstance.get('/vehicles/status/in_stock');
      let vehicles = res.data?.data?.vehicles || [];

      if (userRole !== 'SUPERADMIN' && branchId) {
        vehicles = vehicles.filter((v) => v.unloadLocation?._id === branchId);
      }

      setApprovedData(vehicles);
      setFilteredApproved(vehicles);
    } catch (err) {
      console.error('Error fetching verified', err);
    }
  };

  const handleSelectVehicle = (vehicleId, isChecked) => {
    if (isChecked) {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    } else {
      setSelectedVehicles(selectedVehicles.filter((id) => id !== vehicleId));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedVehicles(filteredPendings.map((vehicle) => vehicle._id));
    } else {
      setSelectedVehicles([]);
    }
  };

  const verifyVehicles = async () => {
    if (selectedVehicles.length === 0) {
      showError('Please select at least one vehicle to verify');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to verify ${selectedVehicles.length} vehicle(s). This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, verify them!'
    });

    if (!result.isConfirmed) return;

    setIsVerifying(true);
    try {
      await axiosInstance.post('/vehicles/approve', {
        vehicleIds: selectedVehicles
      });

      showSuccess('Vehicles verified successfully!');
      setSelectedVehicles([]);
      fetchData();
      fetchLocationData();
    } catch (error) {
      console.error('Error verifying vehicles:', error);
      showError(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifySingle = async (vehicleId) => {
    const result = await Swal.fire({
      title: 'Confirm Verification',
      html: `Are you sure you want to verify this vehicle?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, verify it!'
    });

    if (!result.isConfirmed) return;

    setIsVerifying(true);
    try {
      await axiosInstance.post('/vehicles/approve', {
        vehicleIds: [vehicleId]
      });

      showSuccess('Vehicle verified successfully!');
      fetchData();
      fetchLocationData();
    } catch (error) {
      console.error('Error verifying vehicle:', error);
      showError(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    if (activeTab === 0) handlePendingFilter('', getDefaultSearchFields('inward'));
    else handleApprovedFilter('', getDefaultSearchFields('inward'));
  };

  const renderPendingTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">
                <CFormCheck
                  onChange={handleSelectAll}
                  checked={selectedVehicles.length === filteredPendings.length && filteredPendings.length > 0}
                />
              </CTableHeaderCell>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Model Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Color</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Load Location</CTableHeaderCell>
              <CTableHeaderCell scope="col">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredPendings.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="8" style={{ color: 'red', textAlign: 'center' }}>
                  No data available
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredPendings.map((vehicle, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>
                    <CFormCheck
                      checked={selectedVehicles.includes(vehicle._id)}
                      onChange={(e) => handleSelectVehicle(vehicle._id, e.target.checked)}
                    />
                  </CTableDataCell>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{vehicle.type}</CTableDataCell>
                  <CTableDataCell>{vehicle.modelName || ''}</CTableDataCell>
                  <CTableDataCell>{vehicle.color?.name || ''}</CTableDataCell>
                  <CTableDataCell>{vehicle.chassisNumber}</CTableDataCell>
                  <CTableDataCell>{vehicle.unloadLocation?.name || ''}</CTableDataCell>
                  <CTableDataCell>
                    {hasPermission('VEHICLE_INWARD', 'APPROVE') && (
                      <CButton 
                        size="sm" 
                        className="action-btn"
                        onClick={() => handleVerifySingle(vehicle._id)} 
                        disabled={isVerifying}
                      >
                        <CIcon icon={cilCheckCircle} className="me-1" />
                        {isVerifying ? 'Verifying...' : 'Verify'}
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
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
              <CTableHeaderCell scope="col">Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Model Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Color</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Load Location</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredApproved.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="6" style={{ color: 'red', textAlign: 'center' }}>
                  No data available
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredApproved.map((vehicle, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{vehicle.type}</CTableDataCell>
                  <CTableDataCell>{vehicle.modelName || ''}</CTableDataCell>
                  <CTableDataCell>{vehicle.color?.name || ''}</CTableDataCell>
                  <CTableDataCell>{vehicle.chassisNumber}</CTableDataCell>
                  <CTableDataCell>{vehicle.unloadLocation?.name || ''}</CTableDataCell>
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
      <div className='title'>Inward Stock Verification</div>
      
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {activeTab === 0 && selectedVehicles.length > 0 && (
              <CButton 
                size="sm" 
                className="action-btn me-1"
                onClick={verifyVehicles} 
                disabled={isVerifying}
              >
                <CIcon icon={cilCheckCircle} className='icon'/>
                {isVerifying ? 'Verifying...' : `Verify Selected (${selectedVehicles.length})`}
              </CButton>
            )}
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
                PENDING VERIFICATION
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
                VERIFIED STOCK
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
                  if (activeTab === 0) handlePendingFilter(e.target.value, getDefaultSearchFields('inward'));
                  else handleApprovedFilter(e.target.value, getDefaultSearchFields('inward'));
                }}
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

export default StockVerification;