import { CFormSwitch } from '@coreui/react';
import '../../../css/table.css';
import {
  React,
  useState,
  useEffect,
  Link,
  Menu,
  MenuItem,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  confirmDelete,
  showError,
  showSuccess,
  axiosInstance
} from '../../../utils/tableImports';
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
  CBadge
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilSettings, cilPencil, cilTrash } from '@coreui/icons';

const AccessoriesList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);

  const hasEditPermission = hasPermission('ACCESSORIES', 'UPDATE');
  const hasDeletePermission = hasPermission('ACCESSORIES', 'DELETE');
  const hasCreatePermission = hasPermission('ACCESSORIES', 'CREATE');
  const showActionColumn = hasEditPermission || hasDeletePermission;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/accessories`);
      setData(response.data.data.accessories);
      setFilteredData(response.data.data.accessories);
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

  const handleTogglePartStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      await axiosInstance.put(`/accessories/${id}/part-number-status`, {
        part_number_status: newStatus
      });
      fetchData();
      showSuccess(`Part number status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating part number status:', error);
      showError('Failed to update part number status');
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/accessories/${id}`);
        setData(data.filter((accessories) => accessories.id !== id));
        fetchData();
        showSuccess();
      } catch (error) {
        console.log(error);
        showError(error);
      }
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('accessories'));
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
        Error loading accessories: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Accessories</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasCreatePermission && (
              <Link to="/accessories/add-accessories">
                <CButton size="sm" className="action-btn me-1">
                  <CIcon icon={cilPlus} className='icon'/> New Accessory
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
              />
            </div>
          </div>
          
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Price</CTableHeaderCell>
                  <CTableHeaderCell>GST Rate</CTableHeaderCell>
                  <CTableHeaderCell>Category</CTableHeaderCell>
                  <CTableHeaderCell>Part Number</CTableHeaderCell>
                  <CTableHeaderCell>Part Number Status</CTableHeaderCell>
                  <CTableHeaderCell>Compatible Models</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={showActionColumn ? "10" : "9"} className="text-center">
                      No accessories available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((accessories, index) => (
                    <CTableRow key={accessories.id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{accessories.name}</CTableDataCell>
                      <CTableDataCell>{accessories.description}</CTableDataCell>
                      <CTableDataCell>{accessories.price}</CTableDataCell>
                      <CTableDataCell>{accessories.gst_rate}</CTableDataCell>
                      <CTableDataCell>{accessories.categoryDetails?.header_key || ''}</CTableDataCell>
                      <CTableDataCell>{accessories.part_number}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={accessories.part_number_status === 'active' ? 'success' : 'secondary'}>
                          {accessories.part_number_status === 'active' ? 'Active' : 'Inactive'}
                        </CBadge>
                        <CFormSwitch
                          className="custom-switch-toggle ms-2"
                          checked={accessories.part_number_status === 'active'}
                          onChange={() =>
                            handleTogglePartStatus(accessories.id, accessories.part_number_status === 'active' ? 'active' : 'inactive')
                          }
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        {accessories.applicableModelsDetails?.map((model) => model.model_name).join(', ')}
                      </CTableDataCell>
                      {showActionColumn && (
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            className='option-button btn-sm'
                            onClick={(event) => handleClick(event, accessories.id)}
                          >
                            <CIcon icon={cilSettings} />
                            Options
                          </CButton>
                          <Menu
                            id={`action-menu-${accessories.id}`}
                            anchorEl={anchorEl}
                            open={menuId === accessories.id}
                            onClose={handleClose}
                          >
                            {hasEditPermission && (
                              <Link className="Link" to={`/accessories/update-accessories/${accessories.id}`}>
                                <MenuItem style={{ color: 'black' }}>
                                  <CIcon icon={cilPencil} className="me-2" />
                                  Edit
                                </MenuItem>
                              </Link>
                            )}
                            {hasDeletePermission && (
                              <MenuItem onClick={() => handleDelete(accessories.id)}>
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
    </div>
  );
};

export default AccessoriesList;