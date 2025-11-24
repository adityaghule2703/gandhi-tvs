import '../../../css/table.css'
import {
  React,
  useState,
  useEffect,
  Link,
  Menu,
  MenuItem,
  useTableFilter,
  usePagination,
  confirmDelete,
  showError,
  showSuccess,
  axiosInstance,
  getDefaultSearchFields
} from '../../../utils/tableImports';
import { hasPermission } from '../../../utils/permissionUtils';
import config from '../../../config';
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
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilCheckCircle, cilXCircle, cilSettings, cilPencil, cilDelete, cilTrash } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';

const BranchList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);

  const hasEditPermission = hasPermission('BRANCH', 'UPDATE');
  const hasDeletePermission = hasPermission('BRANCH', 'DELETE');
  const hasCreatePermission = hasPermission('BRANCH', 'CREATE');
  const showActionColumn = hasEditPermission || hasDeletePermission;
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/branches`);
      setData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
    } finally {
      setLoading(false);
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
        await axiosInstance.delete(`/branches/${id}`);
        setData(data.filter((branch) => branch.id !== id));
        fetchData();
        showSuccess();
      } catch (error) {
        console.log(error);
        showError(error);
      }
    }
  };

  const handleToggleStatus = async (branchId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axiosInstance.patch(`/branches/${branchId}/status`, {
        is_active: newStatus
      });
      const updateStatus = (branches) => branches.map((branch) => (branch.id === branchId ? { ...branch, is_active: newStatus } : branch));

      setData((prev) => updateStatus(prev));
      setFilteredData((prev) => updateStatus(prev));

      showSuccess(`Branch ${newStatus ? 'activated' : 'deactivated'} successfully`);
      handleClose();
    } catch (error) {
      showError(error.message || 'Failed to update branch status');
    }
  };

  const addNew = () => {
    navigate('/branch/add-branch');
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('branch'));
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
        Error loading branches: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Branches</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasCreatePermission && (
              <CButton 
                size="sm" 
                className="action-btn me-1"
                onClick={addNew}
              >
                <CIcon icon={cilPlus} className='icon' /> New Branch
              </CButton>
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
              />
            </div>
          </div>
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Branch name</CTableHeaderCell>
                  <CTableHeaderCell>Address</CTableHeaderCell>
                  <CTableHeaderCell>City</CTableHeaderCell>
                  <CTableHeaderCell>State</CTableHeaderCell>
                  <CTableHeaderCell>Pincode</CTableHeaderCell>
                  <CTableHeaderCell>Phone</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>GST Number</CTableHeaderCell>
                  <CTableHeaderCell>Logo1</CTableHeaderCell>
                  <CTableHeaderCell>Logo2</CTableHeaderCell>
                  <CTableHeaderCell>Is active</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={showActionColumn ? "13" : "12"} className="text-center">
                      No branches available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((branch, index) => (
                    <CTableRow key={branch.id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{branch.name}</CTableDataCell>
                      <CTableDataCell>{branch.address}</CTableDataCell>
                      <CTableDataCell>{branch.city}</CTableDataCell>
                      <CTableDataCell>{branch.state}</CTableDataCell>
                      <CTableDataCell>{branch.pincode}</CTableDataCell>
                      <CTableDataCell>{branch.phone}</CTableDataCell>
                      <CTableDataCell>{branch.email}</CTableDataCell>
                      <CTableDataCell>{branch.gst_number}</CTableDataCell>
                      <CTableDataCell>
                        {branch.logo1 && (
                          <img 
                            src={`${config.baseURL || ''}${branch.logo1}`} 
                            alt="Logo 1" 
                            style={{ maxWidth: '100px', maxHeight: '50px', objectFit: 'contain' }} 
                          />
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        {branch.logo2 && (
                          <img 
                            src={`${config.baseURL || ''}${branch.logo2}`} 
                            alt="Logo 2" 
                            style={{ maxWidth: '100px', maxHeight: '50px', objectFit: 'contain' }} 
                          />
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={branch.is_active ? 'success' : 'secondary'}>
                          {branch.is_active ? (
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
                              onClick={(event) => handleClick(event, branch.id)}
                            >
                              <CIcon icon={cilSettings} />
                              Options
                            </CButton>
                          <Menu 
                            id={`action-menu-${branch.id}`} 
                            anchorEl={anchorEl} 
                            open={menuId === branch.id} 
                            onClose={handleClose}
                          >
                            {hasEditPermission && (
                              <Link className="Link" to={`/branch/update-branch/${branch.id}`}>
                                <MenuItem style={{ color: 'black' }}><CIcon icon={cilPencil} className="me-2" />Edit</MenuItem>
                              </Link>
                            )}
                            {hasEditPermission && (
                              <MenuItem onClick={() => handleToggleStatus(branch.id, branch.is_active)}>
                               <CIcon icon={branch.is_active ? cilXCircle : cilCheckCircle} className="me-2" /> {branch.is_active ? 'Deactivate' : 'Activate'}
                              </MenuItem>
                            )}
                            {hasDeletePermission && (
                              <MenuItem onClick={() => handleDelete(branch.id)}><CIcon icon={cilTrash} className="me-2" />Delete</MenuItem>
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
    </div>
  );
};

export default BranchList;