import '../../css/table.css';
import '../../css/bill.css';
import {
  React,
  useEffect,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  axiosInstance
} from '../../utils/tableImports';
import { FaFilePdf, FaFileImage, FaFileAlt } from 'react-icons/fa';
import config from '../../config';
import { useState } from 'react';
import tvsLogo from '../../assets/images/logo.png';
import tvssangamner from '../../assets/images/tvssangamner.png';
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
  CSpinner
} from '@coreui/react';

const AllReceipt = () => {
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/vouchers`);
      console.log('API Response:', response.data);
      setData(response.data.transactions);
      setFilteredData(response.data.transactions);
    } catch (error) {
      console.log('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = async (id) => {
    try {
      const response = await axiosInstance.get(`/vouchers/receipt/${id}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `receipt_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handlePrintReceipt = async (id) => {
    try {
      const res = await axiosInstance.get(`/vouchers/${id}`);
      const data = res.data.data;

      const receiptHTML = generateReceiptHTML(data);

      const printWindow = window.open('', '_blank');
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
    } catch (err) {
      console.error('Error fetching receipt', err);
    }
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return null;

    const extension = fileUrl.split('.').pop().toLowerCase();

    if (extension === 'pdf') {
      return <FaFilePdf className="file-icon pdf" />;
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
      return <FaFileImage className="file-icon image" />;
    } else {
      return <FaFileAlt className="file-icon other" />;
    }
  };

  const handleViewBill = (billUrl) => {
    if (!billUrl) return;

    const fullUrl = `${config.baseURL}${billUrl}`;
    const extension = billUrl.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
      window.open(fullUrl, '_blank');
    } else if (extension === 'pdf') {
      window.open(fullUrl, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = billUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const numberToWords = (num) => {
    if (num === 0) return 'Zero';

    const a = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const g = ['', 'Thousand', 'Lakh', 'Crore'];

    const toWords999 = (n) => {
      if (n === 0) return '';
      if (n < 20) return a[n];
      if (n < 100) return `${b[Math.floor(n / 10)]} ${a[n % 10]}`.trim();
      return `${a[Math.floor(n / 100)]} Hundred ${toWords999(n % 100)}`.trim();
    };

    let res = '';
    let i = 0;
    while (num > 0) {
      const chunk = num % 1000;
      if (chunk) res = `${toWords999(chunk)} ${g[i]} ${res}`.trim();
      num = Math.floor(num / 1000);
      i++;
    }
    return res;
  };

  const generateReceiptHTML = (receipt) => {
    const amountWords = numberToWords(receipt.amount);
    const ledgerUrl = `${config.baseURL}/ledger.html?customerId=${receipt._id}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Account Customer Receipt</title>
        <style>
          body { 
          font-family: Courier New;
          width: 210mm;
          margin: 0 auto;
          padding: 10mm; 
          }

          .header-container {
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
           border-bottom: 2px solid #AAAAAA;
        }
        .logo-left {
          width: 30mm;
          height: auto;
        }
        .logo-right {
          width: 30mm;
          height: auto;
        }
        .header-text {
          flex-grow: 1;
        }
        .header-text h1 {
          margin: 0;
          font-size: 24px;
        }
        .header-text p {
          margin: 2px 0;
          font-size: 14px;
        }
        
        
          .section { 
          margin-bottom: 10px; 
          }
        
          .signature { margin-top: 30px; text-align: right; font-weight: bold; }
          hr { margin: 15px 0; }
          @page { size: A4; margin: 20mm; }

          .header2 h4{
             padding:5px;
            font-weight:700;
            color:#555555;
          }
            .divider{
            border: 1px solid #AAAAAA;
            }
            .main-section{
              display:flex;
              justify-content:space-between;
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
        </style>
      </head>
      <body>

       <div class="header-container">
              <div>
             <img src="${tvsLogo}" class="logo-left" alt="TVS Logo">
                  <div class="header-text">
                      <h1>GANDHI TVS</h1>
                       <p>Authorised Main Dealer: TVS Motor Company Ltd.</p>
                      <p>Registered office:'JOGPREET' Asher Estate, Near Ichhamani Lawns, Upnagar,<br> Nashik Road, Nashik ,7498903672</p>
                     </div>
              </div>
              <div>
                <img src="${tvssangamner}" class="logo-right" alt="TVS Logo">
                </div>
      </div>
        <div class="main-section">
          <div class="section"><strong>Receipt No:</strong> ${receipt.voucherId}</div>
          <div class="section"><strong>Receipt Date:</strong> ${new Date(receipt.date).toLocaleDateString('en-GB')}</div>
        </div>
    
        <div class="section"><strong>Recipient:</strong> ${receipt.recipientName}</div>
        <div class="section"><strong>Payment Mode:</strong> ${receipt.paymentMode}</div>
        <div class="section">Amount: ₹${receipt.amount}</div>
        <div class="section">( In Words ) &nbsp; ${amountWords} Only</div>
        <div class="divider"></div>

        <div class='header2'>
        <h4>NOTE- THIS RECEIPT IS VALID SUBJECT TO BANK REALISATION</h4>
        </div>
       
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
      </body>
      </html>
    `;
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('allReceipts'));
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
      <div className='title'>Cash Receipt</div>
    
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
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Voucher ID</CTableHeaderCell>
                  <CTableHeaderCell>Recipient Name</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Debit</CTableHeaderCell>
                  <CTableHeaderCell>Credit</CTableHeaderCell>
                  <CTableHeaderCell>Payment Mode</CTableHeaderCell>
                  <CTableHeaderCell>Bank Location</CTableHeaderCell>
                  <CTableHeaderCell>Cash Location</CTableHeaderCell>
                  <CTableHeaderCell>Bill</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="11" className="text-center">
                      No cash receipts available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((item, index) => (
                    <CTableRow key={item.id || item._id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{item.receiptNo}</CTableDataCell>
                      <CTableDataCell>{item.accountHead}</CTableDataCell>
                      <CTableDataCell>{item.date}</CTableDataCell>
                      <CTableDataCell>₹{item.debit}</CTableDataCell>
                      <CTableDataCell>₹{item.credit}</CTableDataCell>
                      <CTableDataCell>{item.paymentMode || ''}</CTableDataCell>
                      <CTableDataCell>{item.bankLocation || ''}</CTableDataCell>
                      <CTableDataCell>{item.cashLocation || ''}</CTableDataCell>
                      <CTableDataCell>
                        {item.billUrl ? (
                          <div className="bill-cell" onClick={() => handleViewBill(item.billUrl)}>
                            {getFileIcon(item.billUrl)}
                            <span className="bill-text">View Bill</span>
                          </div>
                        ) : (
                          'No bill'
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="info"
                          className="action-btn"
                          onClick={() => handlePrintReceipt(item.id || item._id)}
                        >
                          {/* <CIcon icon={cilEye} className="me-1" /> */}
                          View
                        </CButton>
                      </CTableDataCell>
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

export default AllReceipt;