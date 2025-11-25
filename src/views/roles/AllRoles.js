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
  CSpinner
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
  getDefaultSearchFields,
  useTableFilter,
  confirmDelete,
  showError,
  showSuccess,
  axiosInstance
} from 'src/utils/tableImports.jsx';
import { hasPermission } from 'src/utils/permissionUtils.jsx';

const AllRoles = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState({});
  const dropdownRefs = useRef({});
  
  const hasEditPermission = hasPermission('ROLE', 'UPDATE');
  const hasDeletePermission = hasPermission('ROLE', 'DELETE');
  const hasCreatePermission = hasPermission('ROLE', 'CREATE');
  const showActionColumn = hasEditPermission || hasDeletePermission;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/roles`);
      const filteredRoles = response.data.data.filter((role) => role.name.toLowerCase() !== 'superadmin');
      setData(filteredRoles);
      setFilteredData(filteredRoles);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    const searchFields = getDefaultSearchFields('roles');
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
        await axiosInstance.delete(`/roles/${id}`);
        setData(data.filter((role) => role.id !== id));
        setFilteredData(filteredData.filter((role) => role.id !== id));
        showSuccess('Role deleted successfully!');
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

  // Group permissions by module for display
  const groupPermissionsByModule = (permissions) => {
    if (!permissions || !permissions.length) return {};

    return permissions.reduce((acc, permission) => {
      const module = permission.module || permission.resource;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission.action);
      return acc;
    }, {});
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
        Error loading roles: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>All Roles</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasCreatePermission && (
              <Link to='/roles/create-role'>
                <CButton size="sm" className="action-btn me-1">
                  <CIcon icon={cilPlus} className='icon'/> New Role
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
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search roles..."
              />
            </div>
          </div>
          
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Role Name</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Modules</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((role, index) => {
                    const groupedPermissions = groupPermissionsByModule(role.permissions);
                    const modules = Object.keys(groupedPermissions);

                    return (
                      <CTableRow key={role._id || role.id}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{role.name}</CTableDataCell>
                        <CTableDataCell>{role.description || '-'}</CTableDataCell>
                        <CTableDataCell>
                          {modules.length > 0 ? (
                            <div className="permission-modules">
                              {modules.map((module, idx) => (
                                <div key={idx} className="module-item">
                                  {module}
                                </div>
                              ))}
                            </div>
                          ) : (
                            'No modules'
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          {modules.length > 0 ? (
                            <div className="permission-actions">
                              {modules.map((module, idx) => (
                                <div key={idx} className="action-item">
                                  {groupedPermissions[module].join(', ')}
                                </div>
                              ))}
                            </div>
                          ) : (
                            'No actions'
                          )}
                        </CTableDataCell>
                        {showActionColumn && (
                          <CTableDataCell>
                            <div className="dropdown-container" ref={el => dropdownRefs.current[role._id || role.id] = el}>
                              <CButton 
                                size="sm"
                                className='option-button btn-sm'
                                onClick={() => toggleDropdown(role._id || role.id)}
                              >
                                <CIcon icon={cilSettings} />
                                Options
                              </CButton>
                              {dropdownOpen[role._id || role.id] && (
                                <div className="dropdown-menu show">
                                  {hasEditPermission && (
                                    <Link 
                                      className="dropdown-item"
                                      to={`/roles/update-role/${role._id || role.id}`}
                                    >
                                      <CIcon icon={cilPencil} className="me-2" /> Edit
                                    </Link>
                                  )}
                                  {hasDeletePermission && (
                                    <button 
                                      className="dropdown-item"
                                      onClick={() => handleDelete(role._id || role.id)}
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
                    );
                  })
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={showActionColumn ? "6" : "5"} className="text-center">
                      {searchTerm ? 'No matching roles found' : 'No roles available'}
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>

      <style jsx>{`
        .permission-modules,
        .permission-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .module-item,
        .action-item {
          padding: 2px 0;
        }
      `}</style>
    </div>
  );
};

export default AllRoles;