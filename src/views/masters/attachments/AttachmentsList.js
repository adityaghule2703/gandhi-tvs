import { hasPermission } from '../../../utils/permissionUtils';
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
  axiosInstance,
  // FaCheckCircle,
  // FaTimesCircle
} from '../../../utils/tableImports';
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
import { cilPlus, cilSettings, cilPencil, cilTrash, cilCheckCircle, cilXCircle } from '@coreui/icons';

const AttachmentsList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);

  const { currentRecords, PaginationOptions } = usePagination(Array.isArray(filteredData) ? filteredData : []);

  const hasEditPermission = hasPermission('ATTACHMENTS', 'UPDATE');
  const hasDeletePermission = hasPermission('ATTACHMENTS', 'DELETE');
  const hasCreatePermission = hasPermission('ATTACHMENTS', 'CREATE');
  const showActionColumn = hasEditPermission || hasDeletePermission;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/attachments`);
      setData(response.data.data.attachments);
      setFilteredData(response.data.data.attachments);
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
        await axiosInstance.delete(`/attachments/${id}`);
        setData(data.filter((attachment) => attachment.id !== id));
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
    handleFilter(value, getDefaultSearchFields('attachments'));
  };

  const renderAttachmentPreviews = (attachments, type) => {
    const filtered = attachments.filter((a) => a.type === type);

    if (filtered.length === 0) return <CBadge color="secondary">None</CBadge>;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {filtered.map((attachment, idx) => {
          switch (attachment.type) {
            case 'image':
              return (
                <img
                  key={idx}
                  src={`${axiosInstance.defaults.baseURL}${attachment.url}`}
                  alt="Attachment"
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(`${axiosInstance.defaults.baseURL}${attachment.url}`, '_blank')}
                />
              );
            case 'video':
              return (
                <div
                  key={idx}
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(`${axiosInstance.defaults.baseURL}${attachment.url}`, '_blank')}
                >
                  <CIcon icon={cilVideo} style={{ color: '#666' }} />
                </div>
              );
            case 'document':
              return (
                <div
                  key={idx}
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(`${axiosInstance.defaults.baseURL}${attachment.url}`, '_blank')}
                >
                  <CIcon icon={cilFile} style={{ color: '#666' }} />
                </div>
              );
            case 'youtube':
              return (
                <div
                  key={idx}
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(attachment.url, '_blank')}
                >
                  <CIcon icon={cilYoutube} style={{ color: 'red' }} />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    );
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
        Error loading attachments: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Attachments</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasCreatePermission && (
              <Link to="/attachments/add-attachments">
                <CButton size="sm" className="action-btn me-1">
                  <CIcon icon={cilPlus} className='icon'/> New Attachment
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
                  <CTableHeaderCell>Title</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
                  <CTableHeaderCell>Images</CTableHeaderCell>
                  <CTableHeaderCell>Videos</CTableHeaderCell>
                  <CTableHeaderCell>Documents</CTableHeaderCell>
                  <CTableHeaderCell>YouTube</CTableHeaderCell>
                  <CTableHeaderCell>Apply to all models?</CTableHeaderCell>
                  <CTableHeaderCell>Applicable models</CTableHeaderCell>
                  <CTableHeaderCell>Created At</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={showActionColumn ? "11" : "10"} className="text-center">
                      No attachments available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((attachment, index) => (
                    <CTableRow key={attachment.id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{attachment.title}</CTableDataCell>
                      <CTableDataCell>
                        {attachment.description && attachment.description.substring(0, 50)}
                        {attachment.description && attachment.description.length > 50 ? '...' : ''}
                      </CTableDataCell>
                      <CTableDataCell>{renderAttachmentPreviews(attachment.attachments, 'image')}</CTableDataCell>
                      <CTableDataCell>{renderAttachmentPreviews(attachment.attachments, 'video')}</CTableDataCell>
                      <CTableDataCell>{renderAttachmentPreviews(attachment.attachments, 'document')}</CTableDataCell>
                      <CTableDataCell>{renderAttachmentPreviews(attachment.attachments, 'youtube')}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={attachment.isForAllModels ? 'success' : 'secondary'}>
                          {attachment.isForAllModels ? (
                            <>
                              <CIcon icon={cilCheckCircle} className="me-1" />
                              Yes
                            </>
                          ) : (
                            <>
                              <CIcon icon={cilXCircle} className="me-1" />
                              No
                            </>
                          )}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {attachment.isForAllModels
                          ? <CBadge color="primary">All Models</CBadge>
                          : Array.isArray(attachment.applicableModels) && attachment.applicableModels.length > 0
                            ? attachment.applicableModels.map((model) => model.model_name).join(', ')
                            : <CBadge color="secondary">—</CBadge>}
                      </CTableDataCell>
                      <CTableDataCell>{new Date(attachment.createdAt).toLocaleDateString()}</CTableDataCell>
                      {showActionColumn && (
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            className='option-button btn-sm'
                            onClick={(event) => handleClick(event, attachment.id)}
                          >
                            <CIcon icon={cilSettings} />
                            Options
                          </CButton>
                          <Menu
                            id={`action-menu-${attachment.id}`}
                            anchorEl={anchorEl}
                            open={menuId === attachment.id}
                            onClose={handleClose}
                          >
                            {hasEditPermission && (
                              <Link className="Link" to={`/attachments/update-attachments/${attachment._id}`}>
                                <MenuItem style={{ color: 'black' }}>
                                  <CIcon icon={cilPencil} className="me-2" />
                                  Edit
                                </MenuItem>
                              </Link>
                            )}
                            {hasDeletePermission && (
                              <MenuItem onClick={() => handleDelete(attachment._id)}>
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

export default AttachmentsList;