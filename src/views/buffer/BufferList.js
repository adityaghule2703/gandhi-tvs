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
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CFormLabel
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilSettings, 
  cilBan,
  cilClock
} from '@coreui/icons';
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

const BufferList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState({});
  const dropdownRefs = useRef({});

  // Modals state
  const [unfreezeModalVisible, setUnfreezeModalVisible] = useState(false);
  const [extendTimeModalVisible, setExtendTimeModalVisible] = useState(false);

  // Selected user
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Form states
  const [unfreezeReason, setUnfreezeReason] = useState('');
  const [extendTimeData, setExtendTimeData] = useState({
    additionalHours: 24,
    reason: ''
  });

  const hasUpdatePermission = hasPermission('USER_BUFFER', 'UPDATE');
  const showActionColumn = hasUpdatePermission;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users/frozen-sales-executives`);
      setData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    const searchFields = getDefaultSearchFields('user');
    const filtered = data.filter(item =>
      searchFields.some(field => {
        const fieldValue = item[field]?.toString().toLowerCase() || '';
        return fieldValue.includes(searchValue.toLowerCase());
      })
    );
    setFilteredData(filtered);
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

  // Unfreeze handlers
  const handleUnfreezeClick = (userId) => {
    setSelectedUserId(userId);
    setUnfreezeModalVisible(true);
    setDropdownOpen({}); // Close dropdown
  };

  const confirmUnfreeze = async () => {
    if (!unfreezeReason.trim()) {
      showError('Please enter a reason for unfreezing');
      return;
    }

    try {
      await axiosInstance.post(`/users/${selectedUserId}/unfreeze`, {
        userId: selectedUserId,
        reason: unfreezeReason
      });

      updateUserStatus(selectedUserId, false);
      showSuccess('User unfrozen successfully');
      setUnfreezeModalVisible(false);
      setUnfreezeReason('');
      fetchData();
    } catch (error) {
      console.error('Error unfreezing user:', error);
      showError('Failed to unfreeze user');
    }
  };

  // Extend time handlers
  const handleExtendTimeClick = (userId) => {
    setSelectedUserId(userId);
    setExtendTimeModalVisible(true);
    setDropdownOpen({}); // Close dropdown
  };

  const confirmExtendTime = async () => {
    if (!extendTimeData.reason.trim()) {
      showError('Please enter a reason for extending time');
      return;
    }

    if (extendTimeData.additionalHours <= 0) {
      showError('Additional hours must be greater than 0');
      return;
    }

    try {
      await axiosInstance.post(`/users/${selectedUserId}/extend-deadline`, {
        additionalHours: extendTimeData.additionalHours,
        reason: extendTimeData.reason
      });

      showSuccess('Buffer time extended successfully');
      setExtendTimeModalVisible(false);
      setExtendTimeData({ additionalHours: 24, reason: '' });
      fetchData();
    } catch (error) {
      console.error('Error extending buffer time:', error);
      showError('Failed to extend buffer time');
    }
  };

  // Helper functions
  const updateUserStatus = (userId, isFrozen) => {
    const updateFn = (user) => (user.id === userId ? { ...user, isFrozen } : user);
    setData((prev) => prev.map(updateFn));
    setFilteredData((prev) => prev.map(updateFn));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusBadge = (isFrozen) => {
    return isFrozen ? 
      <CBadge color="danger">Frozen</CBadge> : 
      <CBadge color="success">Active</CBadge>;
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
        Error loading frozen users: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Frozen Users List</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            <h6 className="mb-0">Buffer Management</h6>
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
                placeholder="Search frozen users..."
              />
            </div>
          </div>
          
          {/* Unfreeze Reason Modal */}
          <CModal visible={unfreezeModalVisible} onClose={() => setUnfreezeModalVisible(false)}>
            <CModalHeader>
              <CModalTitle>Unfreeze User</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <p>Please provide the reason for unfreezing this user:</p>
              <CFormTextarea
                value={unfreezeReason}
                onChange={(e) => setUnfreezeReason(e.target.value)}
                placeholder="Enter reason (e.g., Documents have been submitted)"
                rows={3}
              />
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setUnfreezeModalVisible(false)}>
                Cancel
              </CButton>
              <CButton color="primary" onClick={confirmUnfreeze}>
                Confirm Unfreeze
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Extend Time Modal */}
          <CModal visible={extendTimeModalVisible} onClose={() => setExtendTimeModalVisible(false)}>
            <CModalHeader>
              <CModalTitle>Extend Buffer Time</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <div className="mb-3">
                <CFormLabel>Additional Hours</CFormLabel>
                <CFormInput
                  type="number"
                  value={extendTimeData.additionalHours}
                  onChange={(e) =>
                    setExtendTimeData({
                      ...extendTimeData,
                      additionalHours: parseInt(e.target.value) || 0
                    })
                  }
                  min="1"
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Reason</CFormLabel>
                <CFormTextarea
                  value={extendTimeData.reason}
                  onChange={(e) =>
                    setExtendTimeData({
                      ...extendTimeData,
                      reason: e.target.value
                    })
                  }
                  placeholder="Additional time needed for document collection"
                  rows={3}
                />
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setExtendTimeModalVisible(false)}>
                Cancel
              </CButton>
              <CButton color="primary" onClick={confirmExtendTime}>
                Extend Time
              </CButton>
            </CModalFooter>
          </CModal>

          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Mobile</CTableHeaderCell>
                  <CTableHeaderCell>Branch</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Buffer Time</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((user, index) => (
                    <CTableRow key={user.id || user._id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{user.name}</CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell>{user.mobile}</CTableDataCell>
                      <CTableDataCell>{user.branchDetails?.name || 'N/A'}</CTableDataCell>
                      <CTableDataCell>
                        {getStatusBadge(user.isFrozen)}
                      </CTableDataCell>
                      <CTableDataCell>{formatDate(user.documentBufferTime)}</CTableDataCell>
                      {showActionColumn && (
                        <CTableDataCell>
                          <div className="dropdown-container" ref={el => dropdownRefs.current[user.id || user._id] = el}>
                            <CButton 
                              size="sm"
                              className='option-button btn-sm'
                              onClick={() => toggleDropdown(user.id || user._id)}
                            >
                              <CIcon icon={cilSettings} />
                              Options
                            </CButton>
                            {dropdownOpen[user.id || user._id] && (
                              <div className="dropdown-menu show">
                                <button 
                                  className="dropdown-item"
                                  onClick={() => handleUnfreezeClick(user.id || user._id)}
                                >
                                  <CIcon icon={cilBan} className="me-2" /> Unfreeze
                                </button>
                                <button 
                                  className="dropdown-item"
                                  onClick={() => handleExtendTimeClick(user.id || user._id)}
                                >
                                  <CIcon icon={cilClock} className="me-2" /> Extend Time
                                </button>
                              </div>
                            )}
                          </div>
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={showActionColumn ? "8" : "7"} className="text-center">
                      <span style={{ color: 'red' }}>
                        {searchTerm ? 'No matching frozen users found' : 'No frozen users available'}
                      </span>
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

export default BufferList;