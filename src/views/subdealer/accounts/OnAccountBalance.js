import config from 'src/config';
import '../../../css/table.css';
import '../../../css/form.css';
import {
  React,
  useEffect,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  axiosInstance,
  showError,
  Link
} from 'src/utils/tableImports';
import tvsLogo from '../../../assets/images/logo.png';
import { hasPermission } from 'src/utils/permissionUtils';
import { cilPrint } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from '@coreui/react';

const OnAccountBalance = () => {
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/subdealers/financials/all`);
      setData(response.data.data.subdealers);
      setFilteredData(response.data.data.subdealers);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  const handleViewLedger = async (subdealer) => {
    try {
      const res = await axiosInstance.get(`/subdealersonaccount/${subdealer._id}/on-account/receipts`);
      const ledgerData = res.data.docs;
      const subdealerBookings = res.data.subdealerBookings || [];
      const accessoryBillings = res.data.accessoryBillings || [];
      const ledgerUrl = `${config.baseURL}/ledger.html?ledgerId=${subdealer._id}`;
      const totalOnAccountBalance = res.data.totalOnAccountBalance;

      let totalCredit = 0;
      let totalDebit = 0;
      let runningBalance = 0;

      const win = window.open('', '_blank');
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Subdealer Ledger</title>
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
                <div><strong>Subdealer Name:</strong> ${ledgerData[0]?.subdealer?.name || subdealer.name || ''}</div>
                <div><strong>Ledger Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th width="15%">Date</th>
                    <th width="35%">Description</th>
                    <th width="15%">Reference No</th>
                    <th width="10%" class="text-right">Credit (₹)</th>
                    <th width="10%" class="text-right">Debit (₹)</th>
                    <th width="15%" class="text-right">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${ledgerData
                    .map((receipt) => {
                      let rows = '';
                      const receiptCredit = receipt.amount;
                      runningBalance += receiptCredit;
                      totalCredit += receiptCredit;

                      if (receipt.allocations && receipt.allocations.length > 0) {
                        receipt.allocations.forEach((allocation) => {
                          const allocationDebit = allocation.amount;
                          runningBalance -= allocationDebit;
                          totalDebit += allocationDebit;

                          rows += `
                            <tr>
                              <td>${new Date(allocation.allocatedAt).toLocaleDateString('en-GB')}</td>
                              <td>
                                Allocation to Booking<br>
                                Customer: ${allocation.booking?.customerDetails?.name || 'N/A'}<br>
                                Booking No: ${allocation.booking?.bookingNumber || 'N/A'}
                              </td>
                              <td>${allocation.ledger?.transactionReference || receipt.refNumber || ''}</td>
                              <td class="text-right">${allocationDebit.toLocaleString('en-IN')}</td>
                              <td class="text-right">0</td>
                              <td class="text-right">${runningBalance.toLocaleString('en-IN')}</td>
                            </tr>
                          `;
                        });
                      }

                      return rows;
                    })
                    .join('')}

                      ${subdealerBookings
                        .map((booking) => {
                          const bookingDebit = booking.discountedAmount;
                          runningBalance -= bookingDebit;
                          totalDebit += bookingDebit;

                          return `
                            <tr>
                              <td>${new Date(booking.bookingDate).toLocaleDateString('en-GB')}</td>
                              <td>
                                Booking Created<br>
                                Customer: ${booking.customerDetails?.salutation || ''} ${booking.customerDetails?.name || 'N/A'}<br>
                                ${booking.remark || ''}
                              </td>
                              <td>${booking.bookingNumber || ''}</td>
                              <td class="text-right">0</td>
                              <td class="text-right">${bookingDebit.toLocaleString('en-IN')}</td>
                              <td class="text-right">${runningBalance.toLocaleString('en-IN')}</td>
                            </tr>
                          `;
                        })
                        .join('')}

                           
                        
                        ${accessoryBillings
                          .map((booking) => {
                            const bookingDebit = booking.amount;
                            runningBalance -= bookingDebit;
                            totalDebit += bookingDebit;

                            return `
                          <tr>
                            <td>${new Date(booking.createdAt).toLocaleDateString('en-GB')}</td>
                            <td>
                             Accessory Billing<br>
                              ${booking.cashLocation.name || ''} ${booking.paymentMode || 'N/A'}<br>
                            </td>
                            <td>${booking.bookingNumber || ''}</td>
                            <td class="text-right">0</td>
                            <td class="text-right">${bookingDebit.toLocaleString('en-IN')}</td>
                            <td class="text-right">${runningBalance.toLocaleString('en-IN')}</td>
                          </tr>
                        `;
                          })
                          .join('')}

                   <tr>
                    <td colspan="3" class="text-left"><strong>OnAccount Balance</strong></td>
                    <td></td>
                      <td></td>
                    <td class="text-right"><strong>${totalOnAccountBalance.toLocaleString('en-IN') || '0'}</strong></td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-left"><strong>Total</strong></td>
                    <td class="text-right"><strong>${totalCredit.toLocaleString('en-IN')}</strong></td>
                    <td class="text-right"><strong>${totalDebit.toLocaleString('en-IN')}</strong></td>
                    <td class="text-right"><strong>${runningBalance.toLocaleString('en-IN')}</strong></td>
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
      showError('Failed to load ledger. Please try again.');
    }
  };

  const handleSearch = (searchValue) => {
    handleFilter(searchValue, getDefaultSearchFields('subdealer'));
  };

  return (
    <div>
      <div className='title'>OnAccount Balance</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasPermission('SUBDEALER_ON_ACCOUNT', 'CREATE') && (
              <Link to="/subdealer-account/add-amount">
                <CButton color="primary" className="new-user-btn">
                  + New Balance
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
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search subdealers..."
              />
            </div>
          </div>
          
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Total Bookings</CTableHeaderCell>
                  <CTableHeaderCell>Total Amount</CTableHeaderCell>
                  <CTableHeaderCell>Total Received</CTableHeaderCell>
                  <CTableHeaderCell>Total Balance</CTableHeaderCell>
                  <CTableHeaderCell>OnAccount Balance</CTableHeaderCell>
                  {hasPermission('SUBDEALER_ON_ACCOUNT', 'CREATE') && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredData.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={hasPermission('SUBDEALER_ON_ACCOUNT', 'CREATE') ? "8" : "7"} className="text-center">
                      No subdealers available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  filteredData.map((subdealer, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{subdealer.name}</CTableDataCell>
                      <CTableDataCell>{subdealer.financials.bookingSummary.totalBookings}</CTableDataCell>
                      <CTableDataCell>{subdealer.financials.bookingSummary.totalBookingAmount}</CTableDataCell>
                      <CTableDataCell>{subdealer.financials.bookingSummary.totalReceivedAmount}</CTableDataCell>
                      <CTableDataCell>{subdealer.financials.bookingSummary.totalBalanceAmount}</CTableDataCell>
                      <CTableDataCell>{subdealer.financials.onAccountSummary.totalBalance}</CTableDataCell>
                      {hasPermission('SUBDEALER_ON_ACCOUNT', 'CREATE') && (
                        <CTableDataCell>
                          <CButton 
                            size="sm" 
                            className="action-btn"
                            onClick={() => handleViewLedger(subdealer)}
                          >
                            <CIcon icon={cilPrint} className='icon'/> View Ledger
                          </CButton>
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

export default OnAccountBalance;