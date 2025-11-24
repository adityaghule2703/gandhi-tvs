import React, { useState, useEffect } from 'react';
import { 
  CFormInput, 
  CNav, 
  CNavItem, 
  CNavLink, 
  CTabContent, 
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormCheck,
  CSpinner,
  CFormLabel
} from '@coreui/react';
import { axiosInstance, useTableFilter } from '../../utils/tableImports';
import '../../css/invoice.css';
import '../../css/table.css';
import { showError, showFormSubmitToast } from '../../utils/sweetAlerts';
import { hasPermission } from '../../utils/permissionUtils';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilZoomOut, cilCheckCircle } from '@coreui/icons';

function RTOTax() {
  const [activeTab, setActiveTab] = useState(0);
  const [receiptNoSearch, setReceiptNoSearch] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: pendingData,
    setData: setPendingData,
    filteredData: filteredPendings,
    setFilteredData: setFilteredPendings
  } = useTableFilter([]);

  const {
    data: approvedData,
    setData: setApprovedData,
    filteredData: filteredApproved,
    setFilteredData: setFilteredApproved,
    handleFilter: handleApprovedFilter
  } = useTableFilter([]);

  useEffect(() => {
    fetchData();
    fetchLocationData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/rtoProcess/rtotaxpending`);
      setPendingData(response.data.data);
      setFilteredPendings(response.data.data);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationData = async () => {
    try {
      const response = await axiosInstance.get(`/rtoProcess/rtotaxcompleted`);
      setApprovedData(response.data.data);
      setFilteredApproved(response.data.data);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  const handleRTOAmountChange = (id, value) => {
    const updatedData = filteredPendings.map((item) => (item._id === id ? { ...item, rtoAmount: value } : item));
    setFilteredPendings(updatedData);
  };

  const handleNumberPlateChange = (id, value) => {
    const updatedData = filteredPendings.map((item) => (item._id === id ? { ...item, numberPlate: value } : item));
    setFilteredPendings(updatedData);
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredPendings.map((item) => item._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleUpdateSelected = async () => {
    if (!receiptNumber) {
      showError('Please enter a receipt number');
      return;
    }

    if (selectedRows.length === 0) {
      showError('Please select at least one record to update');
      return;
    }

    try {
      const updates = filteredPendings
        .filter((item) => selectedRows.includes(item._id))
        .map((item) => ({
          rtoId: item._id,
          rtoAmount: item.rtoAmount || 0,
          numberPlate: item.numberPlate || ''
        }));

      const requestBody = { receiptNumber, updates };

      const response = await axiosInstance.put('/rtoProcess/update-rto-details', requestBody);

      if (response.data.success) {
        showFormSubmitToast(response.data.message || 'Selected records updated successfully!');
      } else {
        showError(
          `${response.data.message}\n\nExceeded Records:\n${response.data.exceededUpdates
            .map((ex) => `RTO ID: ${ex.rtoId}, Requested: ${ex.requestedAmount}, Allowed: ${ex.allowedAmount}`)
            .join('\n')}`
        );
      }
      setReceiptNumber('');
      setSelectedRows([]);
      fetchData();
      fetchLocationData();
    } catch (error) {
      console.error('Error updating RTO details:', error.response?.data || error.message);
      showError(`Failed to update RTO details: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleReceiptNoSearch = (e) => {
    setReceiptNoSearch(e.target.value);
    if (e.target.value === '') {
      setFilteredPendings(pendingData);
    } else {
      const filtered = pendingData.filter(
        (booking) =>
          booking.bookingId?.bookingNumber?.toString().includes(e.target.value) ||
          booking.bookingId?.chassisNumber?.includes(e.target.value) ||
          booking.bookingId?.model?.model_name.includes(e.target.value) ||
          booking.bookingId?.customerName.includes(e.target.value) ||
          booking.bookingId?.customerMobile?.includes(e.target.value)
      );
      setFilteredPendings(filtered);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setReceiptNoSearch('');
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setReceiptNoSearch('');
    setFilteredPendings(pendingData);
  };

  const renderPendingTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">
                <CFormCheck
                  onChange={handleSelectAll}
                  checked={selectedRows.length === filteredPendings.length && filteredPendings.length > 0}
                />
              </CTableHeaderCell>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">RTO Amount</CTableHeaderCell>
              <CTableHeaderCell scope="col">Registration Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Model Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Customer Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Contact Number</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredPendings.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="9" style={{ color: 'red', textAlign: 'center' }}>
                  No data available
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredPendings.map((item, index) => (
                <CTableRow key={item._id}>
                  <CTableDataCell>
                    <CFormCheck
                      checked={selectedRows.includes(item._id)}
                      onChange={() => toggleRowSelection(item._id)}
                    />
                  </CTableDataCell>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{item.bookingId?.bookingNumber || 'N/A'}</CTableDataCell>
                  <CTableDataCell>
                    <CFormInput
                      type="number"
                      value={item.rtoAmount || ''}
                      onChange={(e) => handleRTOAmountChange(item._id, e.target.value)}
                      size="sm"
                      style={{ width: '100px' }}
                    />
                  </CTableDataCell>
                  <CTableDataCell>
                    <CFormInput
                      type="text"
                      value={item.numberPlate || ''}
                      onChange={(e) => handleNumberPlateChange(item._id, e.target.value)}
                      size="sm"
                      style={{ width: '120px' }}
                    />
                  </CTableDataCell>
                  <CTableDataCell>{item.bookingId?.model?.model_name || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{item.bookingId?.chassisNumber || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{item.bookingId?.customerName || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{item.bookingId?.customerMobile || 'N/A'}</CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>
    );
  };

  const renderTaxPaidTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Model Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Customer Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Contact Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">RTO Tax</CTableHeaderCell>
              <CTableHeaderCell scope="col">Number Plate</CTableHeaderCell>
              <CTableHeaderCell scope="col">Receipt Number</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredApproved.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="9" style={{ color: 'red', textAlign: 'center' }}>
                  No data available
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredApproved.map((item, index) => (
                <CTableRow key={item._id}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{item.bookingId?.bookingNumber || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{item.bookingId?.model?.model_name || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{item.bookingId?.chassisNumber || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{item.bookingId?.customerName || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{item.bookingId?.customerMobile || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{item.rtoAmount || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{item.numberPlate || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{item.receiptNumber || 'N/A'}</CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
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
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>RTO Tax Management</div>
      
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {activeTab === 0 && (
              <div className="d-flex align-items-center gap-2">
                <CFormInput
                  type="text"
                  placeholder="Receipt Number"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  style={{ width: '200px' }}
                  size="sm"
                />
                {hasPermission('RTO_PROCESS', 'UPDATE') && (
                  <CButton 
                    size="sm" 
                    className="action-btn"
                    onClick={handleUpdateSelected}
                  >
                    <CIcon icon={cilCheckCircle} className="me-1" />
                    Update Selected ({selectedRows.length})
                  </CButton>
                )}
              </div>
            )}
            <CButton 
              size="sm" 
              className="action-btn me-1"
            >
              <CIcon icon={cilSearch} className='icon' /> Search
            </CButton>
            {(searchTerm || receiptNoSearch) && (
              <CButton 
                size="sm" 
                color="secondary" 
                className="action-btn me-1"
                onClick={handleResetSearch}
              >
                <CIcon icon={cilZoomOut} className='icon' /> Reset Search
              </CButton>
            )}
          </div>
        </CCardHeader>
        
        <CCardBody>
          <CNav variant="tabs" className="mb-3 border-bottom">
            <CNavItem>
              <CNavLink
                active={activeTab === 0}
                onClick={() => handleTabChange(0)}
                style={{ 
                  cursor: 'pointer',
                  borderTop: activeTab === 0 ? '4px solid #2759a2' : '3px solid transparent',
                  color: 'black',
                  borderBottom: 'none'
                }}
              >
                RTO PENDING TAX
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 1}
                onClick={() => handleTabChange(1)}
                style={{ 
                  cursor: 'pointer',
                  borderTop: activeTab === 1 ? '4px solid #2759a2' : '3px solid transparent',
                  borderBottom: 'none',
                  color: 'black'
                }}
              >
                TAX PAID
              </CNavLink>
            </CNavItem>
          </CNav>

          <div className="d-flex justify-content-between mb-3">
            <div></div>
            <div className='d-flex'>
              <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
              <CFormInput
                type="text"
                style={{maxWidth: '350px', height: '30px', borderRadius: '0'}}
                className="d-inline-block square-search"
                value={activeTab === 0 ? receiptNoSearch : searchTerm}
                onChange={(e) => {
                  if (activeTab === 0) {
                    handleReceiptNoSearch(e);
                  } else {
                    setSearchTerm(e.target.value);
                    handleApprovedFilter(e.target.value);
                  }
                }}
              />
            </div>
          </div>

          <CTabContent>
            <CTabPane visible={activeTab === 0}>
              {renderPendingTable()}
            </CTabPane>
            <CTabPane visible={activeTab === 1}>
              {renderTaxPaidTable()}
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </div>
  );
}

export default RTOTax;