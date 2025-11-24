import '../../css/table.css';
import {
  React,
  useState,
  useEffect,
  useTableFilter,
  usePagination,
  axiosInstance,
  getDefaultSearchFields
} from '../../utils/tableImports';
import tvsLogo from '../../assets/images/logo.png';
import config from '../../config';
import { hasPermission } from '../../utils/permissionUtils';
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
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';

const AllCustomers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/customers`);
      setData(response.data.data.customers);
      setFilteredData(response.data.data.customers);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLedger = async (customer) => {
    try {
      const res = await axiosInstance.get(`/ledger/customer/${customer._id}`);
      const ledgerData = res.data.data;
      const ledgerUrl = `${config.baseURL}/ledger.html?customerId=${customer._id}`;

      const bookingSummaryRows = ledgerData.bookingWiseSummary
        .map((booking) => {
          const bookingRow = `
            <tr>
              <td>${new Date(booking.lastTransactionDate).toLocaleDateString('en-GB')}</td>
              <td>Booking: ${booking.vehicleModel || 'Unknown Model'}</td>
              <td>${booking.bookingNumber}</td>
              <td class="text-right">-</td>
              <td class="text-right">${booking.totalDebited.toLocaleString('en-IN')}</td>
              <td class="text-right">${booking.totalDebited.toLocaleString('en-IN')}</td>
            </tr>
          `;

          const paymentRows = booking.ledgerEntries
            .filter((entry) => entry.type === 'CREDIT')
            .map(
              (entry) => `
              <tr>
                <td>${new Date(entry.date).toLocaleDateString('en-GB')}</td>
                <td>${entry.description}</td>
                <td>${booking.bookingNumber}</td>
                <td class="text-right">${entry.credit.toLocaleString('en-IN')}</td>
                <td class="text-right">-</td>
                <td class="text-right">${entry.balance.toLocaleString('en-IN')}</td>
              </tr>
            `
            )
            .join('');

          return bookingRow + paymentRows;
        })
        .join('');

      const accessoryBillingRows = ledgerData.transactions
        .filter((transaction) => transaction.type.includes('ACCESSORY_BILLING'))
        .map((transaction) => {
          const amount = transaction.netAmount || transaction.amount;
          const bookingNumber = transaction.booking?.bookingNumber || '-';

          return `
            <tr>
              <td>${new Date(transaction.receiptDate || transaction.createdAt).toLocaleDateString('en-GB')}</td>
              <td>${transaction.type}: ${transaction.remark || ''}</td>
              <td>${bookingNumber}</td>
              <td class="text-right">-</td>
              <td class="text-right">${amount.toLocaleString('en-IN')}</td>
              <td class="text-right">${''}</td>
            </tr>
          `;
        })
        .join('');

      const exchangeCreditRows = ledgerData.transactions
        .filter((transaction) => transaction.type.includes('EXCHANGE_CREDIT'))
        .map((transaction) => {
          const amount = transaction.netAmount || transaction.amount;
          const bookingNumber = transaction.booking?.bookingNumber || '-';

          return `
        <tr>
          <td>${new Date(transaction.receiptDate || transaction.createdAt).toLocaleDateString('en-GB')}</td>
          <td>${transaction.type}: ${transaction.remark || ''}</td>
          <td>${bookingNumber}</td>
          <td class="text-right">${amount.toLocaleString('en-IN')}</td>
          <td class="text-right">-</td>
          <td class="text-right">${''}</td>
        </tr>
      `;
        })
        .join('');

      const totalReceived = ledgerData.customerDetails?.totalReceived || 0;
      const totalDebited = ledgerData.customerDetails?.totalDebited || 0;
      const totalBalance = ledgerData.customerDetails?.currentBalance || 0;

      const win = window.open('', '_blank');
      win.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Customer Ledger - Booking Summary</title>
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
                .note {
                  font-style: italic;
                  color: #666;
                  margin-bottom: 5mm;
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
                  <div><strong>Customer ID:</strong> ${ledgerData.customerDetails?.custId || ''}</div>
                  <div><strong>Customer Name:</strong> ${ledgerData.customerDetails?.customerName || ''}</div>
                  <div><strong>Ledger Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
                  <div><strong>Aadhar No:</strong> ${ledgerData.customerDetails?.customerAadhaar || ''}</div>
                  <div><strong>Pan No:</strong> ${ledgerData.customerDetails?.customerPan || ''}</div>
                  <div><strong>Current Balance:</strong> ₹${ledgerData.customerDetails?.currentBalance?.toLocaleString('en-IN') || '0'}</div>
                </div>
  
                <table>
                  <thead>
                    <tr>
                      <th width="15%">Date</th>
                      <th width="25%">Description</th>
                      <th width="20%">Booking No</th>
                      <th width="10%" class="text-right">Credit (₹)</th>
                      <th width="10%" class="text-right">Debit (₹)</th>
                      <th width="20%" class="text-right">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bookingSummaryRows}
                    ${accessoryBillingRows}
                    ${exchangeCreditRows}
                    <tr>
                      <td colspan="2" class="text-left"><strong>Total</strong></td>
                      <td class="text-center"><strong>-</strong></td>
                      <td class="text-right"><strong>${totalReceived.toLocaleString('en-IN')}</strong></td>
                      <td class="text-right"><strong>${totalDebited.toLocaleString('en-IN')}</strong></td>
                      <td class="text-right"><strong>${totalBalance.toLocaleString('en-IN')}</strong></td>
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
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('allCustomers'));
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
      <div className='title'>Customer Ledger</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div></div>
        </CCardHeader>
        
        <CCardBody>
          {error && (
            <CAlert color="danger" className="mb-3">
              {error}
            </CAlert>
          )}
          
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
                  <CTableHeaderCell>Customer ID</CTableHeaderCell>
                  <CTableHeaderCell>Customer Name</CTableHeaderCell>
                  <CTableHeaderCell>Address</CTableHeaderCell>
                  <CTableHeaderCell>Mobile1</CTableHeaderCell>
                  <CTableHeaderCell>Mobile2</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Aadhar Number</CTableHeaderCell>
                  <CTableHeaderCell>PAN Number</CTableHeaderCell>
                  {hasPermission('LEDGER', 'READ') && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={hasPermission('LEDGER', 'READ') ? "10" : "9"} className="text-center">
                      No ledger details available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((customer, index) => (
                    <CTableRow key={customer._id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{customer.custId || ''}</CTableDataCell>
                      <CTableDataCell>{customer.name || ''}</CTableDataCell>
                      <CTableDataCell>{customer.address || ''}</CTableDataCell>
                      <CTableDataCell>{customer.mobile1 || ''}</CTableDataCell>
                      <CTableDataCell>{customer.mobile2 || ''}</CTableDataCell>
                      <CTableDataCell>
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-GB') : ''}
                      </CTableDataCell>
                      <CTableDataCell>{customer.aadhaar || ''}</CTableDataCell>
                      <CTableDataCell>{customer.pan || ''}</CTableDataCell>
                      {hasPermission('LEDGER', 'READ') && (
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            className='option-button btn-sm'
                            onClick={() => handleViewLedger(customer)}
                          >
                            View Ledger
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

export default AllCustomers;