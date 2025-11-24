import '../../css/table.css';
import {
  React,
  useState,
  useEffect,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  showError,
  showSuccess,
  axiosInstance
} from '../../utils/tableImports';
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
  CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCloudUpload} from '@coreui/icons';

const UploadDealForm = () => {
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);
  const [uploading, setUploading] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/bookings`);
      const branchBookings = response.data.data.bookings.filter((booking) => booking.bookingType === 'BRANCH');
      setData(branchBookings);
      setFilteredData(branchBookings);
    } catch (error) {
      console.log('Error fetching data', error);
      showError('Failed to fetch pending bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (bookingId, fileType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validFileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validFileTypes.includes(file.type)) {
      showError('Please upload a PDF, JPEG, or PNG file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading((prev) => ({ ...prev, [`${bookingId}-${fileType}`]: true }));

    try {
      const endpoint = fileType === 'dealForm' ? `/bookings/${bookingId}/deal-form` : `/bookings/${bookingId}/delivery-challan`;

      const response = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showSuccess(`${fileType === 'dealForm' ? 'Deal form' : 'Delivery challan'} uploaded successfully!`);

      // Refresh data to reflect changes
      fetchData();
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      showError(`Failed to upload ${fileType === 'dealForm' ? 'deal form' : 'delivery challan'}`);
    } finally {
      // Reset uploading state
      setUploading((prev) => ({ ...prev, [`${bookingId}-${fileType}`]: false }));

      // Reset the file input
      event.target.value = '';
    }
  };

  // Function to handle viewing the uploaded document
  const handleViewDocument = (documentPath) => {
    if (documentPath) {
      // Construct the full URL to the document
      const fullUrl = `${axiosInstance.defaults.baseURL}${documentPath}`;
      window.open(fullUrl, '_blank');
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('booking'));
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
      <div className='title'>Upload Deal Form & Delivery Challan</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
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
        </CCardHeader>
        
        <CCardBody>
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Booking Number</CTableHeaderCell>
                  <CTableHeaderCell>Customer Name</CTableHeaderCell>
                  <CTableHeaderCell>Model Name</CTableHeaderCell>
                  <CTableHeaderCell>Chassis Number</CTableHeaderCell>
                  <CTableHeaderCell>Deal Form</CTableHeaderCell>
                  <CTableHeaderCell>Delivery Challan</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="7" className="text-center">
                      No pending bookings available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((booking, index) => (
                    <CTableRow key={booking._id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{booking.bookingNumber}</CTableDataCell>
                      <CTableDataCell>{booking.customerDetails?.name}</CTableDataCell>
                      <CTableDataCell>{booking.model?.model_name}</CTableDataCell>
                      <CTableDataCell>{booking.chassisNumber}</CTableDataCell>
                      <CTableDataCell>
                        {booking.documentStatus?.dealForm?.status === 'COMPLETED' && booking.dealForm ? (
                          <CButton
                            size="sm"
                            color="info"
                            className="action-btn"
                            onClick={() => handleViewDocument(booking.dealForm.path)}
                          >
                            View
                          </CButton>
                        ) : (
                          <div className="file-upload-container">
                            <input
                              type="file"
                              id={`deal-form-${booking._id}`}
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload(booking._id, 'dealForm', e)}
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <CButton
                              size="sm"
                              color="primary"
                              className="action-btn"
                              onClick={() => document.getElementById(`deal-form-${booking._id}`).click()}
                              disabled={uploading[`${booking._id}-dealForm`]}
                            >
                              <CIcon icon={cilCloudUpload} className="me-1" />
                              {uploading[`${booking._id}-dealForm`] ? 'Uploading...' : 'Upload'}
                            </CButton>
                          </div>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        {booking.documentStatus?.deliveryChallan?.status === 'COMPLETED' && booking.deliveryChallan ? (
                          <CButton
                            size="sm"
                            color="info"
                            className="action-btn"
                            onClick={() => handleViewDocument(booking.deliveryChallan.path)}
                          >
                            <CIcon icon={cilEye} className="me-1" />
                            View
                          </CButton>
                        ) : (
                          <div className="file-upload-container">
                            <input
                              type="file"
                              id={`delivery-challan-${booking._id}`}
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload(booking._id, 'deliveryChallan', e)}
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <CButton
                              size="sm"
                              color="primary"
                              className="action-btn"
                              onClick={() => document.getElementById(`delivery-challan-${booking._id}`).click()}
                              disabled={uploading[`${booking._id}-deliveryChallan`]}
                            >
                              <CIcon icon={cilCloudUpload} className="me-1" />
                              {uploading[`${booking._id}-deliveryChallan`] ? 'Uploading...' : 'Upload'}
                            </CButton>
                          </div>
                        )}
                      </CTableDataCell>
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

export default UploadDealForm;