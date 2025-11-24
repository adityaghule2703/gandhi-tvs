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
  CFormSwitch
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilPlus, 
  cilSettings, 
  cilPencil, 
  cilTrash
} from '@coreui/icons';
import { Link } from 'react-router-dom';
import { CFormLabel } from '@coreui/react';
import {
  React as ReactHook,
  useState as useStateHook,
  useEffect as useEffectHook,
  Menu,
  MenuItem,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  confirmDelete,
  showError,
  showSuccess,
  axiosInstance
} from 'src/utils/tableImports.jsx';
import { hasPermission } from 'src/utils/permissionUtils.jsx';

const SubdealerList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState({});
  const dropdownRefs = useRef({});

  const hasEditPermission = hasPermission('SUBDEALER', 'UPDATE');
  const hasDeletePermission = hasPermission('SUBDEALER', 'DELETE');
  const hasCreatePermission = hasPermission('SUBDEALER', 'CREATE');
  const showActionColumn = hasEditPermission || hasDeletePermission;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/subdealers`);
      setData(response.data.data.subdealers);
      setFilteredData(response.data.data.subdealers);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchValue) => {
    handleFilter(searchValue, getDefaultSearchFields('subdealer'));
  };

  const handleToggleActive = async (subdealerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      await axiosInstance.patch(`/subdealers/${subdealerId}/status`, {
        status: newStatus
      });
      setData((prevData) => prevData.map((subdealer) => (subdealer.id === subdealerId ? { ...subdealer, status: newStatus } : subdealer)));
      setFilteredData((prevData) =>
        prevData.map((subdealer) => (subdealer.id === subdealerId ? { ...subdealer, status: newStatus } : subdealer))
      );
      showSuccess('Subdealer status updated successfully!');
    } catch (error) {
      console.error('Error toggling subdealer status:', error);
      showError('Failed to update subdealer status');
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/subdealers/${id}`);
        setData(data.filter((subdealer) => subdealer.id !== id));
        setFilteredData(filteredData.filter((subdealer) => subdealer.id !== id));
        showSuccess('Subdealer deleted successfully!');
      } catch (error) {
        console.log(error);
        showError(error);
      }
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
        Error loading subdealers: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Subdealer List</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasCreatePermission && (
              <Link to='/add-subdealer'>
                <CButton size="sm" className="action-btn me-1">
                  <CIcon icon={cilPlus} className='icon'/> New Subdealer
                </CButton>
              </Link>
            )}
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
                  handleSearch(e.target.value);
                }}
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
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Rate Of Interest</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((subdealer, index) => (
                    <CTableRow key={subdealer.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{subdealer.name}</CTableDataCell>
                      <CTableDataCell>{subdealer.location}</CTableDataCell>
                      <CTableDataCell>{subdealer.rateOfInterest}</CTableDataCell>
                      <CTableDataCell>{subdealer.type}</CTableDataCell>
                      <CTableDataCell>
                        <CFormSwitch
                          checked={subdealer.status === 'active'}
                          onChange={() => handleToggleActive(subdealer.id, subdealer.status)}
                        />
                      </CTableDataCell>
                      {showActionColumn && (
                        <CTableDataCell>
                          <div className="dropdown-container" ref={el => dropdownRefs.current[subdealer.id] = el}>
                            <CButton 
                              size="sm"
                              className='option-button btn-sm'
                              onClick={() => toggleDropdown(subdealer.id)}
                            >
                              <CIcon icon={cilSettings} />
                              Options
                            </CButton>
                            {dropdownOpen[subdealer.id] && (
                              <div className="dropdown-menu show">
                                {hasEditPermission && (
                                  <Link 
                                    className="dropdown-item"
                                    to={`/update-subdealer/${subdealer.id}`}
                                  >
                                    <CIcon icon={cilPencil} className="me-2" /> Edit
                                  </Link>
                                )}
                                {hasDeletePermission && (
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleDelete(subdealer.id)}
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
                    <CTableDataCell colSpan={showActionColumn ? "7" : "6"} className="text-center">
                      No subdealers available
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default SubdealerList;