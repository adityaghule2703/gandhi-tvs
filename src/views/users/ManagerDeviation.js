import React, { useState, useRef, useEffect } from 'react';
import '../../css/table.css';
import '../../css/form.css';
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
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
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
  getDefaultSearchFields,
  useTableFilter,
  confirmDelete,
  showError,
  showSuccess,
  axiosInstance
} from 'src/utils/tableImports.jsx';
import { hasPermission } from 'src/utils/permissionUtils.jsx';

const ManagerDeviation = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState({});
  const dropdownRefs = useRef({});

  const hasEditPermission = hasPermission('MANAGER_DEVIATION', 'UPDATE');
  const hasDeletePermission = hasPermission('MANAGER_DEVIATION', 'DELETE');
  const showActionColumn = hasEditPermission || hasDeletePermission;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users`);

      // Map and filter for managers only
      const users = response.data.data
        .map((user) => ({
          ...user,
          id: user._id || user.id,
          primaryRole: user.roles?.[0]?.name || 'No Role',
          branchName: user.branchDetails?.name || user.branch || 'N/A',
          subdealerName: user.subdealerDetails?.name || ''
        }))
        .filter((user) => user.roles?.some((role) => role.name.toUpperCase() === 'MANAGER'));

      setData(users);
      setFilteredData(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      showError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    const searchFields = getDefaultSearchFields('users');
    const filtered = data.filter(item =>
      searchFields.some(field => {
        const fieldValue = item[field]?.toString().toLowerCase() || '';
        return fieldValue.includes(searchValue.toLowerCase());
      })
    );
    setFilteredData(filtered);
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/users/${id}`);
        setData(data.filter((user) => user.id !== id));
        setFilteredData(filteredData.filter((user) => user.id !== id));
        showSuccess('Manager deleted successfully!');
      } catch (error) {
        console.log(error);
        let message = 'Failed to delete. Please try again.';

        if (error.response) {
          const res = error.response.data;
          message = res.message || res.error || message;
        } else if (error.request) {
          message = 'No response from server. Please check your network.';
        } else if (error.message) {
          message = error.message;
        }

        showError(message);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Never logged in';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getRoleNames = (roles) => {
    if (!roles || !roles.length) return 'No Role';
    return roles.map((role) => role.name).join(', ');
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <CBadge color="success">Active</CBadge>;
    } else if (status === 'inactive') {
      return <CBadge color="danger">Inactive</CBadge>;
    } else {
      return <CBadge color="secondary">{status}</CBadge>;
    }
  };

  const getDeviationUsageBadge = (usage, limit) => {
    const usagePercent = limit > 0 ? (usage / limit) * 100 : 0;
    
    if (usagePercent >= 80) {
      return <CBadge color="danger">{usage}</CBadge>;
    } else if (usagePercent >= 50) {
      return <CBadge color="warning">{usage}</CBadge>;
    } else {
      return <CBadge color="success">{usage}</CBadge>;
    }
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
        Error loading managers: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Manager Deviation</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            <h6 className="mb-0">Manager Deviation Limits</h6>
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
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search managers..."
              />
            </div>
          </div>
          
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Mobile Number</CTableHeaderCell>
                  <CTableHeaderCell>Branch</CTableHeaderCell>
                  <CTableHeaderCell>Role(s)</CTableHeaderCell>
                  <CTableHeaderCell>Deviation Amount</CTableHeaderCell>
                  <CTableHeaderCell>Deviation Limit</CTableHeaderCell>
                  <CTableHeaderCell>Current Deviation Usage</CTableHeaderCell>
                  {/* Uncomment if you want to show these columns */}
                  {/* <CTableHeaderCell>Last Login</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell> */}
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((user, index) => (
                    <CTableRow key={user.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{user.name}</CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell>{user.mobile}</CTableDataCell>
                      <CTableDataCell>{user.branchName}</CTableDataCell>
                      <CTableDataCell>{getRoleNames(user.roles)}</CTableDataCell>
                      <CTableDataCell>{user.totalDeviationAmount || '0'}</CTableDataCell>
                      <CTableDataCell>{user.perTransactionDeviationLimit || '0'}</CTableDataCell>
                      <CTableDataCell>
                        {getDeviationUsageBadge(user.currentDeviationUsage || '0', user.perTransactionDeviationLimit || 1)}
                      </CTableDataCell>
                      {/* Uncomment if you want to show these columns */}
                      {/* <CTableDataCell>{formatDate(user.lastLogin)}</CTableDataCell>
                      <CTableDataCell>
                        {getStatusBadge(user.status)}
                      </CTableDataCell> */}
                      {showActionColumn && (
                        <CTableDataCell>
                          <div className="dropdown-container" ref={el => dropdownRefs.current[user.id] = el}>
                            <CButton 
                              size="sm"
                              className='option-button btn-sm'
                              onClick={() => toggleDropdown(user.id)}
                            >
                              <CIcon icon={cilSettings} />
                              Options
                            </CButton>
                            {dropdownOpen[user.id] && (
                              <div className="dropdown-menu show">
                                {hasEditPermission && (
                                  <Link 
                                    className="dropdown-item"
                                    to={`/users/update-user/${user.id}`}
                                  >
                                    <CIcon icon={cilPencil} className="me-2" /> Edit
                                  </Link>
                                )}
                                {hasDeletePermission && (
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleDelete(user.id)}
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
                    <CTableDataCell colSpan={showActionColumn ? "10" : "9"} className="text-center">
                      {searchTerm ? 'No matching managers found' : 'No managers available'}
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

export default ManagerDeviation;