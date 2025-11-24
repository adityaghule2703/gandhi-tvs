import ImportCSV from '../../../views/csv/ImportCSV';
import '../../../css/table.css';
import {
  React,
  useState,
  useEffect,
  Link,
  Menu,
  MenuItem,
  SearchOutlinedIcon,
  FontAwesomeIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  axiosInstance,
  // FaCheckCircle,
  // FaTimesCircle,
  confirmDelete,
  showError,
  showSuccess
} from '../../../utils/tableImports';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import { ClearIcon } from '@mui/x-date-pickers';
import { hasPermission } from '../../../utils/permissionUtils';
import { 
  CButton, 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CFormInput, 
  CFormLabel, 
  CTable, 
  CTableBody, 
  CTableHead, 
  CTableHeaderCell, 
  CTableRow,
  CTableDataCell,
  CSpinner,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilSettings, cilPencil, cilTrash, cilCheckCircle, cilXCircle, cilFilter } from '@coreui/icons';

const ModelList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subdealers, setSubdealers] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedSubdealer, setSelectedSubdealer] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [showBranchFilterModal, setShowBranchFilterModal] = useState(false);
  const [tempSelectedBranch, setTempSelectedBranch] = useState(selectedBranch);
  const [tempSelectedSubdealer, setTempSelectedSubdealer] = useState(selectedSubdealer);
  const [branchFilterError, setBranchFilterError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { branchId } = useParams();
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);

  const { currentRecords, PaginationOptions } = usePagination(Array.isArray(filteredData) ? filteredData : []);

  const hasEditPermission = hasPermission('MODEL', 'UPDATE');
  const hasDeletePermission = hasPermission('MODEL', 'DELETE');
  const hasCreatePermission = hasPermission('MODEL', 'CREATE');
  const showActionColumn = hasEditPermission || hasDeletePermission;

  useEffect(() => {
    fetchData();
    fetchHeaders();
    fetchBranches();
    fetchSubdealers();
  }, []);

  const fetchData = async (branchId = null, subdealerId = null) => {
    try {
      setLoading(true);
      let url = '/models/all/status';
      const params = {};

      if (branchId) {
        params.branch_id = branchId;
        setIsFiltered(true);
      } else if (subdealerId) {
        params.subdealer_id = subdealerId;
        setIsFiltered(true);
      } else {
        setIsFiltered(false);
      }

      const response = await axiosInstance.get(url, { params });
      let models = response.data.data?.models || response.data.data || [];

      models = models.map((model) => ({
        ...model,
        _id: model._id || model.id,
        prices: model.prices || []
      }));

      setData(models);
      setFilteredData(models);
    } catch (error) {
      console.error('Error fetching data', error);
      setError(error.message);
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeaders = async () => {
    try {
      const response = await axiosInstance.get('/headers');
      setHeaders(response.data.data.headers);
    } catch (error) {
      console.log('Error fetching headers', error);
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

  const handleImportSuccess = () => {
    if (selectedSubdealer) {
      fetchData(null, selectedSubdealer);
    } else {
      fetchData(selectedBranch);
    }
  };

  const getBranchNameById = (branchId) => {
    const branch = branches.find((b) => b._id === branchId);
    return branch ? branch.name : '';
  };

  const getSubdealerNameById = (subdealerId) => {
    const subdealer = subdealers.find((s) => s._id === subdealerId);
    return subdealer ? subdealer.name : '';
  };

  const handleBranchFilter = () => {
    setTempSelectedBranch(selectedBranch);
    setTempSelectedSubdealer(selectedSubdealer);
    setShowBranchFilterModal(true);
  };

  const handleApplyBranchFilter = () => {
    setSelectedBranch(tempSelectedBranch);
    setSelectedSubdealer(tempSelectedSubdealer);

    if (tempSelectedSubdealer) {
      fetchData(null, tempSelectedSubdealer);
    } else {
      fetchData(tempSelectedBranch);
    }

    setShowBranchFilterModal(false);
  };

  const handleCancelBranchFilter = () => {
    setShowBranchFilterModal(false);
    setTempSelectedBranch(selectedBranch);
    setTempSelectedSubdealer(selectedSubdealer);
    setBranchFilterError('');
  };

  const clearFilters = () => {
    setSelectedBranch(null);
    setSelectedSubdealer(null);
    fetchData();
  };

  const getPriceForHeader = (model, headerId) => {
    if (!model.prices || !Array.isArray(model.prices)) return '-';

    const header = headers.find((h) => h._id === headerId);
    if (!header) return '-';
    const priceObj = model.prices.find((price) => price.header_key === header.header_key || price.header_id === headerId);

    return priceObj ? priceObj.value : '-';
  };

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('models'));
  };

  const handleStatusUpdate = async (modelId, newStatus) => {
    try {
      await axiosInstance.put(`/models/${modelId}/status`, {
        status: newStatus
      });
      setData((prevData) => prevData.map((model) => (model._id === modelId ? { ...model, status: newStatus } : model)));
      setFilteredData((prevData) => prevData.map((model) => (model._id === modelId ? { ...model, status: newStatus } : model)));

      showSuccess(`Status updated to ${newStatus}`);
      handleClose();
    } catch (error) {
      console.log('Error updating status', error);
      showError(error.message);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/models/${id}`);
        setData(data.filter((model) => (model._id || model.id) !== id));
        fetchData();
        showSuccess();
      } catch (error) {
        console.log(error);
        showError(error);
      }
    }
  };

  const getFilterText = () => {
    if (selectedBranch) {
      return `(Filtered by Branch: ${getBranchNameById(selectedBranch)})`;
    } else if (selectedSubdealer) {
      return `(Filtered by Subdealer: ${getSubdealerNameById(selectedSubdealer)})`;
    }
    return '';
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
        Error loading models: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Models {getFilterText()}</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasCreatePermission && (
              <Link to="/model/add-model">
                <CButton size="sm" className="action-btn me-1">
                  <CIcon icon={cilPlus} className='icon'/> New Model
                </CButton>
              </Link>
            )}
            
            <CButton 
              size="sm" 
              className={`action-btn me-1 ${isFiltered ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleBranchFilter}
            >
              <CIcon icon={cilFilter} className='icon' /> Filter
            </CButton>

            {(selectedBranch || selectedSubdealer) && (
              <CButton 
                size="sm" 
                color="secondary" 
                className="action-btn me-1"
                onClick={clearFilters}
              >
                <ClearIcon className='icon' />
                Clear Filter
              </CButton>
            )}

            <ImportCSV endpoint="/csv/import" onSuccess={handleImportSuccess} buttonText="Import Excel" />
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
                  <CTableHeaderCell>Model name</CTableHeaderCell>
                  <CTableHeaderCell>Discount</CTableHeaderCell>
                  {headers.map((header) => (
                    <CTableHeaderCell key={header._id}>{header.header_key} Price</CTableHeaderCell>
                  ))}
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={headers.length + 4} className="text-center">
                      No models available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((model, index) => (
                    <CTableRow key={model._id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{model.model_name}</CTableDataCell>
                      <CTableDataCell>{model.model_discount}</CTableDataCell>
                      {headers.map((header) => (
                        <CTableDataCell key={`${model._id}-${header._id}`}>
                          {getPriceForHeader(model, header._id)}
                        </CTableDataCell>
                      ))}
                      <CTableDataCell>
                        <CBadge color={model.status === 'active' ? 'success' : 'secondary'}>
                          {model.status === 'active' ? (
                            <>
                              <CIcon icon={cilCheckCircle} className="me-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <CIcon icon={cilXCircle} className="me-1" />
                              Inactive
                            </>
                          )}
                        </CBadge>
                      </CTableDataCell>
                      {showActionColumn && (
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            className='option-button btn-sm'
                            onClick={(event) => handleClick(event, model._id)}
                          >
                            <CIcon icon={cilSettings} />
                            Options
                          </CButton>
                          <Menu 
                            id={`action-menu-${model._id}`} 
                            anchorEl={anchorEl} 
                            open={menuId === model._id} 
                            onClose={handleClose}
                          >
                            {hasEditPermission && (
                              <Link
                                className="Link"
                                to={`/model/update-model/${model._id}?branch_id=${
                                  selectedBranch || (model.prices && model.prices[0]?.branch_id) || ''
                                }`}
                              >
                                <MenuItem style={{ color: 'black' }}>
                                  <CIcon icon={cilPencil} className="me-2" />
                                  Edit
                                </MenuItem>
                              </Link>
                            )}

                            {hasEditPermission && (
                              model.status === 'active' ? (
                                <MenuItem
                                  onClick={() => handleStatusUpdate(model._id, 'inactive')}
                                >
                                  <CIcon icon={cilXCircle} className="me-2" />
                                  Mark as Inactive
                                </MenuItem>
                              ) : (
                                <MenuItem
                                  onClick={() => handleStatusUpdate(model._id, 'active')}
                                >
                                  <CIcon icon={cilCheckCircle} className="me-2" />
                                  Mark as Active
                                </MenuItem>
                              )
                            )}

                            {hasDeletePermission && (
                              <MenuItem onClick={() => handleDelete(model._id)}>
                                <CIcon icon={cilTrash} className="me-2" />
                                Delete
                              </MenuItem>
                            )}
                          </Menu>
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
      {/* Filter Modal */}
      <CModal visible={showBranchFilterModal} onClose={handleCancelBranchFilter}>
        <CModalHeader>
          <CModalTitle>Filter Models</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label">Select Branch:</label>
            <CFormSelect
              value={tempSelectedBranch || ''}
              onChange={(e) => {
                setTempSelectedBranch(e.target.value || null);
                if (e.target.value) setTempSelectedSubdealer(null);
              }}
            >
              <option value="">-- All Branches --</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </CFormSelect>
          </div>

          <div className="mb-3">
            <label className="form-label">Select Subdealer:</label>
            <CFormSelect
              value={tempSelectedSubdealer || ''}
              onChange={(e) => {
                setTempSelectedSubdealer(e.target.value || null);
                if (e.target.value) setTempSelectedBranch(null);
              }}
            >
              <option value="">-- All Subdealers --</option>
              {subdealers.map((subdealer) => (
                <option key={subdealer._id} value={subdealer._id}>
                  {subdealer.name}
                </option>
              ))}
            </CFormSelect>
          </div>

          {branchFilterError && <div className="alert alert-danger">{branchFilterError}</div>}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCancelBranchFilter}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleApplyBranchFilter}>
            Apply Filter
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default ModelList;