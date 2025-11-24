import { hasPermission } from '../../../utils/permissionUtils';
import '../../../css/table.css';
import {
  React,
  useEffect,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  axiosInstance,
  confirmDelete,
  showSuccess,
  showError
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
import { cilTrash } from '@coreui/icons';

const RangeList = ({ ranges, onDelete }) => {
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData || []);
  const [searchTerm, setSearchTerm] = React.useState('');

  const hasDeletePermission = hasPermission('BROKER', 'DELETE');
  const showActionColumn = hasDeletePermission;

  useEffect(() => {
    const rangeData = Array.isArray(ranges) ? ranges : [];
    setData(rangeData);
    setFilteredData(rangeData);
  }, [ranges]);

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/commission-ranges/${id}`);
        onDelete();
        showSuccess('Range deleted successfully!');
      } catch (error) {
        console.log('Delete error:', error);
        showError(error.response?.data?.message || 'Failed to delete range');
      }
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('range'));
  };

  return (
    <CCard className='table-container mt-4'>
      <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
        <div>
          <h6 className="mb-0">Commission Ranges</h6>
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
              placeholder="Search commission ranges..."
            />
          </div>
        </div>
        
        <div className="responsive-table-wrapper">
          <CTable striped bordered hover className='responsive-table'>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Sr.no</CTableHeaderCell>
                <CTableHeaderCell>Min Amount</CTableHeaderCell>
                <CTableHeaderCell>Max Amount</CTableHeaderCell>
                {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentRecords && currentRecords.length === 0 ? (
                <CTableRow>
                  <CTableDataCell colSpan={showActionColumn ? "4" : "3"} className="text-center">
                    <CBadge color="secondary">No commission ranges available</CBadge>
                  </CTableDataCell>
                </CTableRow>
              ) : (
                currentRecords.map((range, index) => (
                  <CTableRow key={range.id || range._id || index}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="info">₹{range.minAmount}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="success">₹{range.maxAmount}</CBadge>
                    </CTableDataCell>
                    {showActionColumn && (
                      <CTableDataCell>
                        {hasDeletePermission && (
                          <CButton
                            size="sm"
                            color="danger"
                            className='action-btn'
                            onClick={() => handleDelete(range._id)}
                            title="Delete commission range"
                          >
                            <CIcon icon={cilTrash} className="me-1" />
                            Delete
                          </CButton>
                        )}
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
  );
};

export default RangeList;