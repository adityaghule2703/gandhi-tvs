import React, { useState, useEffect } from 'react';
import '../../css/invoice.css';
import { CFormInput, CInputGroup, CInputGroupText, CButton } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCarAlt, cilPrint, cilReload } from '@coreui/icons';
import axiosInstance from '../../axiosInstance';

function DealForm() {
  const [formData, setFormData] = useState({
    chassisNumber: '',
    amount: ''
  });
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [declarations, setDeclarations] = useState([]);

  useEffect(() => {
    const fetchDeclarations = async () => {
      try {
        const response = await axiosInstance.get('/declarations?formType=deal_form');
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
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const fetchInvoiceDetails = async (chassisNumber) => {
    if (!chassisNumber) {
      setError('Please enter a chassis number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get(`bookings/chassis/${chassisNumber}`);
      if (response.data.success) {
        setInvoiceData(response.data.data);
      } else {
        setError('No booking found for this chassis number');
        setInvoiceData(null);
      }
    } catch (err) {
      setError('Failed to fetch invoice details');
      setInvoiceData(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'chassisNumber') {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      setTypingTimeout(
        setTimeout(() => {
          if (value.trim().length > 0) {
            fetchInvoiceDetails(value);
          } else {
            setInvoiceData(null);
            setError('');
          }
        }, 500)
      );
    }
  };

  const handleClear = () => {
    setFormData({ chassisNumber: '', amount: '' });
    setInvoiceData(null);
    setError('');
  };

  const generateDeclarationHTML = () => {
    if (declarations.length === 0) {
      return `
        Declaration- I/We Authorize the Dealer to register the vehicle at RTO in my/our name .2) Getting the vehicle insured from insurance company is my entire responsibility & there will be no liability on dealer for any loss. 3) Getting the vehicle registered from RTO is solely my responsibility & exclusively I/we shall/will be responsible for any loss/penalty/legal charge from RTO/Police for not getting the vehicle registered or for delayed registration. 4) Registration Number allotted by RTO will be acceptable to me else I will pre book for choice number at RTO at my own. Dealership has no role in RTO Number allocation 5) I had been informed & understood the T&C about warranty policy as laid by TVS MOTOR CO. LTD & I agree to abide the same 6) I/We agree that the price at the time of delivery will be applicable. 7) I am being informed about the price breakup, I had understood & agreed upon the same & then had booked the vehicle 8)I am bound to pay an interest @24% p.a. as penalty if payment is delayed for more than 5 days from the date of booking. 9) Subject to sanguimer Jurisdication. I accept that vehicle once sold by dealer shall not be taken back /replaced for any reason.
      `;
    }

    return declarations.map((declaration) => `${declaration.priority}) ${declaration.content}`).join('. ');
  };

  const generateInvoiceHTML = (data) => {
    const exchangeBrokerName = data.exchange ? data.exchangeDetails?.broker?.name || '' : '';
    const exchangeVehicleNumber = data.exchange ? data.exchangeDetails?.vehicleNumber || '' : '';
    const currentDate = new Date().toLocaleDateString('en-GB');
    const dob = data.customerDetails.dob ? new Date(data.customerDetails.dob).toLocaleDateString('en-GB') : 'N/A';

    const filteredPriceComponents = data.priceComponents.filter((comp) => {
      const headerKey = comp.header.header_key.toUpperCase();

      const isInsurance = /INSURANCE|INSURCANCE|INSUR|COVER|PREMIUM|INSURANCE CHARGES	/i.test(headerKey);
      const isRTO = /RTO|ROAD TAX|RTO TAX & REGISTRATION CHARGES/i.test(headerKey);
      const isHypothecation = /HYPOTHECATION|HPA|HP CHARGES|HPA (if applicable)|HYPOTHECATION CHARGES (IF APPLICABLE)/i.test(headerKey);

      return !(isInsurance || isRTO || isHypothecation);
    });

    const priceComponentsWithGST = filteredPriceComponents.map((component) => {
      const gstRatePercentage = parseFloat(component.header.metadata.gst_rate) || 0;

      const unitCost = component.originalValue;
      const discount = component.discountedValue < component.originalValue ? component.originalValue - component.discountedValue : 0;
      const lineTotal = component.discountedValue;

      const taxableValue = (lineTotal * 100) / (100 + gstRatePercentage);

      const totalGST = lineTotal - taxableValue;
      const cgstAmount = totalGST / 2;
      const sgstAmount = totalGST / 2;
      const gstAmount = cgstAmount + sgstAmount;

      return {
        ...component,
        unitCost,
        taxableValue,
        cgstAmount,
        sgstAmount,
        gstAmount,
        gstRatePercentage: gstRatePercentage,
        discount,
        lineTotal
      };
    });

    const findComponentByKeywords = (keywords) => {
      return data.priceComponents.find((comp) => {
        const headerKey = comp.header.header_key.toUpperCase();
        return keywords.some((keyword) => headerKey.includes(keyword));
      });
    };

    const insuranceComponent = findComponentByKeywords([
      'INSURANCE',
      'INSURCANCE',
      'INSURANCE CHARGES',
      'INSURANCE 4+1 INCLUSIVE OF ADDITIONAL COVERS'
    ]);
    const insuranceCharges = insuranceComponent ? insuranceComponent.originalValue : 0;

    const rtoComponent = findComponentByKeywords(['RTO', 'RTO TAX & REGISTRATION CHARGES']);
    const rtoCharges = rtoComponent ? rtoComponent.originalValue : 0;

    const hpComponent = findComponentByKeywords(['HYPOTHECATION', 'HPA', 'HPA (if applicable)']);
    const hpCharges = hpComponent ? hpComponent.originalValue : data.hypothecationCharges || 0;

    const totalA = priceComponentsWithGST.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalB = insuranceCharges + rtoCharges + hpCharges;
    const grandTotal = totalA + totalB;

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Deal Form</title>
  <style>
    @page {
      margin: 10mm;
      size: A4;
      
      @bottom-left {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 10pt;
        font-family: "Courier New", Courier, monospace;
      }

      @bottom-right {
        content: "GANDHI MOTORS PVT LTD";
        font-size: 10pt;
        font-family: "Courier New", Courier, monospace;
      }
    }
    
    body {
      font-family: "Courier New", Courier, monospace;
      margin: 0;
      padding: 0;
      font-size: 14px;
      color: #555555;
      counter-reset: page;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 10mm;
      box-sizing: border-box;
      position: relative;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2mm;
    }
    
    .header-left {
      width: 70%;
    }
    
    .header-right {
      width: 30%;
      text-align: right;
    }
    
    .logo {
      height: 50px;
      margin-bottom: 2mm;
    }
    
    .dealer-info {
      text-align: left;
      font-size: 14px;
      line-height: 1.2;
    }
    
    .rto-type {
      text-align: left;
      margin: 1mm 0;
      font-weight: bold;
    }
    
    .customer-info-container {
      display: flex;
      font-size: 14px;
    }

    .customer-info-left {
      width: 50%;
    }
    
    .customer-info-right {
      width: 50%;
    }
    
    .customer-info-row {
      margin: 1mm 0;
      line-height: 1.2;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin: 2mm 0;
    }
    
    th, td {
      padding: 1mm;
      border: 1px solid #000;
      vertical-align: top;
    }
    
    .no-border {
      border: none !important;
      font-size: 14px;
    }
    
    .text-right { 
      text-align: right; 
    }
    
    .text-center { 
      text-align: center; 
    }
    
    .bold {
      font-weight: bold;
    }
    
    .section-title {
      font-weight: bold;
      margin: 1mm 0;
    }
    
    .signature-box {
      margin-top: 10mm;
      font-size: 9pt;
      width: 100%;
      page-break-inside: avoid;
    }
    
    .signature-line {
      border-top: 1px dashed #000;
      width: 40mm;
      display: inline-block;
      margin: 0 5mm;
    }
    
    .footer {
      font-size: 8pt;
      text-align: justify;
      line-height: 1.2;
      margin-top: 3mm;
      page-break-inside: avoid;
    }
    
    .divider {
      border-top: 2px solid #AAAAAA;
    }
    
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2mm 0;
    }
    
    .totals-table td {
      border: none;
      padding: 1mm;
    }
    
    .total-divider {
      border-top: 2px solid #AAAAAA;
      height: 1px;
      margin: 2px 0;
    }
    
    .broker-info {
      display: flex;
      justify-content: space-between;
      padding: 1px;
    }
    
    .note {
      padding: 1px;
      margin: 2px;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    .declaration-container {
      page-break-inside: avoid;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      
      .page {
        page-break-after: always;
      }
      
      .signature-box {
        position: fixed;
        bottom: -1mm;
        width: 180mm;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header Section -->
    <div class="header">
      <div class="header-left">
        <h2 style="margin:3;font-size:15pt;">GANDHI MOTORS PVT LTD</h2>
        <div class="dealer-info">
          Authorized Main Dealer: TVS Motor Company Ltd.<br>
          Registered office: 'JOGPREET' Asher Estate, Near Ichhamani Lawns,<br>
          Upnagar, Nashik Road, Nashik, 7498993672<br>
          GSTIN: ${data.branch?.gst_number || ''}<br>
          GANDHI TVS PIMPALGAON
        </div>
      </div>
      <div class="header-right">
        <img src="https://c.ndtvimg.com/2025-01/t7f4o1kg_tvs_625x300_17_January_25.jpg?im=FaceCrop,algorithm=dnn,width=545,height=307" class="logo" alt="TVS Logo">
        <div>Date: ${currentDate}</div>
         ${
           data.bookingType === 'SUBDEALER'
             ? `<div><b>Subdealer:</b> ${data.subdealer?.name || ''}</div>
        <div><b>Address:</b> ${data.subdealer?.location || ''}</div>`
             : ''
         }
        
      </div>
    </div>
    <div class="divider"></div>
    <div class="rto-type">RTO TYPE: ${data.rto}</div>
    <div class="divider"></div>

    <!-- Customer Information -->
    <div class="customer-info-container">
      <div class="customer-info-left">
        <div class="customer-info-row"><strong>Invoice Number:</strong> ${data.bookingNumber}</div>
        <div class="customer-info-row"><strong>Customer Name:</strong> ${data.customerDetails.name}</div>
        <div class="customer-info-row"><strong>Address:</strong> ${data.customerDetails.address}, ${data.customerDetails.taluka}</div>
        <div class="customer-info-row"><strong>Taluka:</strong> ${data.customerDetails.taluka}</div>
        <div class="customer-info-row"><strong>Mobile No.:</strong> ${data.customerDetails.mobile1}</div>
         <div class="customer-info-row"><strong>Exchange Mode:</strong> ${data.exchange ? 'YES' : 'NO'}</div>
          <div class="customer-info-row"><strong>Aadhar No.:</strong> ${data.customerDetails.aadharNumber}</div>
          <div class="customer-info-row"><strong>HPA:</strong> ${data.hpa ? 'YES' : 'NO'}</div>
      </div>
      <div class="customer-info-right">
        <div class="customer-info-row"><strong>GSTIN:</strong> ${data.gstin || ' '}</div>
       <div class="customer-info-row"><strong>District:</strong> ${data.customerDetails.district || 'N/A'}</div>
        <div class="customer-info-row"><strong>Pincode:</strong> ${data.customerDetails.pincode || 'N/A'}</div>
        <div class="customer-info-row"><strong>D.O.B:</strong> ${dob}</div>
        <div class="customer-info-row"><strong>Payment Mode:</strong> ${data.payment?.type || 'CASH'}</div>
         <div class="customer-info-row"><strong>Financer:</strong> ${data.payment?.financer?.name || ''}</div>
        <div class="customer-info-row"><strong>Sales Representative Name:</strong> ${data.salesExecutive?.name || 'N/A'}</div>
      </div>
    </div>
    <div class="divider"></div>

    <!-- Purchase Details -->
    <div class="section-title">Purchase Details:</div>
    <table class="no-border">
      <tr>
        <td class="no-border" style="width:50%"><strong>Model Name:</strong> ${data.model.model_name}</td>
         <td class="no-border"><strong>Battery No:</strong> ${data.batteryNumber || '000'}</td>
      </tr>
      <tr>
        <td class="no-border"><strong>Chasis No:</strong> ${data.chassisNumber}</td>
        <td class="no-border"><strong>Colour:</strong> ${data.color.name}</td>
      </tr>
       <tr>
        <td class="no-border"><strong>Engine No:</strong> ${data.engineNumber}</td>
        <td class="no-border"><strong>Key No.:</strong> ${data.keyNumber || '000'}</td>
      </tr>
    </table>
    
    <!-- Price Breakdown Table -->
    <table>
      <tr>
        <th style="width:25%">Particulars</th>
        <th style="width:8%">HSN CODE</th>
        <th style="width:8%">Unit Cost</th>
        <th style="width:8%">Taxable</th>
        <th style="width:5%">CGST</th>
        <th style="width:8%">CGST AMOUNT</th>
        <th style="width:5%">SGST</th>
        <th style="width:8%">SGST AMOUNT</th>
        <th style="width:7%">DISCOUNT</th>
        <th style="width:10%">LINE TOTAL</th>
      </tr>

      ${priceComponentsWithGST
        .map(
          (component) => `
        <tr>
          <td>${component.header.header_key}</td>
          <td>${component.header.metadata.hsn_code}</td>
          <td class="text-right">${component.originalValue.toFixed(2)}</td>
          <td class="text-right">${component.taxableValue.toFixed(2)}</td>
          <td >${(component.gstRatePercentage / 2).toFixed(2)}%</td>
           <td >${component.cgstAmount.toFixed(2)}</td>
          <td >${(component.gstRatePercentage / 2).toFixed(2)}%</td>
           <td >${component.sgstAmount.toFixed(2)}</td>
          <td class="text-right">${component.discount.toFixed(2)}</td>
          <td class="text-right">${component.lineTotal.toFixed(2)}</td>
        </tr>
      `
        )
        .join('')}
    </table>

    <!-- Totals Section - No Borders -->
     <table class="totals-table">
      <tr>
        <td class="no-border" style="width:80%"><strong>Total(A)</strong></td>
        <td class="no-border text-right"><strong>${totalA.toFixed(2)}</strong></td>
      </tr>
      <tr>
        <td colspan="2" class="no-border"><div class="total-divider"></div></td>
      </tr>
      <tr>
        <td class="no-border"><strong>INSURANCE CHARGES</strong></td>
        <td class="no-border text-right"><strong>${insuranceCharges.toFixed(2)}</strong></td>
      </tr>
      <tr>
        <td class="no-border"><strong>RTO TAX,REGISTRATION SMART CARD CHARGES AGENT FEES</strong></td>
        <td class="no-border text-right"><strong>${rtoCharges.toFixed(2)}</strong></td>
      </tr>
      <tr>
        <td class="no-border"><strong>HP CHARGES</strong></td>
        <td class="no-border text-right"><strong>${hpCharges.toFixed(2)}</strong></td>
      </tr>
      <tr>
        <td colspan="2" class="no-border"><div class="total-divider"></div></td>
      </tr>
      <tr>
        <td class="no-border"><strong>TOTAL(B)</strong></td>
        <td class="no-border text-right"><strong>${totalB.toFixed(2)}</strong></td>
      </tr>
      <tr>
        <td class="no-border"><strong>GRAND TOTAL(A) + (B)</strong></td>
        <td class="no-border text-right"><strong>${grandTotal.toFixed(2)}</strong></td>
      </tr>
    </table>
    
    <div class="broker-info">
      <div><strong>Ex. Broker/ Sub Dealer:</strong>${exchangeBrokerName}</div>
      <div><strong>Ex. Veh No:</strong>${exchangeVehicleNumber}</div>
    </div>
    
    <div class="note"><strong>Notes:</strong></div>
    <div class="divider"></div>
    
    <div style="margin-top:2mm;">
      <div><strong>ACC.DETAILS: </strong>
        ${data.accessories
          .map((accessory) => (accessory.accessory ? accessory.accessory.name : ''))
          .filter((name) => name)
          .join(', ')}
      </div>
    </div>
    
    <div class="divider"></div>

    <!-- Footer Declarations -->
    <div class="footer declaration-container">
      <p><strong>DECLARATIONS:</strong> ${generateDeclarationHTML()}</p>
    </div>

    <!-- Signature Section - Fixed position for printing -->
    <div class="signature-box">
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
        <div style="text-align:center; width: 22%;">
          <div class="signature-line"></div>
          <div>Customer's Signature</div>
        </div>
        <div style="text-align:center; width: 22%;">
          <div class="signature-line"></div>
          <div>Sales Executive</div>
        </div>
        <div style="text-align:center; width: 22%;">
          <div class="signature-line"></div>
          <div>Manager</div>
        </div>
        <div style="text-align:center; width: 22%;">
          <div class="signature-line"></div>
          <div>Accountant</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
  };
  const handlePrint = () => {
    if (!invoiceData) {
      setError('Please fetch invoice details first');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateInvoiceHTML(invoiceData));
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div className="invoice-container">
      <h4 className="mb-4">Deal Form</h4>

      <div className="p-3">
        <h5>Customer Deal Form</h5>
        <CInputGroup className="mb-3">
          <CInputGroupText>
            <CIcon className="icon" icon={cilCarAlt} />
          </CInputGroupText>
          <CFormInput
            placeholder="Enter Chassis Number"
            name="chassisNumber"
            value={formData.chassisNumber}
            onChange={handleChange}
            disabled={loading}
          />
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
          <CButton color="primary" onClick={handlePrint} disabled={!invoiceData || loading}>
            <CIcon icon={cilPrint} className="me-2" />
            Print
          </CButton>
          <CButton color="secondary" onClick={handleClear} disabled={loading}>
            <CIcon icon={cilReload} className="me-2" />
            Clear
          </CButton>
        </div>
      </div>
    </div>
  );
}
export default DealForm;
