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
  CFormInput
} from '@coreui/react';
import { axiosInstance, getDefaultSearchFields, Menu, MenuItem, SearchOutlinedIcon, useTableFilter } from '../../utils/tableImports';
import '../../css/invoice.css';
import '../../css/table.css';
import Swal from 'sweetalert2';

function CashApproval() {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [billFile, setBillFile] = useState(null);

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

  const fetchAllData = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        axiosInstance.get('/cash-vouchers/status/pending'),
        axiosInstance.get('/cash-vouchers/status/approved'),
        axiosInstance.get('/cash-vouchers/status/rejected')
      ]);

      setPendingData(pendingRes.data.data);
      setFilteredPendings(pendingRes.data.data);
      setApprovedData(approvedRes.data.data);
      setFilteredApproved(approvedRes.data.data);
      setLaterData(rejectedRes.data.data);
      setFilteredLater(rejectedRes.data.data);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchAllData();
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

      console.log('Submitting to:', `/cash-vouchers/${selectedVoucher._id}`);
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axiosInstance.put(`/cash-vouchers/${selectedVoucher._id}`, formData, {
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
        await axiosInstance.put(`/cash-vouchers/${voucherId}`, {
          status: 'rejected'
        });

        // Immediately update UI
        const rejectedVoucher = pendingData.find((item) => item._id === voucherId);
        setPendingData((prev) => prev.filter((item) => item._id !== voucherId));
        setLaterData((prev) => [...prev, { ...rejectedVoucher, status: 'rejected' }]);

        Swal.fire('Rejected!', 'Voucher has been rejected.', 'success');
      }
    } catch (error) {
      console.log('Error rejecting voucher', error);
      Swal.fire('Error!', 'Failed to reject voucher.', 'error');
    }
  };

  return (
    <div className="container-table">
      <CNav variant="tabs">
        <CNavItem>
          <CNavLink active={activeTab === 0} onClick={() => setActiveTab(0)}>
            Pending Approval
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
            Complete Report
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
            Reject Report
          </CNavLink>
        </CNavItem>
      </CNav>

      {/* Approval Modal */}
      <CModal visible={showApprovalModal} onClose={() => setShowApprovalModal(false)}>
        <CModalHeader onClose={() => setShowApprovalModal(false)}>
          <CModalTitle>Approve Voucher</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Voucher ID: {selectedVoucher?.voucherId}</p>
          <p>Amount: {selectedVoucher?.amount}</p>

          <div className="mb-3">
            <label htmlFor="billUpload" className="form-label">
              Upload Bill
            </label>
            <CFormInput type="file" id="billUpload" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowApprovalModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={() => handleReject(selectedVoucher?._id)}>
            Reject
          </CButton>
          <CButton color="primary" onClick={() => handleStatusUpdate('approved')}>
            Approve
          </CButton>
        </CModalFooter>
      </CModal>

      <CTabContent>
        <CTabPane visible={activeTab === 0} className="p-3">
          <h5>PENDING APPROVAL REPORT</h5>
          <div className="table-header">
            <div className="search-icon-data">
              <input
                type="text"
                placeholder="Search.."
                onChange={(e) => handlePendingFilter(e.target.value, getDefaultSearchFields('receipts'))}
              />
              <SearchOutlinedIcon />
            </div>
          </div>
          <div className="table-responsive">
            <div className="table-wrapper">
              <table className="responsive-table" style={{ overflow: 'auto' }}>
                <thead className="table-header-fixed">
                  <tr>
                    <th>Sr.no</th>
                    <th>Voucher ID</th>
                    <th>Recipient Name</th>
                    <th>Date</th>
                    <th>Voucher Type</th>
                    <th>Expense Type</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Payment Mode</th>
                    <th>Cash Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPendings.length === 0 ? (
                    <tr>
                      <td colSpan="11" style={{ color: 'red' }}>
                        No pending contra approval available
                      </td>
                    </tr>
                  ) : (
                    filteredPendings.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.voucherId}</td>
                        <td>{item.recipientName}</td>
                        <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : ''}</td>
                        <td>{item.voucherType}</td>
                        <td>{item.expenseType}</td>
                        <td>{item.voucherType === 'debit' ? item.amount : 0}</td>
                        <td>{item.voucherType === 'credit' ? item.amount : 0}</td>
                        <td>{item.paymentMode}</td>
                        <td>{item.cashLocation}</td>
                        <td>
                          <CBadge color={item.status === 'pending' ? 'warning' : 'success'} shape="rounded-pill">
                            {item.status}
                          </CBadge>
                        </td>
                        <td>
                          <button className="action-button" onClick={(event) => handleClick(event, item._id)}>
                            Action
                          </button>
                          <Menu id={`action-menu-${item._id}`} anchorEl={anchorEl} open={menuId === item._id} onClose={handleClose}>
                            <MenuItem onClick={() => handleOpenApprovalModal(item)}>Approved</MenuItem>
                            <MenuItem onClick={() => handleReject(item._id)}>Reject</MenuItem>
                          </Menu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CTabPane>

        <CTabPane visible={activeTab === 1} className="p-3">
          <h5>COMPLETED REPORT</h5>
          <div className="table-header">
            <div className="search-icon-data">
              <input type="text" placeholder="Search.." onChange={(e) => handleApprovedFilter(e.target.value, ['branchName'])} />
              <SearchOutlinedIcon />
            </div>
          </div>
          <div className="table-responsive">
            <div className="table-wrapper">
              <table className="responsive-table" style={{ overflow: 'auto' }}>
                <thead className="table-header-fixed">
                  <tr>
                    <th>Sr.no</th>
                    <th>Voucher ID</th>
                    <th>Recipient Name</th>
                    <th>Date</th>
                    <th>Voucher Type</th>
                    <th>Expense Type</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Payment Mode</th>
                    <th>Cash Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApproved.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ color: 'red' }}>
                        No data available
                      </td>
                    </tr>
                  ) : (
                    filteredApproved.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.voucherId}</td>
                        <td>{item.recipientName}</td>
                        <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : ''}</td>
                        <td>{item.voucherType}</td>
                        <td>{item.expenseType}</td>
                        <td>{item.voucherType === 'debit' ? item.amount : 0}</td>
                        <td>{item.voucherType === 'credit' ? item.amount : 0}</td>
                        <td>{item.paymentMode}</td>
                        <td>{item.cashLocation}</td>
                        <td>
                          <CBadge color={item.status === 'approved' ? 'success' : 'danger'} shape="rounded-pill">
                            {item.status}
                          </CBadge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CTabPane>

        <CTabPane visible={activeTab === 2} className="p-3">
          <h5> REJECTED REPORT</h5>
          <div className="table-header">
            <div className="search-icon-data">
              <input type="text" placeholder="Search.." onChange={(e) => handleApprovedFilter(e.target.value, ['branchName'])} />
              <SearchOutlinedIcon />
            </div>
          </div>
          <div className="table-responsive">
            <div className="table-wrapper">
              <table className="responsive-table" style={{ overflow: 'auto' }}>
                <thead className="table-header-fixed">
                  <tr>
                    <th>Sr.no</th>
                    <th>Voucher ID</th>
                    <th>Recipient Name</th>
                    <th>Date</th>
                    <th>Voucher Type</th>
                    <th>Expense Type</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Payment Mode</th>
                    <th>Cash Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLater.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ color: 'red' }}>
                        No data available
                      </td>
                    </tr>
                  ) : (
                    filteredLater.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.voucherId}</td>
                        <td>{item.recipientName}</td>
                        <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : ''}</td>
                        <td>{item.voucherType}</td>
                        <td>{item.expenseType}</td>
                        <td>{item.voucherType === 'debit' ? item.amount : 0}</td>
                        <td>{item.voucherType === 'credit' ? item.amount : 0}</td>
                        <td>{item.paymentMode}</td>
                        <td>{item.cashLocation}</td>
                        <td>
                          <CBadge color={item.status === 'approved' ? 'success' : 'danger'} shape="rounded-pill">
                            {item.status}
                          </CBadge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CTabPane>
      </CTabContent>
    </div>
  );
}

export default CashApproval;
