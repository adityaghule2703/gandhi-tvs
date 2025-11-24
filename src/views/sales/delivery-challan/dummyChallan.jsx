// import React, { useState, useEffect } from 'react';
// import '../../css/invoice.css';
// import {
//   CFormInput,
//   CInputGroup,
//   CInputGroupText,
//   CButton,
//   CNav,
//   CNavItem,
//   CNavLink,
//   CTabContent,
//   CTabPane,
// } from '@coreui/react';
// import CIcon from '@coreui/icons-react';
// import { cilCarAlt, cilPrint, cilReload, cilSearch } from '@coreui/icons';
// import axiosInstance from 'axiosInstance';
// import tvsLogo from '../../assets/images/logo.png';
// function DeliveryChallan() {
//   const [activeTab, setActiveTab] = useState(0);
//   const [formData, setFormData] = useState({
//     chassisNumber: ''
//   });
//   const [bookingData, setBookingData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (formData.chassisNumber.trim().length > 0) {
//         fetchBookingDetails();
//       }
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [formData.chassisNumber]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleClear = () => {
//     setFormData({ chassisNumber: '' });
//     setBookingData(null);
//     setError('');
//   };

//   const fetchBookingDetails = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       const response = await axiosInstance.get(`/bookings/chassis/${formData.chassisNumber}`);

//       if (response.data.success) {
//         setBookingData(response.data.data);
//       } else {
//         setError('No booking found for this chassis number');
//         setBookingData(null);
//       }
//     } catch (err) {
//       setError('Failed to fetch booking details');
//       console.error(err);
//       setBookingData(null);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handlePrint = () => {
//     if (!bookingData) {
//       setError('Please enter a valid chassis number');
//       return;
//     }

//     const printWindow = window.open('', '_blank');

//     if (activeTab === 2) {
//       printWindow.document.write(generateHelmetDeclarationHTML(bookingData));
//     } else {
//       printWindow.document.write(generateDeliveryChallanHTML(bookingData, activeTab === 0 ? 'Customer Copy' : 'Office Copy'));
//     }

//     printWindow.document.close();
//     printWindow.focus();
//   };
//   const generateDeliveryChallanHTML = (data, copyType) => {
//     const currentDate = new Date().toLocaleDateString('en-GB');
//     const displayName = data.bookingType === 'SUBDEALER' ? data.subdealer?.name || 'N/A' : data.customerDetails.name;

//     const displayAddress =
//       data.bookingType === 'SUBDEALER'
//         ? data.subdealer?.location || 'N/A'
//         : `${data.customerDetails.address}, ${data.customerDetails.taluka}, ${data.customerDetails.district}`;

//     return `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Sale/Delivery Challan - ${copyType}</title>
//         <style>
//           body {
//             font-family: Courier New;
//             margin: 0;
//             padding: 0;
//           }
//           .page {
//             width: 210mm;
//             min-height: 297mm;
//             margin: 0 auto;
//             padding: 5mm;
//             box-sizing: border-box;
//           }
//           .header-container {
//             display: flex;
//             align-items: center;
//             margin-bottom: 5mm;
//           }
//           .logo {
//             width: 30mm;
//             height: auto;
//             margin-right: 5mm;
//           }
//           .header-text {
//             color:#555555;
//             flex-grow: 1;
//             text-align: center;
//             font-size: 21px;
//             font-weight: 700;
//           }

//           table {
//   width: 100%;
//   border-collapse: collapse;
//   margin-bottom: 5mm;
// }
// td {
//   padding: 1mm 0;
//   font-size: 11pt;
// }
// tr.border-top-bottom td {
//   padding: 1mm;
//   width: auto;
// }

// tr.data-row td:nth-child(1) {
//   width: 25%;
//   padding-right: 1mm;
// }
// tr.data-row td:nth-child(2) {
//   width: 3%;
//   padding: 0;
// }
// tr.data-row td:nth-child(3),
// tr.data-row td:nth-child(4) {
//   width: auto;
//   padding-left: 1mm;
// }
//           .border-top-bottom {
//            border-top: 2px solid #AAAAAA;
//            border-bottom: 2px solid #AAAAAA;
//           }
//           .declaration {
//             font-size: 11px;
//             text-align: justify;
//             line-height: 1.3;
//             color: #555555;
//           }
//           .signature {
//             text-align: right;
//             margin-top: 10mm;
//           }
//           .account-details{
//           color:#555555;
//           font-weight:bold;
//           }
//           .signature-box {
//             border-top: 2px solid #AAAAAA;
//             border-bottom: 2px solid #AAAAAA;
//             padding: 1px 0;
//             text-align: right;
//             color:#555555;
//            font-weight:bold;
//           }
//           .jurisdiction {
//             text-align: center;
//             font-weight: bold;
//             font-size: 14px;
//             color: #555555
//           }
//           .bold {
//           font-weight: 700;
//           color:#555555;

//            }
//           .divider {
//             margin: 5mm 0;
//             padding: 2mm 0;
//           }
//           .copy-title {
//             text-align: center;
//             color:#555555;
//             font-size: 21px;
//             margin-bottom: 5mm;
//             font-weight: 700;
//           }
//           @page {
//             size: A4;
//             margin: 0;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="page">
//           <!-- Customer Copy -->
//           <div class="header-container">
//             <img src="${tvsLogo}" class="logo" alt="TVS Logo">
//             <div class="header-text"> Sale / Delivery challan</div>
//           </div>

//           <table>
//             <tr class="border-top-bottom">
//               <td width="20%">Booking No.:</td>
//               <td width="25%"><span class="bold">${data.bookingNumber || 'N/A'}</span></td>
//               <td width="15%">Sales Date</td>
//               <td width="40%"><span class="bold">${currentDate}</span></td>
//             </tr>
//             <tr class="data-row">
//              <td>${data.bookingType === 'SUBDEALER' ? 'Subdealer Name' : 'Name'}</td>
//               <td>:</td>
//               <td><span class="bold">${displayName}</span></td>
//             </tr>
//             <tr class="data-row">
//               <td>${data.bookingType === 'SUBDEALER' ? 'Subdealer Address' : 'Address'}</td>
//               <td>:</td>
//               <td colspan="2"><span class="bold">${displayAddress}</span></td>
//             </tr>
//             <tr class="data-row">
//               <td>S.E Name</td>
//               <td>:</td>
//               <td colspan="2"><span class="bold">${data.salesExecutive?.name || 'N/A'}</span></td>
//             </tr>
//             <tr class="data-row">
//               <td>Model</td>
//               <td>:</td>
//               <td><span class="bold">${data.model?.model_name || ''}</span></td>
//               <td>Colour : <span class="bold">${data.color?.name || 'N/A'}</span></td>
//             </tr>
//             <tr class="data-row">
//               <td>Chasis No</td>
//               <td>:</td>
//               <td><span class="bold">${data.chassisNumber || ''}</span></td>
//               <td>Key No. : <span class="bold">${data.keyNumber || '0'}</span></td>
//             </tr>
//             <tr class="data-row">
//               <td>Engine No</td>
//               <td>:</td>
//               <td><span class="bold">${data.engineNumber || ''}</span></td>
//               <td></td>
//             </tr>
//             <tr class="data-row">
//               <td>Financer</td>
//               <td>:</td>
//               <td colspan="2"><span class="bold">${data.payment.financer?.name || ''}</span></td>
//             </tr>
//             <tr class="data-row">
//               <td>Total</td>
//               <td>:</td>
//               <td><span class="bold">₹${data.totalAmount}</span></td>
//               <td>Grand Total : <span class="bold">₹${data.discountedAmount}</span></td>
//             </tr>
//           </table>
//            <div class='account-details'>ACC.DETAILS:
//  ${data.accessories
//    .map((accessory) => (accessory.accessory ? accessory.accessory.name : ''))
//    .filter((name) => name)
//    .join(', ')}
//            </div>
//           <div class="signature-box">
//             <div><b>Authorised Signature</b></div>
//           </div>

//           <p class="bold">Customer Declarations:</p>
//           <p class="declaration">
//             I/We Authorized the dealer or its representative to register the vehicle at RTO In my/Our name as booked by us,
//             However getting the vehicle insured from Insurance company & getting the vehicle registered from RTO is entirely
//             my/our sole responsibility. Registration Number allotted by RTO will be acceptable to me else I will pre book for
//             choice number at RTO at my own. Dealership has no role in RTO Number allocation I/We am/are exclusively responsible
//             for any loss/penalty/Legal action- occurred due to non-compliance of /Delay in Insurance or RTO registration. I have
//             understood and accepted all T & C about warranty as per the Warranty policy of TVS MOTOR COMPANY Ltd & agree to abide
//             the same. I have also understood & accepted that the warranty for Tyres & Battery Lies with concerned Manufacturer or
//             its dealer & I will not claim for warranty of these products to TVS MOTOR COMPANY or to Its Dealer I am being informed
//             about the price breakup, I had understood & agreed upon the same & then had booked the vehicle, I am bound to pay penal
//             interest @ 24% P.A. on delayed payment. I accept that vehicle once sold by dealer shall not be taken back /replaced for
//             any reason.
//           </p>

//           <div>
//             <p class="bold">Customer Signature</p>
//           </div>

//           <p class="jurisdiction">Subject To Sangamner Jurisdiction</p>

//           <!-- Office Copy -->
//           <div style="page-break-before: always; margin-top: 10mm;">
//             <div class="copy-title">Sale / Delivery challan</div>

//             <table>
//               <tr class="border-top-bottom">
//                 <td width="20%">Booking No.:</td>
//                 <td width="25%"><span class="bold">${data.bookingNumber || 'N/A'}</span></td>
//                 <td width="15%">Sales Date</td>
//                 <td width="40%"><span class="bold">${currentDate}</span></td>
//               </tr>
//               <tr>
//                 <td>Name</td>
//                 <td>:</td>
//                 <td colspan="2"><span class="bold">${data.customerDetails.name || ''}</span></td>
//               </tr>
//               <tr>
//                 <td>Address</td>
//                 <td>:</td>
//                 <td colspan="2"><span class="bold">${data.customerDetails.address}, ${data.customerDetails.taluka}, ${data.customerDetails.district}</span></td>
//               </tr>
//               <tr>
//                 <td>S.E Name</td>
//                 <td>:</td>
//                 <td colspan="2"><span class="bold">${data.salesExecutive?.name || ''}</span></td>
//               </tr>
//               <tr>
//                 <td>Model</td>
//                 <td>:</td>
//                 <td><span class="bold">${data.model.model_name || ''}</span></td>
//                 <td>Colour : <span class="bold">${data.color?.name || 'N/A'}</span></td>
//               </tr>
//               <tr>
//                 <td>Chasis No</td>
//                 <td>:</td>
//                 <td><span class="bold">${data.chassisNumber || ''}</span></td>
//                 <td>Key No. : <span class="bold">${data.keyNumber || '0'}</span></td>
//               </tr>
//               <tr>
//                 <td>Engine No</td>
//                 <td>:</td>
//                 <td><span class="bold">${data.engineNumber}</span></td>
//                 <td></td>
//               </tr>
//               <tr>
//                 <td>Financer</td>
//                 <td>:</td>
//                 <td colspan="2"><span class="bold">${data.payment.financer?.name || ''}</span></td>
//               </tr>
//               <tr>
//                 <td>Total</td>
//                 <td>:</td>
//                 <td><span class="bold">₹${data.totalAmount}</span></td>
//                 <td>Grand Total: <span class="bold">₹${data.discountedAmount}</span></td>
//               </tr>
//             </table>

//             <div class='account-details'>ACC.DETAILS:
//              ${data.accessories
//                .map((accessory) => (accessory.accessory ? accessory.accessory.name : ''))
//                .filter((name) => name)
//                .join(', ')}
//             </div>
//             <div class="signature-box">
//               <div><b>Authorised Signature</b></div>
//             </div>

//             <p class="bold">Customer Declarations:</p>
//             <p class="declaration">
//               I/We Authorized the dealer or its representative to register the vehicle at RTO In my/Our name as booked by us,
//               However getting the vehicle insured from Insurance company & getting the vehicle registered from RTO is entirely
//               my/our sole responsibility. Registration Number allotted by RTO will be acceptable to me else I will pre book for
//               choice number at RTO at my own. Dealership has no role in RTO Number allocation I/We am/are exclusively responsible
//               for any loss/penalty/Legal action- occurred due to non-compliance of /Delay in Insurance or RTO registration. I have
//               understood and accepted all T & C about warranty as per the Warranty policy of TVS MOTOR COMPANY Ltd & agree to abide
//               the same. I have also understood & accepted that the warranty for Tyres & Battery Lies with concerned Manufacturer or
//               its dealer & I will not claim for warranty of these products to TVS MOTOR COMPANY or to Its Dealer I am being informed
//               about the price breakup, I had understood & agreed upon the same & then had booked the vehicle, I am bound to pay penal
//               interest @ 24% P.A. on delayed payment. I accept that vehicle once sold by dealer shall not be taken back /replaced for
//               any reason.
//             </p>

//             <div>
//               <p class="bold">Customer Signature</p>
//             </div>

//             <p class="jurisdiction">Subject To Sangamner Jurisdiction</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;
//   };

//   const generateHelmetDeclarationHTML = (data) => {
//     const currentDate = new Date();
//     const day = currentDate.getDate().toString().padStart(2, '0');
//     const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
//     const year = currentDate.getFullYear();
//     const formattedDate = `${day}/${month}/${year}`;

//     return `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <title>Helmet Declaration</title>
//     <style>
//         html, body {
//             height: 100%;
//             margin: 0;
//             padding: 0;
//             background-color: #f5f5f5;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         }
//         .declaration-wrapper {
//             width: 210mm;
//             margin: 20px 0;
//         }
//         .declaration-body {
//             font-family: 'Arial Unicode MS', 'Shivaji01', 'Shivaji02', sans-serif;
//             margin: 15mm;
//             padding: 0;
//             font-size: 12pt;
//             line-height: 1.4;
//         }
//         @page {
//             size: A4;
//             margin: 0;
//         }
//         .header {
//             text-align: center;
//             font-weight: bold;
//             font-size: 18pt;
//             margin-bottom: 10mm;
//         }
//         .content {
//             margin-bottom: 5mm;
//             text-align:center;
//         }
//         .customer-info {
//             margin-bottom: 10mm;
//         }
//         .customer-info-row {
//             margin-bottom: 2mm;
//         }
//         .bold {
//             font-weight: bold;
//         }
//         .signature {
//             margin-top: 15mm;
//             display:flex;
//             justify-content:space-between;
//         }
//         .jurisdiction {
//             text-align: center;
//             margin-top: 10mm;
//             font-weight: bold;
//         }
//         .vehicle-details {
//             margin: 5mm 0;
//         }
//         .declaration {
//             margin-top: 10mm;
//             text-align: justify;
//         }
//         .divider {
//             border-top: 2px solid #AAAAAA;
//             margin: 1mm 0;
//         }
//         @media print {
//             html, body {
//                 background: none;
//                 display: block;
//             }
//             .declaration-wrapper {
//                 box-shadow: none;
//                 margin: 0;
//             }
//         }
//     </style>
// </head>
// <body>
//     <div class="declaration-wrapper">
//         <div class="declaration-body">
//             <div class="header">
//                 हेल्मेट प्राप्ती घोषणापत्र
//             </div>

//             <div class="content">
//                 केंद्रीय मोटर वाहन नियम १३८ { ४ } { फ }
//             </div>
//             <div class="divider"></div>
//             <div class="declaration">
//                 <p>
//                     मी..${data.customerDetails.name}, असे घोषित करतो कि

//                     दि. ${formattedDate} रोजी गांधी मोटार टि व्हि यस नासिक

//                     या वितरकाकडून टि व्हि यस..${data.model.model_name}, हे वाहन खरेदी केले आहे.

//                     त्याचा तपशील खालील प्रमाणे...
//                 </p>
//                 <div class="vehicle-details">
//                     <div class="customer-info-row"><strong>चेसिस नंबर:</strong> ${data.chassisNumber}</div>
//                     <div class="customer-info-row"><strong>इंजिन नंबर:</strong> ${data.engineNumber}</div>
//                 </div>

//                 <p>
//                     केंद्रीय मोटर वाहन नियम १३८ { ४ } { फ } प्रमाणे वितरकाने दुचाकी वितरीत करते वेळी विहित
//                     मानाकनाचे २ (दोन) हेल्मेट पुरवणे/विकत देणे बंधनकारक आहे. त्याचप्रमाणे मला BUREAU OF INDIA STANDARS
//                     UNDER THE BUREAU OF INDIA ACT-1986 { 63 TO 1986 } या प्रमाणे हेल्मेट मिळाले आहे.
//                 </p>
//                 <p>
//                     मी याद्वारे जाहीर करतो/करते की वर दिलेला तपशील माझ्या संपूर्ण माहिती प्रमाणे व तपासा्रमाणे सत्य आहे.
//                 </p>
//             </div>

//             <div class="signature">
//                 <div>
//                     स्वाक्षरी व शिक्का
//                     <br>
//                     गांधी मोटर्स<br>
//                     नासिक
//                 </div>
//                 <div>
//                     दुचाकी खरेदिदाराची स्वाक्षरी<br>
//                     नाव :- ${data.customerDetails.name}
//                 </div>
//             </div>

//             <div class="jurisdiction">
//                 Subject To Nashik Jurisdiction
//             </div>
//         </div>
//     </div>
// </body>
// </html>
//     `;
//   };
//   return (
//     <div className="invoice-container">
//       <h4 className="mb-4">Delivery Challan</h4>

//       <CNav variant="tabs">
//         <CNavItem>
//           <CNavLink active={activeTab === 0} onClick={() => setActiveTab(0)}>
//             Customer Copy
//           </CNavLink>
//         </CNavItem>
//         <CNavItem>
//           <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
//             Office Copy
//           </CNavLink>
//         </CNavItem>
//         <CNavItem>
//           <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
//             Helmet Declaration
//           </CNavLink>
//         </CNavItem>
//       </CNav>

//       <CTabContent>
//         <CTabPane visible={activeTab === 0} className="p-3">
//           <h5>Generate DC/Customer Copy</h5>
//           <CInputGroup className="mb-3">
//             <CInputGroupText>
//               <CIcon className="icon" icon={cilCarAlt} />
//             </CInputGroupText>
//             <CFormInput placeholder="Enter Chassis Number" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} />
//             {loading && (
//               <CInputGroupText>
//                 <div className="spinner-border spinner-border-sm" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//               </CInputGroupText>
//             )}
//           </CInputGroup>

//           {error && <div className="text-danger mb-3">{error}</div>}

//           <div className="d-flex gap-2">
//             <CButton color="primary" onClick={handlePrint} disabled={!bookingData || loading}>
//               <CIcon icon={cilPrint} className="me-2" />
//               Print
//             </CButton>
//             <CButton color="secondary" onClick={handleClear}>
//               <CIcon icon={cilReload} className="me-2" />
//               Clear
//             </CButton>
//           </div>
//         </CTabPane>

//         <CTabPane visible={activeTab === 1} className="p-3">
//           <h5>Generate DC/Office Copy</h5>
//           <CInputGroup className="mb-3">
//             <CInputGroupText>
//               <CIcon className="icon" icon={cilCarAlt} />
//             </CInputGroupText>
//             <CFormInput placeholder="Enter Chassis Number" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} />
//             {loading && (
//               <CInputGroupText>
//                 <div className="spinner-border spinner-border-sm" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//               </CInputGroupText>
//             )}
//           </CInputGroup>

//           {error && <div className="text-danger mb-3">{error}</div>}

//           <div className="d-flex gap-2">
//             <CButton color="primary" onClick={handlePrint} disabled={!bookingData || loading}>
//               <CIcon icon={cilPrint} className="me-2" />
//               Print
//             </CButton>
//             <CButton color="secondary" onClick={handleClear}>
//               <CIcon icon={cilReload} className="me-2" />
//               Clear
//             </CButton>
//           </div>
//         </CTabPane>

//         {/* <CTabPane visible={activeTab === 2} className="p-3">
//           <h5>Helmet Declaration</h5>
//           <CInputGroup className="mb-3">
//             <CInputGroupText>
//               <CIcon className="icon" icon={cilCarAlt} />
//             </CInputGroupText>
//             <CFormInput placeholder="Enter Chassis Number" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} />
//             {loading && (
//               <CInputGroupText>
//                 <div className="spinner-border spinner-border-sm" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//               </CInputGroupText>
//             )}
//           </CInputGroup>

//           {error && <div className="text-danger mb-3">{error}</div>}

//           <div className="d-flex gap-2">
//             <CButton color="primary" onClick={handlePrint} disabled={!bookingData || loading}>
//               <CIcon icon={cilPrint} className="me-2" />
//               Print
//             </CButton>
//             <CButton color="secondary" onClick={handleClear}>
//               <CIcon icon={cilReload} className="me-2" />
//               Clear
//             </CButton>
//           </div>
//         </CTabPane> */}
//         <CTabPane visible={activeTab === 2} className="p-3">
//           <h5>Helmet Declaration</h5>
//           <p className="text-muted mb-3">Enter chassis number to generate helmet declaration form</p>

//           <CInputGroup className="mb-3">
//             <CInputGroupText>
//               <CIcon className="icon" icon={cilCarAlt} />
//             </CInputGroupText>
//             <CFormInput placeholder="Enter Chassis Number" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} />
//             {loading && (
//               <CInputGroupText>
//                 <div className="spinner-border spinner-border-sm" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//               </CInputGroupText>
//             )}
//           </CInputGroup>

//           {error && <div className="text-danger mb-3">{error}</div>}

//           <div className="d-flex gap-2">
//             <CButton color="primary" onClick={handlePrint} disabled={!bookingData || loading}>
//               <CIcon icon={cilPrint} className="me-2" />
//               Generate & Print
//             </CButton>
//             <CButton color="secondary" onClick={handleClear}>
//               <CIcon icon={cilReload} className="me-2" />
//               Clear
//             </CButton>
//           </div>
//         </CTabPane>
//       </CTabContent>
//     </div>
//   );
// }

// export default DeliveryChallan;

import React, { useState, useEffect } from 'react';
import '../../css/invoice.css';
import { CFormInput, CInputGroup, CInputGroupText, CButton, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCarAlt, cilPrint, cilReload } from '@coreui/icons';
import axiosInstance from 'axiosInstance';
import tvsLogo from '../../assets/images/logo.png';

function DeliveryChallan() {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    chassisNumber: ''
  });
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [declarations, setDeclarations] = useState([]);

  useEffect(() => {
    const fetchDeclarations = async () => {
      try {
        const response = await axiosInstance.get('/declarations?formType=delivery_challan');
        if (response.data.status === 'success') {
          const sortedDeclarations = response.data.data.declarations.sort((a, b) => a.priority - b.priority);
          setDeclarations(sortedDeclarations);
        }
      } catch (error) {
        console.error('Error fetching declarations:', error);
      }
    };

    fetchDeclarations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.chassisNumber.trim().length > 0) {
        fetchBookingDetails();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.chassisNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({ chassisNumber: '' });
    setBookingData(null);
    setError('');
  };

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get(`/bookings/chassis/${formData.chassisNumber}`);

      if (response.data.success) {
        setBookingData(response.data.data);
      } else {
        setError('No booking found for this chassis number');
        setBookingData(null);
      }
    } catch (err) {
      setError('Failed to fetch booking details');
      console.error(err);
      setBookingData(null);
    } finally {
      setLoading(false);
    }
  };

  const generateDeclarationHTML = () => {
    if (declarations.length === 0) {
      return `
        I/We Authorized the dealer or its representative to register the vehicle at RTO In my/Our name as booked by us,
        However getting the vehicle insured from Insurance company & getting the vehicle registered from RTO is entirely
        my/our sole responsibility. Registration Number allotted by RTO will be acceptable to me else I will pre book for
        choice number at RTO at my own. Dealership has no role in RTO Number allocation I/We am/are exclusively responsible
        for any loss/penalty/Legal action- occurred due to non-compliance of /Delay in Insurance or RTO registration. I have
        understood and accepted all T & C about warranty as per the Warranty policy of TVS MOTOR COMPANY Ltd & agree to abide
        the same. I have also understood & accepted that the warranty for Tyres & Battery Lies with concerned Manufacturer or
        its dealer & I will not claim for warranty of these products to TVS MOTOR COMPANY or to Its Dealer I am being informed
        about the price breakup, I had understood & agreed upon the same & then had booked the vehicle, I am bound to pay penal
        interest @ 24% P.A. on delayed payment. I accept that vehicle once sold by dealer shall not be taken back /replaced for
        any reason.
      `;
    }

    return declarations.map((declaration) => declaration.content).join('<br/><br/>');
  };

  const handlePrint = () => {
    if (!bookingData) {
      setError('Please enter a valid chassis number');
      return;
    }

    const printWindow = window.open('', '_blank');

    if (activeTab === 2) {
      printWindow.document.write(generateHelmetDeclarationHTML(bookingData));
    } else {
      printWindow.document.write(generateDeliveryChallanHTML(bookingData, activeTab === 0 ? 'Customer Copy' : 'Office Copy'));
    }

    printWindow.document.close();
    printWindow.focus();
  };

  const generateDeliveryChallanHTML = (data, copyType) => {
    const currentDate = new Date().toLocaleDateString('en-GB');
    const displayName = data.bookingType === 'SUBDEALER' ? data.subdealer?.name || 'N/A' : data.customerDetails.name;

    const displayAddress =
      data.bookingType === 'SUBDEALER'
        ? data.subdealer?.location || 'N/A'
        : `${data.customerDetails.address}, ${data.customerDetails.taluka}, ${data.customerDetails.district}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sale/Delivery Challan - ${copyType}</title>
        <style>
          body {
            font-family: Courier New;
            margin: 0;
            padding: 0;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 5mm;
            box-sizing: border-box;
          }
          .header-container {
            display: flex;
            align-items: center;
            margin-bottom: 5mm;
          }
          .logo {
            width: 30mm;
            height: auto;
            margin-right: 5mm;
          }
          .header-text {
            color:#555555;
            flex-grow: 1;
            text-align: center;
            font-size: 21px;
            font-weight: 700;
          }

          table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 5mm;
}
td {
  padding: 1mm 0;
  font-size: 11pt;
}
tr.border-top-bottom td {
  padding: 1mm;
  width: auto;
}

tr.data-row td:nth-child(1) {
  width: 25%;
  padding-right: 1mm;
}
tr.data-row td:nth-child(2) {
  width: 3%;
  padding: 0;
}
tr.data-row td:nth-child(3),
tr.data-row td:nth-child(4) {
  width: auto;
  padding-left: 1mm;
}
          .border-top-bottom {
           border-top: 2px solid #AAAAAA;
           border-bottom: 2px solid #AAAAAA;
          }
          .declaration {
            font-size: 11px;
            text-align: justify;
            line-height: 1.3;
            color: #555555;
          }
          .signature {
            text-align: right;
            margin-top: 10mm;
          }
          .account-details{
          color:#555555;
          font-weight:bold;
          }
          .signature-box {
            border-top: 2px solid #AAAAAA;
            border-bottom: 2px solid #AAAAAA;
            padding: 1px 0;
            text-align: right;
            color:#555555;
           font-weight:bold;
          }
          .jurisdiction {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            color: #555555
          }
          .bold {
          font-weight: 700;
          color:#555555;

           }
          .divider {
            margin: 5mm 0;
            padding: 2mm 0;
          }
          .copy-title {
            text-align: center;
            color:#555555;
            font-size: 21px;
            margin-bottom: 5mm;
            font-weight: 700;
          }
          @page {
            size: A4;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- Customer Copy -->
          <div class="header-container">
            <img src="${tvsLogo}" class="logo" alt="TVS Logo">
            <div class="header-text"> Sale / Delivery challan</div>
          </div>

          <table>
            <tr class="border-top-bottom">
              <td width="20%">Booking No.:</td>
              <td width="25%"><span class="bold">${data.bookingNumber || 'N/A'}</span></td>
              <td width="15%">Sales Date</td>
              <td width="40%"><span class="bold">${currentDate}</span></td>
            </tr>
            <tr class="data-row">
             <td>${data.bookingType === 'SUBDEALER' ? 'Subdealer Name' : 'Name'}</td>
              <td>:</td>
              <td><span class="bold">${displayName}</span></td>
            </tr>
            <tr class="data-row">
              <td>${data.bookingType === 'SUBDEALER' ? 'Subdealer Address' : 'Address'}</td>
              <td>:</td>
              <td colspan="2"><span class="bold">${displayAddress}</span></td>
            </tr>
            <tr class="data-row">
              <td>S.E Name</td>
              <td>:</td>
              <td colspan="2"><span class="bold">${data.salesExecutive?.name || 'N/A'}</span></td>
            </tr>
            <tr class="data-row">
              <td>Model</td>
              <td>:</td>
              <td><span class="bold">${data.model?.model_name || ''}</span></td>
              <td>Colour : <span class="bold">${data.color?.name || 'N/A'}</span></td>
            </tr>
            <tr class="data-row">
              <td>Chasis No</td>
              <td>:</td>
              <td><span class="bold">${data.chassisNumber || ''}</span></td>
              <td>Key No. : <span class="bold">${data.keyNumber || '0'}</span></td>
            </tr>
            <tr class="data-row">
              <td>Engine No</td>
              <td>:</td>
              <td><span class="bold">${data.engineNumber || ''}</span></td>
              <td></td>
            </tr>
            <tr class="data-row">
              <td>Financer</td>
              <td>:</td>
              <td colspan="2"><span class="bold">${data.payment.financer?.name || ''}</span></td>
            </tr>
            <tr class="data-row">
              <td>Total</td>
              <td>:</td>
              <td><span class="bold">₹${data.totalAmount}</span></td>
              <td>Grand Total : <span class="bold">₹${data.discountedAmount}</span></td>
            </tr>
          </table>
           <div class='account-details'>ACC.DETAILS:
 ${data.accessories
   .map((accessory) => (accessory.accessory ? accessory.accessory.name : ''))
   .filter((name) => name)
   .join(', ')}
           </div>
          <div class="signature-box">
            <div><b>Authorised Signature</b></div>
          </div>

          <p class="bold">Customer Declarations:</p>
          <p class="declaration">
            ${generateDeclarationHTML()}
          </p>

          <div>
            <p class="bold">Customer Signature</p>
          </div>

          <p class="jurisdiction">Subject To Sangamner Jurisdiction</p>

          <!-- Office Copy -->
          <div style="page-break-before: always; margin-top: 10mm;">
            <div class="copy-title">Sale / Delivery challan</div>

            <table>
              <tr class="border-top-bottom">
                <td width="20%">Booking No.:</td>
                <td width="25%"><span class="bold">${data.bookingNumber || 'N/A'}</span></td>
                <td width="15%">Sales Date</td>
                <td width="40%"><span class="bold">${currentDate}</span></td>
              </tr>
              <tr>
                <td>${data.bookingType === 'SUBDEALER' ? 'Subdealer Name' : 'Name'}</td>
                <td>:</td>
                <td colspan="2"><span class="bold">${displayName}</span></td>
              </tr>
              <tr>
                <td>${data.bookingType === 'SUBDEALER' ? 'Subdealer Address' : 'Address'}</td>
                <td>:</td>
                <td colspan="2"><span class="bold">${displayAddress}</span></td>
              </tr>
              <tr>
                <td>S.E Name</td>
                <td>:</td>
                <td colspan="2"><span class="bold">${data.salesExecutive?.name || ''}</span></td>
              </tr>
              <tr>
                <td>Model</td>
                <td>:</td>
                <td><span class="bold">${data.model.model_name || ''}</span></td>
                <td>Colour : <span class="bold">${data.color?.name || 'N/A'}</span></td>
              </tr>
              <tr>
                <td>Chasis No</td>
                <td>:</td>
                <td><span class="bold">${data.chassisNumber || ''}</span></td>
                <td>Key No. : <span class="bold">${data.keyNumber || '0'}</span></td>
              </tr>
              <tr>
                <td>Engine No</td>
                <td>:</td>
                <td><span class="bold">${data.engineNumber}</span></td>
                <td></td>
              </tr>
              <tr>
                <td>Financer</td>
                <td>:</td>
                <td colspan="2"><span class="bold">${data.payment.financer?.name || ''}</span></td>
              </tr>
              <tr>
                <td>Total</td>
                <td>:</td>
                <td><span class="bold">₹${data.totalAmount}</span></td>
                <td>Grand Total: <span class="bold">₹${data.discountedAmount}</span></td>
              </tr>
            </table>

            <div class='account-details'>ACC.DETAILS:
             ${data.accessories
               .map((accessory) => (accessory.accessory ? accessory.accessory.name : ''))
               .filter((name) => name)
               .join(', ')}
            </div>
            <div class="signature-box">
              <div><b>Authorised Signature</b></div>
            </div>

            <p class="bold">Customer Declarations:</p>
            <p class="declaration">
              ${generateDeclarationHTML()}
            </p>

            <div>
              <p class="bold">Customer Signature</p>
            </div>

            <p class="jurisdiction">Subject To Sangamner Jurisdiction</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateHelmetDeclarationHTML = (data) => {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Helmet Declaration</title>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .declaration-wrapper {
            width: 210mm;
            margin: 20px 0;
        }
        .declaration-body {
            font-family: 'Arial Unicode MS', 'Shivaji01', 'Shivaji02', sans-serif;
            margin: 15mm;
            padding: 0;
            font-size: 12pt;
            line-height: 1.4;
        }
        @page {
            size: A4;
            margin: 0;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 18pt;
            margin-bottom: 10mm;
        }
        .content {
            margin-bottom: 5mm;
            text-align:center;
        }
        .customer-info {
            margin-bottom: 10mm;
        }
        .customer-info-row {
            margin-bottom: 2mm;
        }
        .bold {
            font-weight: bold;
        }
        .signature {
            margin-top: 15mm;
            display:flex;
            justify-content:space-between;
        }
        .jurisdiction {
            text-align: center;
            margin-top: 10mm;
            font-weight: bold;
        }
        .vehicle-details {
            margin: 5mm 0;
        }
        .declaration {
            margin-top: 10mm;
            text-align: justify;
        }
        .divider {
            border-top: 2px solid #AAAAAA;
            margin: 1mm 0;
        }
        @media print {
            html, body {
                background: none;
                display: block;
            }
            .declaration-wrapper {
                box-shadow: none;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="declaration-wrapper">
        <div class="declaration-body">
            <div class="header">
                हेल्मेट प्राप्ती घोषणापत्र
            </div>

            <div class="content">
                केंद्रीय मोटर वाहन नियम १३८ { ४ } { फ }
            </div>
            <div class="divider"></div>
            <div class="declaration">
                <p>
                    मी..${data.customerDetails.name}, असे घोषित करतो कि

                    दि. ${formattedDate} रोजी गांधी मोटार टि व्हि यस नासिक

                    या वितरकाकडून टि व्हि यस..${data.model.model_name}, हे वाहन खरेदी केले आहे.

                    त्याचा तपशील खालील प्रमाणे...
                </p>
                <div class="vehicle-details">
                    <div class="customer-info-row"><strong>चेसिस नंबर:</strong> ${data.chassisNumber}</div>
                    <div class="customer-info-row"><strong>इंजिन नंबर:</strong> ${data.engineNumber}</div>
                </div>

                <p>
                    केंद्रीय मोटर वाहन नियम १३८ { ४ } { फ } प्रमाणे वितरकाने दुचाकी वितरीत करते वेळी विहित
                    मानाकनाचे २ (दोन) हेल्मेट पुरवणे/विकत देणे बंधनकारक आहे. त्याचप्रमाणे मला BUREAU OF INDIA STANDARS
                    UNDER THE BUREAU OF INDIA ACT-1986 { 63 TO 1986 } या प्रमाणे हेल्मेट मिळाले आहे.
                </p>
                <p>
                    मी याद्वारे जाहीर करतो/करते की वर दिलेला तपशील माझ्या संपूर्ण माहिती प्रमाणे व तपासा्रमाणे सत्य आहे.
                </p>
            </div>

            <div class="signature">
                <div>
                    स्वाक्षरी व शिक्का
                    <br>
                    गांधी मोटर्स<br>
                    नासिक
                </div>
                <div>
                    दुचाकी खरेदिदाराची स्वाक्षरी<br>
                    नाव :- ${data.customerDetails.name}
                </div>
            </div>

            <div class="jurisdiction">
                Subject To Nashik Jurisdiction
            </div>
        </div>
    </div>
</body>
</html>
    `;
  };

  return (
    <div className="invoice-container">
      <h4 className="mb-4">Delivery Challan</h4>

      <CNav variant="tabs">
        <CNavItem>
          <CNavLink active={activeTab === 0} onClick={() => setActiveTab(0)}>
            Customer Copy
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
            Office Copy
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
            Helmet Declaration
          </CNavLink>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane visible={activeTab === 0} className="p-3">
          <h5>Generate DC/Customer Copy</h5>
          <CInputGroup className="mb-3">
            <CInputGroupText>
              <CIcon className="icon" icon={cilCarAlt} />
            </CInputGroupText>
            <CFormInput placeholder="Enter Chassis Number" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} />
            {loading && (
              <CInputGroupText>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </CInputGroupText>
            )}
          </CInputGroup>

          {error && <div className="text-danger mb-3">{error}</div>}

          <div className="d-flex gap-2">
            <CButton color="primary" onClick={handlePrint} disabled={!bookingData || loading}>
              <CIcon icon={cilPrint} className="me-2" />
              Print
            </CButton>
            <CButton color="secondary" onClick={handleClear}>
              <CIcon icon={cilReload} className="me-2" />
              Clear
            </CButton>
          </div>
        </CTabPane>

        <CTabPane visible={activeTab === 1} className="p-3">
          <h5>Generate DC/Office Copy</h5>
          <CInputGroup className="mb-3">
            <CInputGroupText>
              <CIcon className="icon" icon={cilCarAlt} />
            </CInputGroupText>
            <CFormInput placeholder="Enter Chassis Number" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} />
            {loading && (
              <CInputGroupText>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </CInputGroupText>
            )}
          </CInputGroup>

          {error && <div className="text-danger mb-3">{error}</div>}

          <div className="d-flex gap-2">
            <CButton color="primary" onClick={handlePrint} disabled={!bookingData || loading}>
              <CIcon icon={cilPrint} className="me-2" />
              Print
            </CButton>
            <CButton color="secondary" onClick={handleClear}>
              <CIcon icon={cilReload} className="me-2" />
              Clear
            </CButton>
          </div>
        </CTabPane>

        <CTabPane visible={activeTab === 2} className="p-3">
          <h5>Helmet Declaration</h5>
          <p className="text-muted mb-3">Enter chassis number to generate helmet declaration form</p>

          <CInputGroup className="mb-3">
            <CInputGroupText>
              <CIcon className="icon" icon={cilCarAlt} />
            </CInputGroupText>
            <CFormInput placeholder="Enter Chassis Number" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} />
            {loading && (
              <CInputGroupText>
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </CInputGroupText>
            )}
          </CInputGroup>

          {error && <div className="text-danger mb-3">{error}</div>}

          <div className="d-flex gap-2">
            <CButton color="primary" onClick={handlePrint} disabled={!bookingData || loading}>
              <CIcon icon={cilPrint} className="me-2" />
              Generate & Print
            </CButton>
            <CButton color="secondary" onClick={handleClear}>
              <CIcon icon={cilReload} className="me-2" />
              Clear
            </CButton>
          </div>
        </CTabPane>
      </CTabContent>
    </div>
  );
}

export default DeliveryChallan;
