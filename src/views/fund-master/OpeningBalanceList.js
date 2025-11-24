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
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilSettings, cilPencil, cilTrash, cilInfo } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';

const OpeningBalanceList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const branchId = storedUser.branch?._id;
  const userRole = localStorage.getItem('userRole');

  const hasEditPermission = hasPermission('VEHICLE_INWARD', 'UPDATE');
  const hasDeletePermission = hasPermission('VEHICLE_INWARD', 'DELETE');
  const hasCreatePermission = hasPermission('VEHICLE_INWARD', 'CREATE');
  const showActionColumn = hasEditPermission || hasDeletePermission;
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/branches');
      const branches = response.data.data.map((b) => ({
        ...b,
        id: b.id || b._id
      }));
      setData(branches);
      setFilteredData(branches);
    } catch (error) {
      console.error('Error fetching data', error);
      showError(error.response?.data?.message || 'Failed to fetch branches');
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

  const handleViewHistory = (branchId) => {
    const branch = data.find((b) => b.id === branchId);
    setSelectedBranch(branch);
    setHistoryModalOpen(true);
    handleClose();
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedBranch(null);
  };

  const handleDelete = async (id) => {
    const branch = data.find((b) => b.id === id);
    const result = await confirmDelete(`Are you sure you want to reset the opening balance for ${branch.name}?`);

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/branches/${id}/opening-balance`);
        fetchData();
        showSuccess(`Opening balance for ${branch.name} has been reset`);
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to reset balance');
      }
    }
  };

  const addNew = () => {
    navigate('/add-balance');
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('branch'));
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Add Opening Balance</div>
    
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
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Opening Balance</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={showActionColumn ? "4" : "3"} className="text-center">
                      No branches available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((branch, index) => (
                    <CTableRow key={branch.id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{branch.name}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <span>₹{branch.opening_balance || 0}</span>
                          {branch.opening_balance_history?.length > 0 && (
                            <CButton
                              size="sm"
                              color="link"
                              className="ms-2 p-0"
                              onClick={() => handleViewHistory(branch.id)}
                              title={`View history (last updated: ${formatDate(branch.opening_balance_history[0].date)})`}
                            >
                              <CIcon icon={cilInfo} className="text-info" />
                            </CButton>
                          )}
                        </div>
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
                            <Link className="Link" to={`/update-balance/${branch.id}`}>
                              <MenuItem style={{ color: 'black' }}><CIcon icon={cilPencil} className="me-2" />Edit</MenuItem>
                            </Link>
                            <MenuItem onClick={() => handleViewHistory(branch.id)}>
                              <CIcon icon={cilInfo} className="me-2" />View History
                            </MenuItem>
                            <MenuItem onClick={() => handleDelete(branch.id)}>
                              <CIcon icon={cilTrash} className="me-2" />Reset Balance
                            </MenuItem>
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

      {/* History Modal */}
      <CModal alignment="center" visible={historyModalOpen} onClose={closeHistoryModal}>
        <CModalHeader>
          <CModalTitle>
            Opening Balance History for {selectedBranch?.name}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedBranch?.opening_balance_history?.length > 0 ? (
            <div className="list-group">
              {selectedBranch.opening_balance_history.map((entry, index) => (
                <div key={index} className="list-group-item">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">₹{entry.amount}</h6>
                    <small>{formatDate(entry.date)}</small>
                  </div>
                  {entry.note && (
                    <p className="mb-1 text-muted">{entry.note}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted p-3">
              No history available for this branch
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeHistoryModal}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default OpeningBalanceList;