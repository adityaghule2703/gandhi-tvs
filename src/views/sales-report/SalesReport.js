import '../../css/table.css';
import '../../css/salesReport.css';
import { 
  React, 
  useState, 
  useEffect, 
  useTableFilter, 
  usePagination, 
  axiosInstance 
} from '../../utils/tableImports';
import { 
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
  CRow,
  CCol
} from '@coreui/react';

const SalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({});
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/bookings/stats`);
      setStats(response.data.data.counts);
      setData(response.data.data.salesExecutiveStats);
      setFilteredData(response.data.data.salesExecutiveStats);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, ['salesExecutiveName']);
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
        Error loading sales report: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Sales Report</div>

      {/* Stats Cards Section */}
      <CRow className="mb-4">
        <CCol md={4}>
          <CCard className="text-center stats-card">
            <CCardBody>
              <h5 className="card-title">Today</h5>
              <h3 className="card-text text-primary">{stats.today || 0}</h3>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard className="text-center stats-card">
            <CCardBody>
              <h5 className="card-title">This Week</h5>
              <h3 className="card-text text-success">{stats.thisWeek || 0}</h3>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard className="text-center stats-card">
            <CCardBody>
              <h5 className="card-title">This Month</h5>
              <h3 className="card-text text-info">{stats.thisMonth || 0}</h3>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    
      <CCard className='table-container mt-4'>
        
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
                  <CTableHeaderCell>Sales Executive</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Bookings Count</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="4" className="text-center">
                      No sales executives found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((executive, index) => (
                    <CTableRow key={executive.salesExecutiveId || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{executive.salesExecutiveName}</CTableDataCell>
                      <CTableDataCell>{executive.salesExecutiveEmail}</CTableDataCell>
                      <CTableDataCell>{executive.count}</CTableDataCell>
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

export default SalesReport;