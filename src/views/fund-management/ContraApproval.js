import React, { useState, useEffect } from 'react';
import {
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CCard,
  CCardBody,
  CCardHeader,
  CFormLabel,
  CSpinner
} from '@coreui/react';
import { axiosInstance, getDefaultSearchFields, Menu, MenuItem, useTableFilter } from '../../utils/tableImports';
import '../../css/invoice.css';
import '../../css/table.css';
import Swal from 'sweetalert2';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilZoomOut, cilSettings, cilCheckCircle, cilX } from '@coreui/icons';

function ContraApproval() {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [billFile, setBillFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: pendingData,
    setData: setPendingData,
    filteredData: filteredPendings,
    setFilteredData: setFilteredPendings,
    handleFilter: handlePendingFilter
  } = useTableFilter([]);
  const {
    data: laterData,
    setData: setLaterData,
    filteredData: filteredLater,
    setFilteredData: setFilteredLater,
    handleFilter: handleLaterFilter
  } = useTableFilter([]);
  const {
    data: approvedData,
    setData: setApprovedData,
    filteredData: filteredApproved,
    setFilteredData: setFilteredApproved,
    handleFilter: handleApprovedFilter
  } = useTableFilter([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/contra-vouchers/status/pending`);
      setPendingData(response.data.data);
      setFilteredPendings(response.data.data);
    } catch (error) {
      console.log('Error fetching pending data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompleteData = async () => {
    try {
      const response = await axiosInstance.get(`/contra-vouchers/status/approved`);
      setApprovedData(response.data.data);
      setFilteredApproved(response.data.data);
    } catch (error) {
      console.log('Error fetching approved data', error);
    }
  };

  const fetchLaterData = async () => {
    try {
      const response = await axiosInstance.get(`/contra-vouchers/status/rejected`);
      setLaterData(response.data.data);
      setFilteredLater(response.data.data);
    } catch (error) {
      console.log('Error fetching approved data', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCompleteData();
    fetchLaterData();
  }, [refreshKey]);

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  const handleOpenApprovalModal = (voucher) => {
    setSelectedVoucher(voucher);
    setShowApprovalModal(true);
    handleClose();
  };

  const handleFileChange = (e) => {
    setBillFile(e.target.files[0]);
  };

  const handleStatusUpdate = async (status) => {
    try {
      const formData = new FormData();
      formData.append('status', status.toLowerCase());

      if (billFile) {
        formData.append('billUrl', billFile);
      }

      console.log('Submitting to:', `/contra-vouchers/${selectedVoucher._id}`);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axiosInstance.put(`/contra-vouchers/${selectedVoucher._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Full response:', response.data);

      setShowApprovalModal(false);
      setBillFile(null);
      setRefreshKey((prev) => prev + 1);

      Swal.fire('Approved!', 'Voucher has been approved.', 'success');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Swal.fire('Error!', 'Failed to update voucher.', 'error');
    }
  };

  const handleReject = async (voucherId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to reject this voucher',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#243c7c',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, reject it!'
      });

      if (result.isConfirmed) {
        await axiosInstance.put(`/contra-vouchers/${voucherId}`, {
          status: 'rejected'
        });

        // Immediately update UI
        const rejectedVoucher = pendingData.find((item) => item._id === voucherId);
        setPendingData((prev) => prev.filter((item) => item._id !== voucherId));
        setLaterData((prev) => [...prev, { ...rejectedVoucher, status: 'rejected' }]);
        setRefreshKey((prev) => prev + 1);
        Swal.fire('Rejected!', 'Voucher has been rejected.', 'success');
      }
    } catch (error) {
      console.log('Error rejecting voucher', error);
      Swal.fire('Error!', 'Failed to reject voucher.', 'error');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    if (activeTab === 0) handlePendingFilter('', getDefaultSearchFields('vouchers'));
    else if (activeTab === 1) handleApprovedFilter('', getDefaultSearchFields('vouchers'));
    else handleLaterFilter('', getDefaultSearchFields('vouchers'));
  };

  const renderPendingTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Voucher ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Recipient Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Voucher Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Debit</CTableHeaderCell>
              <CTableHeaderCell scope="col">Credit</CTableHeaderCell>
              <CTableHeaderCell scope="col">Payment Mode</CTableHeaderCell>
              <CTableHeaderCell scope="col">Bank Location</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
              <CTableHeaderCell scope="col">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredPendings.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="11" style={{ color: 'red', textAlign: 'center' }}>
                  No pending contra approval available
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredPendings.map((item, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{item.voucherId}</CTableDataCell>
                  <CTableDataCell>{item.recipientName}</CTableDataCell>
                  <CTableDataCell>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : ''}</CTableDataCell>
                  <CTableDataCell>{item.voucherType}</CTableDataCell>
                  <CTableDataCell>{item.voucherType === 'debit' ? item.amount : 0}</CTableDataCell>
                  <CTableDataCell>{item.voucherType === 'credit' ? item.amount : 0}</CTableDataCell>
                  <CTableDataCell>{item.paymentMode}</CTableDataCell>
                  <CTableDataCell>{item.bankLocation}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={item.status === 'pending' ? 'warning' : 'success'} shape="rounded-pill">
                      {item.status}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      className='option-button btn-sm'
                      onClick={(event) => handleClick(event, item._id)}
                    >
                      <CIcon icon={cilSettings} />
                      Options
                    </CButton>
                    <Menu id={`action-menu-${item._id}`} anchorEl={anchorEl} open={menuId === item._id} onClose={handleClose}>
                      <MenuItem onClick={() => handleOpenApprovalModal(item)} style={{ color: 'black' }}>
                        <CIcon icon={cilCheckCircle} className="me-2" /> Approve
                      </MenuItem>
                      <MenuItem onClick={() => handleReject(item._id)} style={{ color: 'black' }}>
                        <CIcon icon={cilX} className="me-2" /> Reject
                      </MenuItem>
                    </Menu>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>
    );
  };

  const renderCompletedTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Voucher ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Recipient Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Voucher Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Debit</CTableHeaderCell>
              <CTableHeaderCell scope="col">Credit</CTableHeaderCell>
              <CTableHeaderCell scope="col">Payment Mode</CTableHeaderCell>
              <CTableHeaderCell scope="col">Bank Location</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredApproved.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="10" style={{ color: 'red', textAlign: 'center' }}>
                  No data available
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredApproved.map((item, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{item.voucherId}</CTableDataCell>
                  <CTableDataCell>{item.recipientName}</CTableDataCell>
                  <CTableDataCell>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : ''}</CTableDataCell>
                  <CTableDataCell>{item.voucherType}</CTableDataCell>
                  <CTableDataCell>{item.voucherType === 'debit' ? item.amount : 0}</CTableDataCell>
                  <CTableDataCell>{item.voucherType === 'credit' ? item.amount : 0}</CTableDataCell>
                  <CTableDataCell>{item.paymentMode}</CTableDataCell>
                  <CTableDataCell>{item.bankLocation}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={item.status === 'approved' ? 'success' : 'danger'} shape="rounded-pill">
                      {item.status}
                    </CBadge>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </div>
    );
  };

  const renderRejectedTable = () => {
    return (
      <div className="responsive-table-wrapper">
        <CTable striped bordered hover className='responsive-table'>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr.no</CTableHeaderCell>
              <CTableHeaderCell scope="col">Voucher ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Recipient Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Date</CTableHeaderCell>
              <CTableHeaderCell scope="col">Voucher Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Debit</CTableHeaderCell>
              <CTableHeaderCell scope="col">Credit</CTableHeaderCell>
              <CTableHeaderCell scope="col">Payment Mode</CTableHeaderCell>
              <CTableHeaderCell scope="col">Bank Location</CTableHeaderCell>
              <CTableHeaderCell scope="col">Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredLater.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="10" style={{ color: 'red', textAlign: 'center' }}>
                  No data available
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredLater.map((item, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{item.voucherId}</CTableDataCell>
                  <CTableDataCell>{item.recipientName}</CTableDataCell>
                  <CTableDataCell>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : ''}</CTableDataCell>
                  <CTableDataCell>{item.voucherType}</CTableDataCell>
                  <CTableDataCell>{item.voucherType === 'debit' ? item.amount : 0}</CTableDataCell>
                  <CTableDataCell>{item.voucherType === 'credit' ? item.amount : 0}</CTableDataCell>
                  <CTableDataCell>{item.paymentMode}</CTableDataCell>
                  <CTableDataCell>{item.bankLocation}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={item.status === 'rejected' ? 'danger' : 'success'} shape="rounded-pill">
                      {item.status}
                    </CBadge>
                  </CTableDataCell>
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
      <div className='title'>Contra Voucher Approval</div>
      
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            <CButton 
              size="sm" 
              className="action-btn me-1"
            >
              <CIcon icon={cilSearch} className='icon' /> Search
            </CButton>
            {searchTerm && (
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
                Pending Approval
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
                Complete Report
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 2}
                onClick={() => handleTabChange(2)}
                style={{ 
                  cursor: 'pointer',
                  borderTop: activeTab === 2 ? '4px solid #2759a2' : '3px solid transparent',
                  borderBottom: 'none',
                  color: 'black'
                }}
              >
                Reject Report
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
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (activeTab === 0) handlePendingFilter(e.target.value, getDefaultSearchFields('vouchers'));
                  else if (activeTab === 1) handleApprovedFilter(e.target.value, getDefaultSearchFields('vouchers'));
                  else handleLaterFilter(e.target.value, getDefaultSearchFields('vouchers'));
                }}
              />
            </div>
          </div>

          <CTabContent>
            <CTabPane visible={activeTab === 0}>
              {renderPendingTable()}
            </CTabPane>
            <CTabPane visible={activeTab === 1}>
              {renderCompletedTable()}
            </CTabPane>
            <CTabPane visible={activeTab === 2}>
              {renderRejectedTable()}
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>


      <CModal visible={showApprovalModal} onClose={() => setShowApprovalModal(false)}>
        <CModalHeader onClose={() => setShowApprovalModal(false)}>
          <CModalTitle>Approve Voucher</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p><strong>Voucher ID:</strong> {selectedVoucher?.voucherId}</p>
          <p><strong>Amount:</strong> {selectedVoucher?.amount}</p>
          <p><strong>Recipient:</strong> {selectedVoucher?.recipientName}</p>

          <div className="mb-3">
            <CFormLabel htmlFor="billUpload">Upload Bill</CFormLabel>
            <CFormInput 
              type="file" 
              id="billUpload" 
              onChange={handleFileChange} 
              accept=".pdf,.jpg,.jpeg,.png" 
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowApprovalModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={() => handleReject(selectedVoucher?._id)}>
            <CIcon icon={cilX} className="me-1" />
            Reject
          </CButton>
          <CButton color="primary" onClick={() => handleStatusUpdate('approved')}>
            <CIcon icon={cilCheckCircle} className="me-1" />
            Approve
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}

export default ContraApproval;