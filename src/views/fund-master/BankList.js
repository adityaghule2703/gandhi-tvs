import '../../css/table.css'
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
} from '../../utils/tableImports';
import { hasPermission } from '../../utils/permissionUtils';
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
import { cilPlus, cilCheckCircle, cilXCircle, cilSettings, cilPencil, cilTrash } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';

const BankList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const branchId = storedUser.branch?._id;
  const userRole = localStorage.getItem('userRole');

  const hasEditPermission = hasPermission('BANK', 'UPDATE');
  const hasDeletePermission = hasPermission('BANK', 'DELETE');
  const hasCreatePermission = hasPermission('BANK', 'CREATE');
  const showActionColumn = hasEditPermission || hasDeletePermission;
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/banks`);
      setData(response.data.data.banks);
      setFilteredData(response.data.data.banks);
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
        await axiosInstance.delete(`/banks/${id}`);
        setData(data.filter((bank) => bank.id !== id));
        fetchData();
        showSuccess();
      } catch (error) {
        console.log(error);
        showError(error);
      }
    }
  };

  const handleToggleStatus = async (bankId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axiosInstance.patch(`/banks/${bankId}/status`, {
        status: newStatus
      });
      
      const updateStatus = (banks) => banks.map((bank) => 
        bank.id === bankId ? { ...bank, status: newStatus } : bank
      );

      setData((prev) => updateStatus(prev));
      setFilteredData((prev) => updateStatus(prev));

      showSuccess(`Bank ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      handleClose();
    } catch (error) {
      showError(error.message || 'Failed to update bank status');
    }
  };

  const addNew = () => {
    navigate('/add-bank');
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('cash_bank_allocation'));
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
        Error loading banks: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Bank Account Master</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasCreatePermission && (
              <CButton 
                size="sm" 
                className="action-btn me-1"
                onClick={addNew}
              >
                <CIcon icon={cilPlus} className='icon' /> New 
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
                  <CTableHeaderCell>Account Name</CTableHeaderCell>
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={showActionColumn ? "5" : "4"} className="text-center">
                      No banks available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((bank, index) => (
                    <CTableRow key={bank.id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{bank.name}</CTableDataCell>
                      <CTableDataCell>{bank.branchDetails?.name || ''}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={bank.status === 'active' ? 'success' : 'secondary'}>
                          {bank.status === 'active' ? (
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
                            onClick={(event) => handleClick(event, bank.id)}
                          >
                            <CIcon icon={cilSettings} />
                            Options
                          </CButton>
                          <Menu 
                            id={`action-menu-${bank.id}`} 
                            anchorEl={anchorEl} 
                            open={menuId === bank.id} 
                            onClose={handleClose}
                          >
                            {hasEditPermission && (
                              <Link className="Link" to={`/update-bank/${bank.id}`}>
                                <MenuItem style={{ color: 'black' }}><CIcon icon={cilPencil} className="me-2" />Edit</MenuItem>
                              </Link>
                            )}
                            {hasEditPermission && (
                              <MenuItem onClick={() => handleToggleStatus(bank.id, bank.status)}>
                                <CIcon icon={bank.status === 'active' ? cilXCircle : cilCheckCircle} className="me-2" /> 
                                {bank.status === 'active' ? 'Deactivate' : 'Activate'}
                              </MenuItem>
                            )}
                            {hasDeletePermission && (
                              <MenuItem onClick={() => handleDelete(bank.id)}>
                                <CIcon icon={cilTrash} className="me-2" />Delete
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
    </div>
  );
};

export default BankList;