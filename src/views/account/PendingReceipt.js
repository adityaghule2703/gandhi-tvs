import React, { useState, useEffect } from 'react';
import '../../css/invoice.css';
import { CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react';
import { axiosInstance, getDefaultSearchFields, SearchOutlinedIcon, useTableFilter } from 'utils/tableImports';
import '../../css/table.css';
import UpdateReceipt from './UpdateReceipt';
function PendingReceipt() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selecteditem, setSelecteditem] = useState(null);
  const {
    data: pendingData,
    setData: setPendingData,
    filteredData: filteredPendings,
    setFilteredData: setFilteredPendings,
    handleFilter: handlePendingFilter
  } = useTableFilter([]);
  const {
    data: rejectData,
    setData: setRejectData,
    filteredData: filteredReject,
    setFilteredData: setFilteredReject,
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
      const response = await axiosInstance.get(`/vouchers/status/pending`);
      setPendingData(response.data.data);
      setFilteredPendings(response.data.data);
    } catch (error) {
      console.log('Error fetching pending data', error);
    }
  };

  const fetchCompleteData = async () => {
    try {
      const response = await axiosInstance.get(`/vouchers/status/approved`);
      setApprovedData(response.data.data);
      setFilteredApproved(response.data.data);
    } catch (error) {
      console.log('Error fetching approved data', error);
    }
  };

  const fetchLaterData = async () => {
    try {
      const response = await axiosInstance.get(`/vouchers/status/rejected`);
      setRejectData(response.data.data);
      setFilteredReject(response.data.data);
    } catch (error) {
      console.log('Error fetching approved data', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCompleteData();
    fetchLaterData();
  }, [refreshKey]);

  const handleAddClick = (item) => {
    setSelecteditem(item);
    setShowModal(true);
  };
  return (
    <div className="container-table">
      <CNav variant="tabs">
        <CNavItem>
          <CNavLink active={activeTab === 0} onClick={() => setActiveTab(0)}>
            Pending Receipt
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
            Approved Receipt
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
            Reject Receipt
          </CNavLink>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane visible={activeTab === 0} className="p-3">
          <h5>Pending List</h5>
          <div className="table-header">
            <div className="search-icon-data">
              <input
                type="text"
                placeholder="Search.."
                // onChange={(e) => handleitemsFilter(e.target.value, getDefaultSearchFields('receipts'))}
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
                    <th>Voucher Date</th>
                    <th>Voucher Type</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Payment Mode</th>
                    <th>Bank Location</th>
                    <th>Cash Location</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPendings.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ color: 'red' }}>
                        No item available
                      </td>
                    </tr>
                  ) : (
                    filteredPendings.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.voucherId}</td>
                        <td>{item.recipientName}</td>
                        <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : ' '}</td>
                        <td>{item.voucherType}</td>
                        <td>{item.voucherType === 'debit' ? item.amount : 0}</td>
                        <td>{item.voucherType === 'credit' ? item.amount : 0}</td>
                        <td>{item.paymentMode || ''}</td>
                        <td>{item.bankLocation || ''}</td>
                        <td>{item.cashLocation || ''}</td>
                        <td>
                          <button className="action-button" onClick={() => handleAddClick(item)}>
                            Update
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  <UpdateReceipt show={showModal} onClose={() => setShowModal(false)} itemData={selecteditem} />
                </tbody>
              </table>
            </div>
          </div>
        </CTabPane>

        <CTabPane visible={activeTab === 1} className="p-3">
          <h5>Approved Recipt</h5>
          <div className="table-header">
            <div className="search-icon-data">
              <input type="text" placeholder="Search.." onChange={(e) => handleLedgerFilter(e.target.value, ['branchName'])} />
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
                    <th>Voucher Date</th>
                    <th>Voucher Type</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Payment Mode</th>
                    <th>Bank Location</th>
                    <th>Cash Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApproved.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ color: 'red' }}>
                        No item available
                      </td>
                    </tr>
                  ) : (
                    filteredApproved.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.voucherId}</td>
                        <td>{item.recipientName}</td>
                        <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : ' '}</td>
                        <td>{item.voucherType}</td>
                        <td>{item.voucherType === 'debit' ? item.amount : 0}</td>
                        <td>{item.voucherType === 'credit' ? item.amount : 0}</td>
                        <td>{item.paymentMode || ''}</td>
                        <td>{item.bankLocation || ''}</td>
                        <td>{item.cashLocation || ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CTabPane>

        <CTabPane visible={activeTab === 2} className="p-3">
          <h5>Reject Recipt</h5>
          <div className="table-header">
            <div className="search-icon-data">
              <input type="text" placeholder="Search.." onChange={(e) => handleLedgerFilter(e.target.value, ['branchName'])} />
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
                    <th>Voucher Date</th>
                    <th>Voucher Type</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Payment Mode</th>
                    <th>Bank Location</th>
                    <th>Cash Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReject.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ color: 'red' }}>
                        No item available
                      </td>
                    </tr>
                  ) : (
                    filteredReject.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.voucherId}</td>
                        <td>{item.recipientName}</td>
                        <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : ' '}</td>
                        <td>{item.voucherType}</td>
                        <td>{item.voucherType === 'debit' ? item.amount : 0}</td>
                        <td>{item.voucherType === 'credit' ? item.amount : 0}</td>
                        <td>{item.paymentMode || ''}</td>
                        <td>{item.bankLocation || ''}</td>
                        <td>{item.cashLocation || ''}</td>
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

export default PendingReceipt;
