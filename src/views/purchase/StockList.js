import '../../css/table.css';
import '../../css/form.css';
import React, { useState, useRef, useEffect } from 'react';
import {
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilArrowTop, 
  cilArrowBottom, 
  cilSearch, 
  cilPlus, 
  cilSettings, 
  cilPencil, 
  cilTrash, 
  cilZoomOut,
  cilFilter 
} from '@coreui/icons';
import { Link, useNavigate } from 'react-router-dom';
import { CFormLabel } from '@coreui/react';
import axiosInstance from 'src/axiosInstance';
import { confirmDelete, showSuccess, showError } from 'src/utils/sweetAlerts';
import QRCode from 'react-qr-code';

const StockList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [activeSearch, setActiveSearch] = useState({ 
    type: '', 
    branch: '',
    search: '' 
  });
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [branches, setBranches] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const dropdownRefs = useRef({});
  const navigate = useNavigate();
  
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const branchId = storedUser.branch?._id;
  const userRole = localStorage.getItem('userRole');

  // Temporary permissions for development
  const hasEditPermission = true;
  const hasDeletePermission = true;
  const hasCreatePermission = true;
  const showActionColumn = true;

  const fetchVehicles = async (searchParams = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Add search parameters
      if (searchParams.search) params.append('search', searchParams.search);
      if (searchParams.type) params.append('type', searchParams.type);
      if (searchParams.branch) params.append('location', searchParams.branch);

      // Handle branch filtering based on user role
      if (userRole !== 'SUPERADMIN' && !searchParams.branch) {
        params.append('location', branchId);
      }

      const url = params.toString() ? `/vehicles?${params.toString()}` : '/vehicles';
      const response = await axiosInstance.get(url);

      if (response.data.status === 'success') {
        // Filter out sold vehicles from the API response
        const nonSoldVehicles = response.data.data.vehicles.filter(
          (vehicle) => vehicle.status?.toLowerCase() !== 'sold'
        );
        
        setVehicles(nonSoldVehicles);
      }
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/branches');
      setBranches(response.data.data || []);
    } catch (error) {
      console.log('Error fetching branches:', error);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchBranches();
  }, []);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedVehicles = [...vehicles].sort((a, b) => {
      let aValue = a;
      let bValue = b;
      
      if (key.includes('.')) {
        const keys = key.split('.');
        aValue = keys.reduce((obj, k) => obj && obj[k], a);
        bValue = keys.reduce((obj, k) => obj && obj[k], b);
      } else {
        aValue = a[key];
        bValue = b[key];
      }
      
      if (aValue < bValue) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setVehicles(sortedVehicles);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending'
      ? <CIcon icon={cilArrowTop} className="ms-1" />
      : <CIcon icon={cilArrowBottom} className="ms-1" />;
  };

  const handleSearch = (searchData) => {
    setActiveSearch(searchData);
    fetchVehicles(searchData);
  };

  const handleResetSearch = () => {
    setActiveSearch({ type: '', branch: '', search: '' });
    setSearchTerm('');
    setSelectedType('');
    setSelectedBranchId('');
    setIsFilterApplied(false);
    fetchVehicles({});
  };

  const applyFilter = () => {
    if (selectedType && selectedBranchId) {
      const filterData = {
        type: selectedType,
        branch: selectedBranchId,
        search: activeSearch.search
      };
      setActiveSearch(filterData);
      setIsFilterApplied(true);
      setFilterModalVisible(false);
      fetchVehicles(filterData);
    } else {
      showError('Please select both type and branch to apply filter');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/vehicles/${vehicleId}`);
        setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));
        showSuccess('Vehicle deleted successfully!');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        showError('Failed to delete vehicle');
      }
    }
  };

  const handleEditVehicle = (vehicleId) => {
    navigate(`/update-inward/${vehicleId}`);
  };

  const handleExportExcel = async () => {
    if (!selectedType) {
      showError('Please select a type.');
      return;
    }
    if (!selectedBranchId) {
      showError('Please select a branch.');
      return;
    }
    try {
      const response = await axiosInstance.get(
        `/vehicles/export-excel?&type=${selectedType}&branch_id=${selectedBranchId}`,
        {
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exported_data_${selectedType}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setExportModalVisible(false);
      setSelectedType('');
      setSelectedBranchId('');
      showSuccess('Excel exported successfully!');
    } catch (error) {
      console.error('Excel export failed:', error);
      showError('Failed to export Excel.');
    }
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const newDropdownState = {};
      let shouldUpdate = false;
      
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          newDropdownState[key] = false;
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        setDropdownOpen(prev => ({ ...prev, ...newDropdownState }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        Error loading vehicles: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Inwarded Stock</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasCreatePermission && (
              <Link to='/inward-stock'>
                <CButton size="sm" className="action-btn me-1">
                  <CIcon icon={cilPlus} className='icon'/> New Stock
                </CButton>
              </Link>
            )}
            
            <CButton 
              size="sm" 
              className="action-btn me-1"
              onClick={() => setFilterModalVisible(true)}
            >
              <CIcon icon={cilFilter} className='icon' /> Filter
            </CButton>

            {hasCreatePermission && (
              <CButton 
                size="sm" 
                className="action-btn me-1"
                onClick={() => setExportModalVisible(true)}
              >
                Export Excel
              </CButton>
            )}

            {(activeSearch.type || activeSearch.branch || activeSearch.search) && (
              <CButton 
                size="sm" 
                color="secondary" 
                className="action-btn me-1"
                onClick={handleResetSearch}
              >
                <CIcon icon={cilZoomOut} className='icon' />
                Reset Search
              </CButton>
            )}
          </div>
        </CCardHeader>
        
        <CCardBody>
          {/* Filter Status Display */}
          {isFilterApplied && (
            <div className="alert alert-info mb-3">
              <span>Applied Filters: </span>
              <span className="fw-bold">
                Type: {activeSearch.type}, Branch: {branches.find((b) => b._id === activeSearch.branch)?.name || ''}
              </span>
            </div>
          )}

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
                  handleSearch({ ...activeSearch, search: e.target.value });
                }}
                placeholder="Search vehicles..."
              />
            </div>
          </div>
          
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Unload Location</CTableHeaderCell>
                  <CTableHeaderCell>Inward Date</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Vehicle Model</CTableHeaderCell>
                  <CTableHeaderCell>Color</CTableHeaderCell>
                  <CTableHeaderCell>Battery No</CTableHeaderCell>
                  <CTableHeaderCell>Key No</CTableHeaderCell>
                  <CTableHeaderCell>Chassis No</CTableHeaderCell>
                  <CTableHeaderCell>Engine No</CTableHeaderCell>
                  <CTableHeaderCell>Motor No</CTableHeaderCell>
                  <CTableHeaderCell>Charger No</CTableHeaderCell>
                  <CTableHeaderCell>QR Code</CTableHeaderCell>
                  <CTableHeaderCell>Current Status</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle, index) => (
                    <CTableRow key={vehicle._id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{vehicle.unloadLocation?.name || ''}</CTableDataCell>
                      <CTableDataCell>{new Date(vehicle.createdAt).toLocaleDateString()}</CTableDataCell>
                      <CTableDataCell>{vehicle.type}</CTableDataCell>
                      <CTableDataCell>{vehicle.modelName || ''}</CTableDataCell>
                      <CTableDataCell>{vehicle.color?.name || vehicle.color?.id || ''}</CTableDataCell>
                      <CTableDataCell>{vehicle.batteryNumber}</CTableDataCell>
                      <CTableDataCell>{vehicle.keyNumber}</CTableDataCell>
                      <CTableDataCell>{vehicle.chassisNumber}</CTableDataCell>
                      <CTableDataCell>{vehicle.engineNumber}</CTableDataCell>
                      <CTableDataCell>{vehicle.motorNumber}</CTableDataCell>
                      <CTableDataCell>{vehicle.chargerNumber}</CTableDataCell>
                      <CTableDataCell>
                        {vehicle.qrCode ? (
                          <QRCode value={vehicle.qrCode} size={50} bgColor="#FFFFFF" fgColor="#000000" level="H" />
                        ) : (
                          'N/A'
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <span className={`badge bg-${vehicle.status?.toLowerCase() === 'available' ? 'success' : 'warning'}`}>
                          {vehicle.status}
                        </span>
                      </CTableDataCell>
                      {showActionColumn && (
                        <CTableDataCell>
                          <div className="dropdown-container" ref={el => dropdownRefs.current[vehicle._id] = el}>
                            <CButton 
                              size="sm"
                              className='option-button btn-sm'
                              onClick={() => toggleDropdown(vehicle._id)}
                            >
                              <CIcon icon={cilSettings} />
                              Options
                            </CButton>
                            {dropdownOpen[vehicle._id] && (
                              <div className="dropdown-menu show">
                                {hasEditPermission && (
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleEditVehicle(vehicle._id)}
                                  >
                                    <CIcon icon={cilPencil} className="me-2" /> Edit
                                  </button>
                                )}
                                {hasDeletePermission && (
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleDeleteVehicle(vehicle._id)}
                                  >
                                    <CIcon icon={cilTrash} className="me-2" /> Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={showActionColumn ? "15" : "14"} className="text-center">
                      No inward details available
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
      <CModal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Filter Vehicles</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label">Type:</label>
            <CFormSelect
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">-- Select Type --</option>
              <option value="EV">EV</option>
              <option value="ICE">ICE</option>
            </CFormSelect>
          </div>

          <div className="mb-3">
            <label className="form-label">Branch:</label>
            <CFormSelect
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              <option value="">-- Select Branch --</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </CFormSelect>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setFilterModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={applyFilter}>
            Apply Filter
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Export Modal */}
      <CModal visible={exportModalVisible} onClose={() => setExportModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Export Excel</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label">Model Type:</label>
            <CFormSelect
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">-- Select Model Type --</option>
              <option value="EV">EV</option>
              <option value="ICE">ICE</option>
            </CFormSelect>
          </div>

          <div className="mb-3">
            <label className="form-label">Branch:</label>
            <CFormSelect
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              <option value="">-- Select Branch --</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </CFormSelect>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setExportModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleExportExcel}>
            Export
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default StockList;