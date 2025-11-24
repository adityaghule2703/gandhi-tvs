import '../../css/table.css';
import {
  React,
  useState,
  useEffect,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  axiosInstance
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
// import CIcon from '@coreui/icons-react';
// import { cilEye } from '@coreui/icons';

const ViewLedgers = () => {
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);
  const [error, setError] = useState(null);
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
      setError('Failed to fetch bookings data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLedger = async (booking) => {
    try {
      const res = await axiosInstance.get(`/ledger/report/${booking._id}`);
      const ledgerData = res.data.data;
      const ledgerUrl = `${config.baseURL}/ledger.html?bookingId=${booking._id}`;

      const approvedEntries = ledgerData.entries.filter((entry) => entry.approvalStatus != 'Pending');

      const totals = {
        totalCredit: approvedEntries.reduce((sum, entry) => sum + (entry.credit || 0), 0),
        totalDebit: approvedEntries.reduce((sum, entry) => sum + (entry.debit || 0), 0),
        finalBalance: approvedEntries.reduce((sum, entry) => {
          const credit = entry.credit || 0;
          const debit = entry.debit || 0;
          return sum + (debit - credit);
        }, 0)
      };

      const win = window.open('', '_blank');
      win.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Customer Ledger - Approved Entries Only</title>
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
                  <div><strong>Customer Name:</strong> ${ledgerData.customerDetails?.name || ''}</div>
                  <div><strong>Ledger Date:</strong> ${ledgerData.ledgerDate || new Date().toLocaleDateString('en-GB')}</div>
                  <div><strong>Customer Address:</strong> ${ledgerData.customerDetails?.address || ''}</div>
                  <div><strong>Customer Phone:</strong> ${ledgerData.customerDetails?.phone || ''}</div>
                  <div><strong>Chassis No:</strong> ${ledgerData.vehicleDetails?.chassisNo || ''}</div>
                  <div><strong>Engine No:</strong> ${ledgerData.vehicleDetails?.engineNo || ''}</div>
                  <div><strong>Finance Name:</strong> ${ledgerData.financeDetails?.financer || ''}</div>
                  <div><strong>Sale Executive:</strong> ${ledgerData.salesExecutive || ''}</div>
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
                    ${
                      approvedEntries.length > 0
                        ? approvedEntries
                            .map(
                              (entry) => `
                          <tr>
                            <td>${entry.date}</td>
                            <td>${entry.description || ''}</td>
                            <td>${entry.receiptNo || ''}</td>
                            <td class="text-right">${entry.credit ? entry.credit.toLocaleString('en-IN') : '-'}</td>
                            <td class="text-right">${entry.debit ? entry.debit.toLocaleString('en-IN') : '-'}</td>
                            <td class="text-right">${entry.balance ? entry.balance.toLocaleString('en-IN') : '-'}</td>
                          </tr>
                        `
                            )
                            .join('')
                        : `<tr><td colspan="6" class="text-center">No approved entries found</td></tr>`
                    }
                    <tr>
                      <td colspan="3" class="text-left"><strong>Total</strong></td>
                      <td class="text-right"><strong>${totals.totalCredit.toLocaleString('en-IN')}</strong></td>
                      <td class="text-right"><strong>${totals.totalDebit.toLocaleString('en-IN')}</strong></td>
                      <td class="text-right"><strong>${totals.finalBalance.toLocaleString('en-IN')}</strong></td>
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
      <div className='title'>Customer Ledger</div>
    
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
          {error && (
            <CAlert color="danger" className="mb-3">
              {error}
            </CAlert>
          )}
          
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Booking ID</CTableHeaderCell>
                  <CTableHeaderCell>Model Name</CTableHeaderCell>
                  <CTableHeaderCell>Booking Date</CTableHeaderCell>
                  <CTableHeaderCell>Customer Name</CTableHeaderCell>
                  <CTableHeaderCell>Chassis Number</CTableHeaderCell>
                  <CTableHeaderCell>Total</CTableHeaderCell>
                  <CTableHeaderCell>Received</CTableHeaderCell>
                  <CTableHeaderCell>Balance</CTableHeaderCell>
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
                  currentRecords.map((booking, index) => (
                    <CTableRow key={booking._id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{booking.bookingNumber}</CTableDataCell>
                      <CTableDataCell>{booking.model?.model_name || ''}</CTableDataCell>
                      <CTableDataCell>
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : ''}
                      </CTableDataCell>
                      <CTableDataCell>{booking.customerDetails?.name || ''}</CTableDataCell>
                      <CTableDataCell>{booking.chassisNumber || ''}</CTableDataCell>
                      <CTableDataCell>₹{booking.discountedAmount?.toLocaleString('en-IN') || '0'}</CTableDataCell>
                      <CTableDataCell>₹{booking.receivedAmount?.toLocaleString('en-IN') || '0'}</CTableDataCell>
                      <CTableDataCell>₹{booking.balanceAmount?.toLocaleString('en-IN') || '0'}</CTableDataCell>
                      {hasPermission('LEDGER', 'READ') && (
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            color="info"
                            className="action-btn"
                            onClick={() => handleViewLedger(booking)}
                          >
                            {/* <CIcon icon={cilEye} className="me-1" /> */}
                            View
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

export default ViewLedgers;