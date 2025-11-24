import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, MenuItem } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import '../../../css/table.css';
import '../../../css/importCsv.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDefaultSearchFields, useTableFilter } from '../../../utils/tableFilters';
import { usePagination } from '../../../utils/pagination.jsx';
import axiosInstance from '../../../axiosInstance';
import { confirmDelete, showError, showSuccess } from '../../../utils/sweetAlerts';
import { hasPermission } from '../../../utils/permissionUtils';

// Core UI components
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
  CFormSelect,
  CFormLabel
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { 
  cilSettings, 
  cilPencil, 
  cilTrash,
  cilFilter, 
  cilPlus
} from '@coreui/icons';

const HeadersList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [exportTypeDialogOpen, setExportTypeDialogOpen] = useState(false);
  const [selectedModelType, setSelectedModelType] = useState('');
  const [branches, setBranches] = useState([]);
  const [subdealers, setSubdealers] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedSubdealerId, setSelectedSubdealerId] = useState('');
  const [exportTarget, setExportTarget] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(Array.isArray(filteredData) ? filteredData : []);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const dropdownRefs = useRef({});

  const hasEditPermission = hasPermission('HEADER', 'UPDATE');
  const hasDeletePermission = hasPermission('HEADER', 'DELETE');
  const hasCreatePermission = hasPermission('HEADER', 'CREATE');
  const showActionColumn = hasEditPermission || hasDeletePermission;

  useEffect(() => {
    fetchData();
    fetchBranches();
    fetchSubdealers();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/headers?sort=priority`);
      setData(response.data.data.headers);
      setFilteredData(response.data.data.headers);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/branches');
      setBranches(response.data.data || []);
    } catch (error) {
      console.log('Error fetching branches', error);
    }
  };

  const fetchSubdealers = async () => {
    try {
      const response = await axiosInstance.get('/subdealers');
      setSubdealers(response.data.data.subdealers || []);
    } catch (error) {
      console.log('Error fetching subdealers', error);
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

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/headers/${id}`);
        setData(data.filter((header) => header.id !== id));
        fetchData();
        showSuccess();
      } catch (error) {
        console.log(error);
        showError(error);
      }
    }
  };

  const handleExportClick = () => {
    setExportTypeDialogOpen(true);
  };

  const handleExportTypeSelect = (type) => {
    setExportTarget(type);
    setExportTypeDialogOpen(false);
    setCsvDialogOpen(true);
  };

  const handleExportCSV = async () => {
    if (!selectedModelType) {
      showError('Please select a model type.');
      return;
    }

    let endpoint = '';
    if (exportTarget === 'branch' && !selectedBranchId) {
      showError('Please select a branch.');
      return;
    }
    if (exportTarget === 'subdealer' && !selectedSubdealerId) {
      showError('Please select a subdealer.');
      return;
    }

    try {
      if (exportTarget === 'branch') {
        endpoint = `/csv/export-template?filled=true&type=${selectedModelType}&branch_id=${selectedBranchId}`;
      } else {
        endpoint = `/csv/export-template?filled=true&type=${selectedModelType}&subdealer_id=${selectedSubdealerId}`;
      }

      const response = await axiosInstance.get(endpoint, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `exported_data_${selectedModelType}_${exportTarget}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Reset states
      setCsvDialogOpen(false);
      setSelectedModelType('');
      setSelectedBranchId('');
      setSelectedSubdealerId('');
      setExportTarget('');
      showSuccess('Excel exported successfully!');
    } catch (error) {
      console.error('Excel export failed:', error);
      showError('Failed to export Excel.');
      setCsvDialogOpen(false);
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

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('headers'));
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
        Error loading headers: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Headers List</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasCreatePermission && (
              <Link to="/headers/add-header">
                <CButton size="sm" className="action-btn me-1">
                  <CIcon icon={cilPlus} className='icon'/> New Header
                </CButton>
              </Link>
            )}
            
            <CButton 
              size="sm" 
              className="action-btn me-1"
              onClick={handleExportClick}
            >
              <FontAwesomeIcon icon={faFileExcel} className='me-1' />
              Export Excel
            </CButton>
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
              />
            </div>
          </div>
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Category key</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Priority number</CTableHeaderCell>
                  <CTableHeaderCell>Page number</CTableHeaderCell>
                  <CTableHeaderCell>HSN code</CTableHeaderCell>
                  <CTableHeaderCell>GST rate</CTableHeaderCell>
                  <CTableHeaderCell>Is Mandatory?</CTableHeaderCell>
                  <CTableHeaderCell>Is Discount?</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={showActionColumn ? "11" : "10"} className="text-center">
                      No headers available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((header, index) => (
                    <CTableRow key={header._id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{header.header_key}</CTableDataCell>
                      <CTableDataCell>{header.category_key}</CTableDataCell>
                      <CTableDataCell>{header.type}</CTableDataCell>
                      <CTableDataCell>{header.priority}</CTableDataCell>
                      <CTableDataCell>{header.metadata?.page_no || ''}</CTableDataCell>
                      <CTableDataCell>{header.metadata?.hsn_code || ''}</CTableDataCell>
                      <CTableDataCell>{header.metadata?.gst_rate || ''}</CTableDataCell>
                      <CTableDataCell>
                        <span className={`badge bg-${header.is_mandatory ? 'success' : 'secondary'}`}>
                          {header.is_mandatory ? 'Yes' : 'No'}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <span className={`badge bg-${header.is_discount ? 'success' : 'secondary'}`}>
                          {header.is_discount ? 'Yes' : 'No'}
                        </span>
                      </CTableDataCell>
                      {showActionColumn && (
                        <CTableDataCell>
                          <div className="dropdown-container" ref={el => dropdownRefs.current[header._id] = el}>
                            <CButton 
                              size="sm"
                              className='option-button btn-sm'
                              onClick={() => toggleDropdown(header._id)}
                            >
                              <CIcon icon={cilSettings} />
                              Options
                            </CButton>
                            {dropdownOpen[header._id] && (
                              <div className="dropdown-menu show">
                                {hasEditPermission && (
                                  <Link className="dropdown-item" to={`/headers/update-header/${header._id}`}>
                                    <CIcon icon={cilPencil} className="me-2" /> Edit
                                  </Link>
                                )}
                                {hasDeletePermission && (
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => handleDelete(header._id)}
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
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>

      <CModal visible={exportTypeDialogOpen} onClose={() => setExportTypeDialogOpen(false)}>
        <CModalHeader>
          <CModalTitle>Select Export Target</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <CButton onClick={() => handleExportTypeSelect('branch')} className="custom-modal-button">
              Branch
            </CButton>
            <CButton onClick={() => handleExportTypeSelect('subdealer')} className="custom-modal-button">
              Subdealer
            </CButton>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setExportTypeDialogOpen(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {/* CSV Export Modal */}
      <CModal visible={csvDialogOpen} onClose={() => setCsvDialogOpen(false)}>
        <CModalHeader>
          <CModalTitle>Export Excel</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label">Model Type:</label>
            <CFormSelect
              value={selectedModelType}
              onChange={(e) => setSelectedModelType(e.target.value)}
            >
              <option value="">-- Select Model Type --</option>
              <option value="EV">EV</option>
              <option value="ICE">ICE</option>
            </CFormSelect>
          </div>

          {exportTarget === 'branch' ? (
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
          ) : (
            <div className="mb-3">
              <label className="form-label">Subdealer:</label>
              <CFormSelect
                value={selectedSubdealerId}
                onChange={(e) => setSelectedSubdealerId(e.target.value)}
              >
                <option value="">-- Select Subdealer --</option>
                {subdealers.map((subdealer) => (
                  <option key={subdealer._id} value={subdealer._id}>
                    {subdealer.name}
                  </option>
                ))}
              </CFormSelect>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setCsvDialogOpen(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleExportCSV}>
            Export
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default HeadersList;