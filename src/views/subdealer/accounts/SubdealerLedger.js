import React, { useState, useEffect } from 'react';
import '../../../css/invoice.css';
import '../../../css/table.css';
import '../../../css/form.css';
import { 
  CButton, 
  CCol, 
  CFormLabel, 
  CFormSelect, 
  CNav, 
  CNavItem, 
  CNavLink, 
  CRow, 
  CTabContent, 
  CTabPane,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert
} from '@coreui/react';
import { axiosInstance, getDefaultSearchFields, SearchOutlinedIcon, useTableFilter, showError } from 'src/utils/tableImports';
import tvsLogo from '../../../assets/images/logo.png';
import config from 'src/config';
import CIcon from '@coreui/icons-react';
import { cilPrint, cilMagnifyingGlass } from '@coreui/icons';

function SubdealerLedger() {
  const [activeTab, setActiveTab] = useState(0);
  const [subdealers, setSubdealers] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [selectedSubdealer, setSelectedSubdealer] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);

  useEffect(() => {
    fetchData();
    fetchSubdealers();
  }, []);

  useEffect(() => {
    if (selectedSubdealer) {
      fetchSubdealerReceipts();
    } else {
      setReceipts([]);
      setSelectedReceipt('');
    }
  }, [selectedSubdealer]);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/subdealers`);
      setData(response.data.data.subdealers);
      setFilteredData(response.data.data.subdealers);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  const fetchSubdealers = async () => {
    try {
      const response = await axiosInstance.get('/subdealers');
      setSubdealers(response.data.data.subdealers || []);
    } catch (error) {
      console.error('Error fetching subdealers:', error);
      showError(error);
    }
  };

  const fetchSubdealerReceipts = async () => {
    try {
      const response = await axiosInstance.get(`/subdealersonaccount/${selectedSubdealer}/on-account/receipts`);
      setReceipts(response.data.docs || []);
      setError('');
    } catch (error) {
      console.error('Error fetching subdealer receipts:', error);
      setError('Failed to load receipt data');
      setReceipts([]);
    }
  };

  const handleSubdealerChange = (e) => {
    setSelectedSubdealer(e.target.value);
    setSelectedReceipt('');
  };

  const handleReceiptChange = (e) => {
    setSelectedReceipt(e.target.value);
  };

  const handleSearch = (searchValue) => {
    handleFilter(searchValue, getDefaultSearchFields('subdealer'));
  };

  const handleViewLedger = async (subdealer) => {
    try {
      const res = await axiosInstance.get(`/subdealersonaccount/${subdealer._id}/on-account/receipts`);
      const ledgerData = res.data.docs;
      const subdealerBookings = res.data.subdealerBookings || [];
      const ledgerUrl = `${config.baseURL}/ledger.html?ledgerId=${subdealer._id}`;

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

                    rows += `
                      <tr>
                        <td>${new Date(receipt.receivedDate).toLocaleDateString('en-GB')}</td>
                        <td>
                          On Account Receipt<br>
                          Payment Mode: ${receipt.paymentMode}<br>
                          ${receipt.remark ? `Remark: ${receipt.remark}` : ''}
                        </td>
                        <td>${receipt.refNumber || ''}</td>
                        <td class="text-right">${receiptCredit.toLocaleString('en-IN')}</td>
                        <td class="text-right">0</td>
                        <td class="text-right">${runningBalance.toLocaleString('en-IN')}</td>
                      </tr>
                    `;

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
                            <td class="text-right">0</td>
                            <td class="text-right">${allocationDebit.toLocaleString('en-IN')}</td>
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

  return (
    <div>
      <div className='title'>Subdealer Ledger</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header'>
          <CNav variant="tabs" role="tablist" className="border-0">
            <CNavItem>
              <CNavLink
                active={activeTab === 0}
                onClick={() => setActiveTab(0)}
                className={`fw-bold ${activeTab === 0 ? 'text-primary' : 'text-muted'}`}
              >
                Sub Dealer
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 1}
                onClick={() => setActiveTab(1)}
                className={`fw-bold ${activeTab === 1 ? 'text-primary' : 'text-muted'}`}
              >
                Sub Dealer UTR
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>
        
        <CCardBody>
          <CTabContent>
            <CTabPane visible={activeTab === 0} className="p-0">
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
                      <CTableHeaderCell>Location</CTableHeaderCell>
                      <CTableHeaderCell>Rate Of Interest</CTableHeaderCell>
                      <CTableHeaderCell>Discount</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredData.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center">
                          No subdealers available
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      filteredData.map((subdealer, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{subdealer.name}</CTableDataCell>
                          <CTableDataCell>{subdealer.location}</CTableDataCell>
                          <CTableDataCell>{subdealer.rateOfInterest}</CTableDataCell>
                          <CTableDataCell>{subdealer.discount}</CTableDataCell>
                          <CTableDataCell>{subdealer.type}</CTableDataCell>
                          <CTableDataCell>
                            <CButton 
                              size="sm" 
                              className="action-btn"
                              onClick={() => handleViewLedger(subdealer)}
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
            </CTabPane>
            
            <CTabPane visible={activeTab === 1} className="p-0">
              {error && <CAlert color="danger" className="mb-3">{error}</CAlert>}

              <CRow className="mb-4">
                <CCol md={5}>
                  <CFormLabel htmlFor="subdealerSelect" className="fw-bold">Select Subdealer</CFormLabel>
                  <CFormSelect 
                    id="subdealerSelect" 
                    value={selectedSubdealer} 
                    onChange={handleSubdealerChange}
                    className="square-select"
                  >
                    <option value="">-- Select Subdealer --</option>
                    {subdealers.map((subdealer) => (
                      <option key={subdealer._id || subdealer.id} value={subdealer._id || subdealer.id}>
                        {subdealer.name} - {subdealer.location}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={5}>
                  <CFormLabel htmlFor="receiptSelect" className="fw-bold">Select UTR/Receipt</CFormLabel>
                  <CFormSelect
                    id="receiptSelect"
                    value={selectedReceipt}
                    onChange={handleReceiptChange}
                    disabled={!selectedSubdealer || receipts.length === 0}
                    className="square-select"
                  >
                    <option value="">-- Select UTR/Receipt --</option>
                    {receipts.map((receipt) => {
                      const remainingAmount = receipt.amount - (receipt.allocatedTotal || 0);
                      return (
                        <option key={receipt._id || receipt.id} value={receipt._id || receipt.id} disabled={remainingAmount <= 0}>
                          {receipt.refNumber || 'No reference'} - ₹{remainingAmount.toLocaleString()} remaining
                        </option>
                      );
                    })}
                  </CFormSelect>
                  <small className="text-muted">
                    {receipts.length === 0 && selectedSubdealer ? 'No receipts available' : 'Select a UTR to allocate payments'}
                  </small>
                </CCol>
                <CCol md={2} className="d-flex align-items-end">
                  <CButton color="primary" className="w-100">
                    View
                  </CButton>
                </CCol>
              </CRow>
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </div>
  );
}

export default SubdealerLedger;