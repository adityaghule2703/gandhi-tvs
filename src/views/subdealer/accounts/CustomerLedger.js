import '../../../css/table.css';
import '../../../css/form.css';
import {
  React,
  useState,
  useEffect,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  axiosInstance
} from 'src/utils/tableImports';
import tvsLogo from '../../../assets/images/logo.png';
import config from 'src/config';
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
  CTableDataCell,
  CAlert
} from '@coreui/react';

const CustomerLedger = () => {
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/bookings`);
      const subdealerBookings = response.data.data.bookings.filter((booking) => booking.bookingType === 'SUBDEALER');

      // const subdealerBookings = response.data.data.bookings.filter(
      //   (booking) => booking.bookingType === 'SUBDEALER' && booking.payment.type === 'FINANCE'
      // );
      setData(subdealerBookings);
      setFilteredData(subdealerBookings);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  const handleViewLedger = async (booking) => {
    try {
      const res = await axiosInstance.get(`/ledger/report/${booking._id}`);
      const ledgerData = res.data.data;
      const ledgerUrl = `${config.baseURL}/ledger.html?bookingId=${booking._id}`;

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
                <div><strong>Subdealer Name:</strong> ${ledgerData.subdealerDetails?.name || ''}</div>
                  <div><strong>Subdealer Address:</strong> ${ledgerData.subdealerDetails?.address || ''}</div>
                  <div><strong>Customer Name:</strong> ${ledgerData.customerDetails?.name || ''}</div>
                  <div><strong>Ledger Date:</strong> ${ledgerData.ledgerDate || new Date().toLocaleDateString('en-GB')}</div>
                  <div><strong>Customer Address:</strong> ${ledgerData.customerDetails?.address || ''}</div>
                  <div><strong>Customer Phone:</strong> ${ledgerData.customerDetails?.phone || ''}</div>
                  <div><strong>Chassis No:</strong> ${ledgerData.vehicleDetails?.chassisNo || ''}</div>
                  <div><strong>Engine No:</strong> ${ledgerData.vehicleDetails?.engineNo || ''}</div>
                  <div><strong>Finance Name:</strong> ${ledgerData.financeDetails?.financer || ''}</div>
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
                    ${ledgerData.entries
                      ?.map(
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
                      .join('')}
                    <tr>
                      <td colspan="3" class="text-left"><strong>Total</strong></td>
                      <td class="text-right"><strong>${ledgerData.totals?.totalCredit?.toLocaleString('en-IN') || '0'}</strong></td>
                      <td class="text-right"><strong>${ledgerData.totals?.totalDebit?.toLocaleString('en-IN') || '0'}</strong></td>
                      <td class="text-right"><strong>${ledgerData.totals?.finalBalance?.toLocaleString('en-IN') || '0'}</strong></td>
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

  const handleSearch = (searchValue) => {
    handleFilter(searchValue, getDefaultSearchFields('booking'));
  };

  return (
    <div>
      <div className='title'>Customer Ledger</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {/* You can add buttons here if needed */}
          </div>
        </CCardHeader>
        
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          
          <div className="d-flex justify-content-between mb-3">
            <div></div>
            <div className='d-flex'>
              <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
              <CFormInput
                type="text"
                className="d-inline-block square-search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search bookings..."
              />
            </div>
          </div>
          
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
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="10" className="text-center">
                      No ledger details available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((booking, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{booking.bookingNumber}</CTableDataCell>
                      <CTableDataCell>{booking.model?.model_name || ''}</CTableDataCell>
                      <CTableDataCell>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB') : ''}</CTableDataCell>
                      <CTableDataCell>{booking.customerDetails?.name || ''}</CTableDataCell>
                      <CTableDataCell>{booking.chassisNumber || ''}</CTableDataCell>
                      <CTableDataCell>{booking.discountedAmount?.toLocaleString('en-IN') || '0'}</CTableDataCell>
                      <CTableDataCell>{booking.receivedAmount?.toLocaleString('en-IN') || '0'}</CTableDataCell>
                      <CTableDataCell>{booking.balanceAmount?.toLocaleString('en-IN') || '0'}</CTableDataCell>
                      <CTableDataCell>
                        <CButton 
                          size="sm" 
                          className="action-btn"
                          onClick={() => handleViewLedger(booking)}
                        >
                          <CIcon icon={cilPrint} className='icon'/> View Ledger
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </div>
          
          <div className="d-flex justify-content-center mt-3">
            <PaginationOptions />
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default CustomerLedger;