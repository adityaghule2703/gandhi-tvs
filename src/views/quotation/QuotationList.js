import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { faFileExcel, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import '../../css/table.css';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getDefaultSearchFields, useTableFilter } from '../../utils/tableFilters';
import { usePagination } from '../../utils/pagination.jsx';
import axiosInstance from '../../axiosInstance';
import { confirmDelete, showError, showSuccess } from '../../utils/sweetAlerts';
import TextField from '@mui/material/TextField';
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPrint, cilPlus, cilSettings, cilTrash } from '@coreui/icons';

const CustomersList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [openDateModal, setOpenDateModal] = useState(false);

  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(Array.isArray(filteredData) ? filteredData : []);

  useEffect(() => {
    fetchBranches();
    fetchData();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/branches');
      setBranches(response.data.data);
    } catch (error) {
      console.log('Error fetching branches', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/quotations`);
      setData(response.data.data.quotations);
      setFilteredData(response.data.data.quotations);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (quotation) => {
    try {
      Swal.fire({
        title: 'Preparing PDF',
        text: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const pdfUrl = quotation.pdfUrl;
      const fullPdfUrl = `${axiosInstance.defaults.baseURL}/${pdfUrl}`;

      const link = document.createElement('a');
      link.href = fullPdfUrl;
      link.setAttribute('download', `quotation_${quotation.quotation_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.close();
      showSuccess('Quotation downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Swal.close();
      showError('Failed to download quotation. Please try again.');
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

  const handleOpenDateModal = () => {
    setOpenDateModal(true);
  };

  const handleCloseDateModal = () => {
    setOpenDateModal(false);
    setStartDate(null);
    setEndDate(null);
  };

  const handleExcelExport = async (dateRange = false) => {
    try {
      let url = '/quotations/export';
      let params = {};

      if (dateRange && startDate && endDate && selectedBranchId) {
        params = {
          branchId: selectedBranchId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
      }

      const response = await axiosInstance.get(url, {
        responseType: 'blob',
        params: params
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;

      let fileName = `customers_${params.startDate}_to_${params.endDate}_branch_${selectedBranchId}.xlsx`;

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Excel exported successfully!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });

      if (dateRange) {
        handleCloseDateModal();
      }
    } catch (error) {
      try {
        if (error.response && error.response.data instanceof Blob && error.response.data.type === 'application/json') {
          const errorText = await error.response.data.text();
          const errorData = JSON.parse(errorText);
          showError(errorData.message || 'Failed to export Excel');
        } else {
          showError(error.message || 'Failed to export Excel');
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        showError('Unexpected error occurred');
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/customers/${id}`);
        setData(data.filter((customer) => customer.id !== id));
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
    handleFilter(value, getDefaultSearchFields('customers'));
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
        Error loading customers quotation: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Customers Quotation</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            <Link to="/add-quotation">
              <CButton 
                size="sm" 
                className="action-btn me-1"
              >
                <CIcon icon={cilPlus} className='icon' /> New
              </CButton>
            </Link>
            <CButton 
              size="sm" 
              className="action-btn me-1"
              onClick={handleOpenDateModal}
              title="Excel Export"
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
                  <CTableHeaderCell>Address</CTableHeaderCell>
                  <CTableHeaderCell>Taluka</CTableHeaderCell>
                  <CTableHeaderCell>District</CTableHeaderCell>
                  <CTableHeaderCell>Mobile Number</CTableHeaderCell>
                  <CTableHeaderCell>Quotation</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="8" className="text-center">
                      No quotation available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((customer, index) => (
                    <CTableRow key={customer.id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{customer.customer.name}</CTableDataCell>
                      <CTableDataCell>{customer.customer.address}</CTableDataCell>
                      <CTableDataCell>{customer.customer.taluka}</CTableDataCell>
                      <CTableDataCell>{customer.customer.district}</CTableDataCell>
                      <CTableDataCell>{customer.customer.mobile1}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="primary"
                          variant="outline"
                          onClick={() => handleDownloadPdf(customer)}
                          title="Download Quotation PDF"
                        >
                          <CIcon icon={cilPrint} />
                        </CButton>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          className='option-button btn-sm'
                          onClick={(event) => handleClick(event, customer.id)}
                        >
                          <CIcon icon={cilSettings} />
                          Options
                        </CButton>
                        <Menu 
                          id={`action-menu-${customer.id}`} 
                          anchorEl={anchorEl} 
                          open={menuId === customer.id} 
                          onClose={handleClose}
                        >
                          <MenuItem onClick={() => handleDelete(customer.id)}>
                            <CIcon icon={cilTrash} className="me-2" />
                            Delete
                          </MenuItem>
                        </Menu>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>

      {/* Date Range Modal */}
      <CModal alignment="center" visible={openDateModal} onClose={handleCloseDateModal}>
        <CModalHeader>
          <CModalTitle>
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            Select Date Range
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="mb-3">
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </div>
            <div className="mb-3">
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                minDate={startDate}
              />
            </div>
          </LocalizationProvider>
          <TextField
            select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            fullWidth
            size="small"
            SelectProps={{ native: true }}
          >
            <option value="">-- Select Branch --</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </TextField>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseDateModal}>
            Cancel
          </CButton>
          <CButton 
            color="primary" 
            onClick={() => handleExcelExport(true)}
            disabled={!startDate || !endDate || !selectedBranchId}
          >
            Export
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default CustomersList;