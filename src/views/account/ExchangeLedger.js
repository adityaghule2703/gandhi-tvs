import '../../css/table.css';
import {
  React,
  useState,
  useEffect,
  Menu,
  MenuItem,
  SearchOutlinedIcon,
  useTableFilter,
  usePagination,
  axiosInstance
} from '../../utils/tableImports';
import tvsLogo from '../../assets/images/logo.png';
import '../../css/invoice.css';
import config from '../../config';
import ExchangeLedgerModel from './ExchangeLedgerModel';
import {
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
  CFormSelect
} from '@coreui/react';
import Swal from 'sweetalert2';
import FilterListIcon from '@mui/icons-material/FilterList';
import { hasPermission } from '../../utils/permissionUtils';

const ExchangeLedger = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedledger, setSelectedledger] = useState(null);
  const [groupedData, setGroupedData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [pendingCredits, setPendingCredits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedBrokers, setExpandedBrokers] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedBranchName, setSelectedBranchName] = useState('');

  const hasAddPermission = hasPermission('BROKER_LEDGER', 'CREATE');
  const hasViewPermission = hasPermission('BROKER_LEDGER', 'READ');
  const showActionColumn = hasAddPermission || hasViewPermission;

  useEffect(() => {
    fetchData();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const grouped = groupDataByBroker(data, isFiltered);
      setGroupedData(grouped);
      setFilteredData(grouped);
    }
  }, [data, isFiltered]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchPendingCredits();
    }
  }, [activeTab]);

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/branches');
      setBranches(response.data.data);
    } catch (error) {
      console.log('Error fetching branches:', error);
    }
  };

  const fetchData = async (branchId = null) => {
    try {
      let url = '/broker-ledger/summary/detailed';
      if (branchId) {
        url = `/broker-ledger/summary/branch/${branchId}`;
      }

      const response = await axiosInstance.get(url);

      if (branchId) {
        const branchName = branches.find((b) => b._id === branchId)?.name || 'Selected Branch';
        setSelectedBranchName(branchName);

        const branchData = response.data.data.brokers.map((broker) => ({
          broker: broker.broker,
          branch: {
            _id: response.data.data.branch,
            name: branchName
          },
          bookings: {
            total: broker.totalBookings,
            details: []
          },
          financials: {
            totalExchangeAmount: broker.totalExchangeAmount,
            ledger: {
              currentBalance: broker.ledger.currentBalance,
              onAccount: broker.ledger.onAccount,
              totalCredit: broker.ledger.totalCredit || 0,
              totalDebit: broker.ledger.totalDebit || 0,
              outstandingAmount: broker.ledger.outstandingAmount || 0,
              transactions: broker.ledger.transactions || 0
            },
            summary: {
              totalReceived: broker.summary?.totalReceived || 0,
              totalPayable: broker.summary?.totalPayable || 0,
              netBalance: broker.ledger.currentBalance
            }
          },
          recentTransactions: [],
          association: {
            isActive: true
          }
        }));

        setData(branchData);
        setIsFiltered(true);
      } else {
        setData(response.data.data.brokers);
        setIsFiltered(false);
        setSelectedBranchName('');
      }
    } catch (error) {
      console.log('Error fetching data', error);
      setError('Failed to fetch data');
    }
  };

  const handleBranchFilter = async () => {
    if (selectedBranch) {
      await fetchData(selectedBranch);
    } else {
      await fetchData();
    }
    setShowFilterModal(false);
  };

  const clearFilter = async () => {
    setSelectedBranch('');
    await fetchData();
    setShowFilterModal(false);
  };

  const groupDataByBroker = (brokersData, isFilteredMode = false) => {
    const brokerMap = {};

    brokersData.forEach((item) => {
      const brokerId = item.broker._id;

      if (!brokerMap[brokerId]) {
        brokerMap[brokerId] = {
          broker: item.broker,
          branches: [],
          totalBookings: 0,
          totalExchangeAmount: 0,
          totalCredit: 0,
          totalDebit: 0,
          onAccount: 0,
          currentBalance: 0,
          outstandingAmount: 0
        };
      }

      if (isFilteredMode) {
        brokerMap[brokerId].branches = [
          {
            name: item.branch.name,
            branchId: item.branch._id,
            bookings: item.bookings.total,
            exchangeAmount: item.financials.totalExchangeAmount,
            credit: item.financials.ledger.totalCredit,
            debit: item.financials.ledger.totalDebit,
            onAccount: item.financials.ledger.onAccount,
            currentBalance: item.financials.ledger.currentBalance,
            outstandingAmount: item.financials.ledger.outstandingAmount
          }
        ];

        brokerMap[brokerId].totalBookings = item.bookings.total;
        brokerMap[brokerId].totalExchangeAmount = item.financials.totalExchangeAmount;
        brokerMap[brokerId].totalCredit = item.financials.ledger.totalCredit;
        brokerMap[brokerId].totalDebit = item.financials.ledger.totalDebit;
        brokerMap[brokerId].onAccount = item.financials.ledger.onAccount;
        brokerMap[brokerId].currentBalance = item.financials.ledger.currentBalance;
        brokerMap[brokerId].outstandingAmount = item.financials.ledger.outstandingAmount;
      } else {
        brokerMap[brokerId].branches.push({
          name: item.branch.name,
          branchId: item.branch._id,
          bookings: item.bookings.total,
          exchangeAmount: item.financials.totalExchangeAmount,
          credit: item.financials.ledger.totalCredit,
          debit: item.financials.ledger.totalDebit,
          onAccount: item.financials.ledger.onAccount,
          currentBalance: item.financials.ledger.currentBalance,
          outstandingAmount: item.financials.ledger.outstandingAmount
        });

        brokerMap[brokerId].totalBookings += item.bookings.total;
        brokerMap[brokerId].totalExchangeAmount += item.financials.totalExchangeAmount;
        brokerMap[brokerId].totalCredit += item.financials.ledger.totalCredit;
        brokerMap[brokerId].totalDebit += item.financials.ledger.totalDebit;
        brokerMap[brokerId].onAccount += item.financials.ledger.onAccount;
        brokerMap[brokerId].currentBalance += item.financials.ledger.currentBalance;
        brokerMap[brokerId].outstandingAmount += item.financials.ledger.outstandingAmount;
      }
    });

    return Object.values(brokerMap);
  };

  const toggleBrokerExpansion = (brokerId) => {
    if (!isFiltered) {
      setExpandedBrokers((prev) => ({
        ...prev,
        [brokerId]: !prev[brokerId]
      }));
    }
  };

  const fetchPendingCredits = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/broker-ledger/pending-credits');
      setPendingCredits(response.data.data.pendingCreditTransactions);
    } catch (error) {
      console.log('Error fetching pending credits', error);
      setError('Failed to fetch pending credits');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (transaction) => {
    const result = await Swal.fire({
      title: 'Confirm Payment Verification',
      text: `Are you sure you want to approve this payment of ₹${transaction.amount.toLocaleString('en-IN')}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.patch(
          `/broker-ledger/approve-on-account/${transaction.broker._id}/${transaction.branch._id}/${transaction._id}`,
          {
            remark: ''
          }
        );

        Swal.fire({
          title: 'Approved!',
          text: 'Payment has been successfully approved.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        fetchPendingCredits();
      } catch (error) {
        console.log('Error approving payment', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to approve payment. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });

        setError('Failed to approve payment');
      }
    }
  };

  const handleClick = (event, id, brokerData = null, branchId = null) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
    if (brokerData) {
      setSelectedledger({ ...brokerData, branchId });
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  const handleAddClick = (brokerData, branchId = null) => {
    setSelectedledger({ ...brokerData, branchId });
    setShowModal(true);
    handleClose();
  };

  const handleAllocate = async (brokerData) => {
    if (!brokerData || !brokerData.broker?._id || !selectedledger?.branchId) {
      Swal.fire({
        title: 'Error!',
        text: 'Broker or Branch information is missing.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const brokerId = brokerData.broker._id;
    const branchId = selectedledger.branchId;

    try {
      const result = await Swal.fire({
        title: 'Confirm Auto-Allocation',
        text: `Do you want to auto-allocate for broker "${brokerData.broker.name}" in branch "${branchId}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, allocate',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await axiosInstance.post(`/broker-ledger/auto-allocate/${brokerId}/${branchId}`);

        Swal.fire({
          title: 'Success!',
          text: 'Auto-allocation completed successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        fetchData(branchId);
      }
    } catch (error) {
      console.error('Error allocating:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to allocate. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      handleClose();
    }
  };

  const handleViewLedger = async (brokerData, branchId = null) => {
    try {
      let url = `/broker-ledger/statement/${brokerData.broker?._id}`;
      if (branchId) {
        url += `?branchId=${branchId}`;
      }

      const res = await axiosInstance.get(url);
      const ledgerData = res.data.data;
      const ledgerUrl = `${config.baseURL}/brokerData.html?ledgerId=${brokerData._id}`;
      let totalCredit = 0;
      let totalDebit = 0;
      const totalOnAccount = ledgerData.summary?.totalOnAccount ?? ledgerData.onAccountBalance ?? 0;

      ledgerData.transactions?.forEach((entry) => {
        if (entry.type === 'CREDIT') {
          totalCredit += entry.amount;
        } else if (entry.type === 'DEBIT') {
          totalDebit += entry.amount;
        }
      });
      const finalBalance = totalDebit - totalCredit;

      const availableOnAccount2 = totalOnAccount - totalCredit;

      const win = window.open('', '_blank');
      win.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Customer Ledger</title>
              <style>
                @page {
                  size: A4;
                  margin: 15mm 10mm;
                }
                body {
                  font-family: Arial;
                  width: 100%;
                  margin: 0;
                  padding: 0;
                  font-size: 14px;
                  line-height: 1.3;
                  font-family: Courier New;
                }
                .container {
                  width: 190mm;
                  margin: 0 auto;
                  padding: 5mm;
                }
                .header-container {
                  display: flex;
                  justify-content:space-between;
                  margin-bottom: 3mm;
                }
                .header-text{
                  font-size:20px;
                  font-weight:bold;
                }
                .logo {
                  width: 30mm;
                  height: auto;
                  margin-right: 5mm;
                }
                .header {
                  text-align: left;
                }
                .divider {
                  border-top: 2px solid #AAAAAA;
                  margin: 3mm 0;
                }
                .header h2 {
                  margin: 2mm 0;
                  font-size: 12pt;
                  font-weight: bold;
                }
                .header div {
                  font-size: 14px;
                }
                .customer-info {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 2mm;
                  margin-bottom: 5mm;
                  font-size: 14px;
                }
                .customer-info div {
                  display: flex;
                }
                .customer-info strong {
                  min-width: 30mm;
                  display: inline-block;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 5mm;
                  font-size: 14px;
                  page-break-inside: avoid;
                }
                th, td {
                  border: 1px solid #000;
                  padding: 2mm;
                  text-align: left;
                }
                th {
                  background-color: #f0f0f0;
                  font-weight: bold;
                }
                .footer {
                  margin-top: 10mm;
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-end;
                  font-size: 14px;
                }
                .footer-left {
                  text-align: left;
                }
                .footer-right {
                  text-align: right;
                }
                .qr-code {
                  width: 35mm;
                  height: 35mm;
                }
                .text-right {
                  text-align: right;
                }
                .text-left {
                  text-align: left;
                }
                .text-center {
                  text-align: center;
                }
                @media print {
                  body {
                    width: 190mm;
                    height: 277mm;
                  }
                  .no-print {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header-container">
                  <img src="${tvsLogo}" class="logo" alt="TVS Logo">
                  <div class="header-text"> GANDHI TVS</div>
                </div>
                <div class="header">
                  <div>
                    Authorised Main Dealer: TVS Motor Company Ltd.<br>
                    Registered office: 'JOGPREET' Asher Estate, Near Ichhamani Lawns,<br>
                    Upnagar, Nashik Road, Nashik - 422101<br>
                    Phone: 7498903672
                  </div>
                </div>
                <div class="divider"></div>
                <div class="customer-info">
                  <div><strong>Broker Name:</strong> ${ledgerData.broker?.name || ''}</div>
                  <div><strong>Ledger Date:</strong> ${ledgerData.ledgerDate || new Date().toLocaleDateString('en-GB')}</div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th width="15%">Date</th>
                      <th width="35%">Description</th>
                      <th width="15%">Receipt/VC No</th>
                      <th width="10%" class="text-right">Credit (₹)</th>
                      <th width="10%" class="text-right">Debit (₹)</th>
                      <th width="15%" class="text-right">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ledgerData.transactions
                      ?.map(
                        (entry) => `
                      <tr>
                        <td>${new Date(entry.date).toLocaleDateString()}</td>
                        <td>
                          Booking No: ${entry.booking?.bookingNumber || '-'}<br>
                           Customer: ${entry.booking?.customerName || '-'}<br>
                           Chassis Number:${entry.booking?.chassisNumber || '-'}
                           ${entry.mode}
                        </td>
                        <td>${entry.referenceNumber || ''}</td>
                       <td class="text-right">${entry.type === 'CREDIT' ? entry.amount.toLocaleString('en-IN') : '-'}</td>
                       <td class="text-right">${entry.type === 'DEBIT' ? entry.amount.toLocaleString('en-IN') : '-'}</td>
                       <td class="text-right">

                       </td>
                      </tr>
                    `
                      )
                      .join('')}
                      <tr>
                      <td colspan="3" class="text-left"><strong>Total OnAccount</strong></td>
                      <td class="text-right"></td>
                      <td class="text-right"></td>
                      <td class="text-right"><strong>${availableOnAccount2.toLocaleString('en-IN')}</strong></td>
                    </tr>
                    <tr>
                      <td colspan="3" class="text-left"><strong>Total</strong></td>
                      <td class="text-right"><strong>${totalCredit.toLocaleString('en-IN')}</strong></td>
                      <td class="text-right"><strong>${totalDebit.toLocaleString('en-IN')}</strong></td>
                      <td class="text-right"><strong>${finalBalance.toLocaleString('en-IN')}</strong></td>
                    </tr>

                  </tbody>
                </table>

                <div class="footer">
                  <div class="footer-left">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ledgerUrl)}"
                         class="qr-code"
                         alt="QR Code" />
                  </div>
                  <div class="footer-right">
                    <p>For, Gandhi TVS</p>
                    <p>Authorised Signatory</p>
                  </div>
                </div>
              </div>

              <script>
                window.onload = function() {
                  setTimeout(() => {
                    window.print();
                  }, 300);
                };
              </script>
            </body>
          </html>
        `);
    } catch (err) {
      console.error('Error fetching ledger:', err);
      setError('Failed to load ledger. Please try again.');
    }
    handleClose();
  };

  const renderPaymentVerificationTab = () => {
    if (loading) {
      return (
        <div className="p-3">
          <div className="loading-message">Loading pending credits...</div>
        </div>
      );
    }

    return (
      <div className="p-3">
        <h5>Payment Verification</h5>
        <div className="table-responsive">
          <div className="table-wrapper">
            <table className="responsive-table" style={{ overflow: 'auto' }}>
              <thead className="table-header-fixed">
                <tr>
                  <th>Sr.no</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Broker</th>
                  <th>Branch</th>
                  <th>Booking Number</th>
                  <th>Customer Name</th>
                  <th>Remark</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingCredits.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
                      No pending credits available for verification
                    </td>
                  </tr>
                ) : (
                  pendingCredits.map((transaction, index) => (
                    <tr key={transaction._id}>
                      <td>{index + 1}</td>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.amount.toLocaleString('en-IN')}</td>
                      <td>{transaction.modeOfPayment}</td>
                      <td>{transaction.broker?.name || 'N/A'}</td>
                      <td>{transaction.branch?.name || 'N/A'}</td>
                      <td>{transaction.booking?.bookingNumber || 'N/A'}</td>
                      <td>{transaction.booking?.customerName || 'N/A'}</td>
                      <td>{transaction.remark || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${transaction.approvalStatus.toLowerCase()}`}>{transaction.approvalStatus}</span>
                      </td>
                      <td>
                        <button
                          className="action-button approve-btn"
                          onClick={() => handleApprovePayment(transaction)}
                          style={{ marginRight: '5px', backgroundColor: '#4CAF50' }}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSummaryTab = () => {
    return (
      <div className="p-3">
        <h5>Exchange Ledger Summary {isFiltered && `- ${selectedBranchName}`}</h5>
        <div className="table-header">
          <div className="search-icon-data">
            <input type="text" placeholder="Search by broker name..." onChange={(e) => handleFilter(e.target.value, ['broker.name'])} />
            <SearchOutlinedIcon />
          </div>
          <button className="filter-btn" onClick={() => setShowFilterModal(true)}>
            <FilterListIcon /> Filter
          </button>
          {isFiltered && (
            <button className="clear-filter-btn" onClick={clearFilter}>
              Clear Filter
            </button>
          )}
        </div>
        <div className="table-responsive">
          <div className="table-wrapper">
            <table className="responsive-table" style={{ overflow: 'auto' }}>
              <thead className="table-header-fixed">
                <tr>
                  {!isFiltered && <th></th>}
                  <th>Sr.no</th>
                  <th>Exchange Broker Name</th>
                  <th>Mobile</th>
                  {!isFiltered && <th>Branch</th>}
                  <th>Total Bookings</th>
                  <th>Total Exchange Amount</th>
                  <th>Total Received</th>
                  <th>Total Payable</th>
                  <th>Opening Balance</th>
                  <th>Current Balance</th>
                  <th>Outstanding Amount</th>
                  {showActionColumn && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isFiltered ? 12 : 13} style={{ color: 'red' }}>
                      No ledger details available
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((brokerData, index) => (
                    <>
                      <tr key={brokerData.broker._id} className="broker-summary-row">
                        {!isFiltered && (
                          <td>
                            <button
                              onClick={() => toggleBrokerExpansion(brokerData.broker._id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              {expandedBrokers[brokerData.broker._id] ? '▼' : '►'}
                            </button>
                          </td>
                        )}
                        <td>{index + 1}</td>
                        <td>{brokerData.broker.name || 'N/A'}</td>
                        <td>{brokerData.broker.mobile || 'N/A'}</td>
                        {!isFiltered && <td>All Branches</td>}
                        <td>{brokerData.totalBookings}</td>
                        <td>{brokerData.totalExchangeAmount.toLocaleString('en-IN')}</td>
                        <td>{brokerData.totalCredit.toLocaleString('en-IN')}</td>
                        <td>{brokerData.totalDebit.toLocaleString('en-IN')}</td>
                        <td>{brokerData.onAccount.toLocaleString('en-IN')}</td>
                        <td>{brokerData.currentBalance.toLocaleString('en-IN')}</td>
                        <td>{brokerData.outstandingAmount.toLocaleString('en-IN')}</td>

                        {showActionColumn && (
                          <td>
                            <button className="action-button" onClick={(event) => handleClick(event, brokerData.broker._id, brokerData)}>
                              Actions
                            </button>
                            <Menu
                              id={`action-menu-${brokerData.broker._id}`}
                              anchorEl={anchorEl}
                              open={menuId === brokerData.broker._id}
                              onClose={handleClose}
                            >
                              {hasPermission('BROKER_LEDGER', 'CREATE') && (
                                <MenuItem onClick={() => handleAddClick(brokerData, isFiltered ? brokerData.branches[0]?.branchId : null)}>
                                  Add Payment
                                </MenuItem>
                              )}
                              {hasPermission('BROKER_LEDGER', 'CREATE') && (
                                <MenuItem
                                  onClick={() => handleViewLedger(brokerData, isFiltered ? brokerData.branches[0]?.branchId : null)}
                                >
                                  View Ledger
                                </MenuItem>
                              )}
                            </Menu>
                          </td>
                        )}
                      </tr>
                      {!isFiltered &&
                        expandedBrokers[brokerData.broker._id] &&
                        brokerData.branches.map((branch, branchIndex) => (
                          <tr key={`${brokerData.broker._id}-${branch.branchId}`} className="branch-detail-row">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>{branch.name}</td>
                            <td>{branch.bookings}</td>
                            <td>{branch.exchangeAmount.toLocaleString('en-IN')}</td>
                            <td>{branch.credit.toLocaleString('en-IN')}</td>
                            <td>{branch.debit.toLocaleString('en-IN')}</td>
                            <td>{branch.onAccount.toLocaleString('en-IN')}</td>
                            <td>{branch.currentBalance.toLocaleString('en-IN')}</td>
                            <td>{branch.outstandingAmount.toLocaleString('en-IN')}</td>
                            {showActionColumn && (
                              <td>
                                <button
                                  className="action-button"
                                  onClick={(event) =>
                                    handleClick(event, `${brokerData.broker._id}-${branch.branchId}`, brokerData, branch.branchId)
                                  }
                                >
                                  Actions
                                </button>
                                <Menu
                                  id={`action-menu-${brokerData.broker._id}-${branch.branchId}`}
                                  anchorEl={anchorEl}
                                  open={menuId === `${brokerData.broker._id}-${branch.branchId}`}
                                  onClose={handleClose}
                                >
                                  {hasAddPermission && (
                                    <>
                                      <MenuItem onClick={() => handleAddClick(brokerData, branch.branchId)}>Add Payment</MenuItem>
                                      <MenuItem onClick={() => handleAllocate(brokerData)}>Allocate</MenuItem>
                                    </>
                                  )}

                                  {hasViewPermission && (
                                    <MenuItem onClick={() => handleViewLedger(brokerData, branch.branchId)}>View Ledger</MenuItem>
                                  )}
                                </Menu>
                              </td>
                            )}
                          </tr>
                        ))}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <PaginationOptions />
      </div>
    );
  };

  return (
    <div>
      <h4>Exchange Ledger</h4>

      <CNav variant="tabs">
        <CNavItem>
          <CNavLink active={activeTab === 0} onClick={() => setActiveTab(0)}>
            Summary
          </CNavLink>
        </CNavItem>
        {hasPermission('BROKER_LEDGER', 'VERIFY') && (
          <CNavItem>
            <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
              Payment Verification
            </CNavLink>
          </CNavItem>
        )}
      </CNav>

      <CTabContent>
        <CTabPane visible={activeTab === 0}>{renderSummaryTab()}</CTabPane>
        <CTabPane visible={activeTab === 1}>{renderPaymentVerificationTab()}</CTabPane>
      </CTabContent>

      <CModal visible={showFilterModal} onClose={() => setShowFilterModal(false)}>
        <CModalHeader>
          <CModalTitle>Filter by Branch</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label">Select Branch</label>
            <CFormSelect value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </CFormSelect>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowFilterModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleBranchFilter}>
            Apply Filter
          </CButton>
        </CModalFooter>
      </CModal>

      <div>
        {error && <div className="error-message">{error}</div>}

        <ExchangeLedgerModel show={showModal} onClose={() => setShowModal(false)} brokerData={selectedledger} refreshData={fetchData} />
      </div>
    </div>
  );
};

export default ExchangeLedger;
