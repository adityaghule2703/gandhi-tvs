import React from 'react'
import tvsLogo from '../../assets/images/logo.png'

const CustomerCopy = ({ data, copyType }) => {
  const currentDate = new Date().toLocaleDateString('en-GB')

  return (
    <div className="page">
      <div className="header-container">
        <img src={tvsLogo} className="logo" alt="TVS Logo" />
        <div className="header-text"> Sale / Delivery challan</div>
      </div>

      <table>
        <tr className="border-top-bottom">
          <td width="20%">Booking No.:</td>
          <td width="25%">
            <span className="bold">{data.bookingNumber || 'N/A'}</span>
          </td>
          <td width="15%">Sales Date</td>
          <td width="40%">
            <span className="bold">{currentDate}</span>
          </td>
        </tr>
        <tr className="data-row">
          <td>Name</td>
          <td>:</td>
          <td>
            <span className="bold">{data.customerDetails.name}</span>
          </td>
        </tr>
        <tr className="data-row">
          <td>Address</td>
          <td>:</td>
          <td colspan="2">
            <span className="bold">
              {data.customerDetails.address}, {data.customerDetails.taluka},{' '}
              {data.customerDetails.district}
            </span>
          </td>
        </tr>
        <tr className="data-row">
          <td>S.E Name</td>
          <td>:</td>
          <td colspan="2">
            <span className="bold">{data.salesExecutive?.name || 'N/A'}</span>
          </td>
        </tr>
        <tr className="data-row">
          <td>Model</td>
          <td>:</td>
          <td>
            <span className="bold">{data.model.model_name}</span>
          </td>
          <td>
            Colour : <span className="bold">{data.color.name}</span>
          </td>
        </tr>
        <tr className="data-row">
          <td>Chasis No</td>
          <td>:</td>
          <td>
            <span className="bold">{data.chassisNumber}</span>
          </td>
          <td>
            Key No. : <span className="bold">{data.keyNumber || '0'}</span>
          </td>
        </tr>
        <tr className="data-row">
          <td>Engine No</td>
          <td>:</td>
          <td>
            <span className="bold">{data.engineNumber}</span>
          </td>
          <td></td>
        </tr>
        <tr className="data-row">
          <td>Financer</td>
          <td>:</td>
          <td colspan="2">
            <span className="bold">{data.payment.financer.name}</span>
          </td>
        </tr>
        <tr className="data-row">
          <td>Total</td>
          <td>:</td>
          <td>
            <span className="bold">₹{data.totalAmount}</span>
          </td>
          <td>
            Grand Total : <span className="bold">₹{data.discountedAmount}</span>
          </td>
        </tr>
      </table>
      <div className="account-details">ACC.DETAILS:</div>
      <div className="signature-box">
        <div>
          <b>Authorised Signature</b>
        </div>
      </div>

      <p className="bold">Customer Declarations:</p>
      <p className="declaration">
        I/We Authorized the dealer or its representative to register the vehicle at RTO In my/Our
        name as booked by us, However getting the vehicle insured from Insurance company & getting
        the vehicle registered from RTO is entirely my/our sole responsibility. Registration Number
        allotted by RTO will be acceptable to me else I will pre book for choice number at RTO at my
        own. Dealership has no role in RTO Number allocation I/We am/are exclusively responsible for
        any loss/penalty/Legal action- occurred due to non-compliance of /Delay in Insurance or RTO
        registration. I have understood and accepted all T & C about warranty as per the Warranty
        policy of TVS MOTOR COMPANY Ltd & agree to abide the same. I have also understood & accepted
        that the warranty for Tyres & Battery Lies with concerned Manufacturer or its dealer & I
        will not claim for warranty of these products to TVS MOTOR COMPANY or to Its Dealer I am
        being informed about the price breakup, I had understood & agreed upon the same & then had
        booked the vehicle, I am bound to pay penal interest @ 24% P.A. on delayed payment. I accept
        that vehicle once sold by dealer shall not be taken back /replaced for any reason.
      </p>

      <div>
        <p className="bold">Customer Signature</p>
      </div>

      <p className="jurisdiction">Subject To Sangamner Jurisdiction</p>

      {/* Office Copy */}
      <div style={{ pageBreakBefore: 'always', marginTop: '10mm' }}>
        <div className="copy-title">Sale / Delivery challan</div>

        <table>
          <tr className="border-top-bottom">
            <td width="20%">Booking No.:</td>
            <td width="25%">
              <span className="bold">{data.bookingNumber || 'N/A'}</span>
            </td>
            <td width="15%">Sales Date</td>
            <td width="40%">
              <span className="bold">{currentDate}</span>
            </td>
          </tr>
          <tr>
            <td>Name</td>
            <td>:</td>
            <td colspan="2">
              <span className="bold">{data.customerDetails.name}</span>
            </td>
          </tr>
          <tr>
            <td>Address</td>
            <td>:</td>
            <td colspan="2">
              <span className="bold">
                {data.customerDetails.address}, {data.customerDetails.taluka},{' '}
                {data.customerDetails.district}
              </span>
            </td>
          </tr>
          <tr>
            <td>S.E Name</td>
            <td>:</td>
            <td colspan="2">
              <span className="bold">{data.salesExecutive?.name || 'N/A'}</span>
            </td>
          </tr>
          <tr>
            <td>Model</td>
            <td>:</td>
            <td>
              <span className="bold">{data.model.model_name}</span>
            </td>
            <td>
              Colour : <span className="bold">{data.color.name}</span>
            </td>
          </tr>
          <tr>
            <td>Chasis No</td>
            <td>:</td>
            <td>
              <span className="bold">{data.chassisNumber}</span>
            </td>
            <td>
              Key No. : <span className="bold">{data.keyNumber || '0'}</span>
            </td>
          </tr>
          <tr>
            <td>Engine No</td>
            <td>:</td>
            <td>
              <span className="bold">{data.engineNumber}</span>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>Financer</td>
            <td>:</td>
            <td colspan="2">
              <span className="bold">{data.payment.financer.name}</span>
            </td>
          </tr>
          <tr>
            <td>Total</td>
            <td>:</td>
            <td>
              <span className="bold">₹{data.totalAmount}</span>
            </td>
            <td>
              Grand Total: <span className="bold">₹{data.discountedAmount}</span>
            </td>
          </tr>
        </table>

        <div className="account-details">ACC.DETAILS:</div>
        <div className="signature-box">
          <div>
            <b>Authorised Signature</b>
          </div>
        </div>

        <p className="bold">Customer Declarations:</p>
        <p className="declaration">
          I/We Authorized the dealer or its representative to register the vehicle at RTO In my/Our
          name as booked by us, However getting the vehicle insured from Insurance company & getting
          the vehicle registered from RTO is entirely my/our sole responsibility. Registration
          Number allotted by RTO will be acceptable to me else I will pre book for choice number at
          RTO at my own. Dealership has no role in RTO Number allocation I/We am/are exclusively
          responsible for any loss/penalty/Legal action- occurred due to non-compliance of /Delay in
          Insurance or RTO registration. I have understood and accepted all T & C about warranty as
          per the Warranty policy of TVS MOTOR COMPANY Ltd & agree to abide the same. I have also
          understood & accepted that the warranty for Tyres & Battery Lies with concerned
          Manufacturer or its dealer & I will not claim for warranty of these products to TVS MOTOR
          COMPANY or to Its Dealer I am being informed about the price breakup, I had understood &
          agreed upon the same & then had booked the vehicle, I am bound to pay penal interest @ 24%
          P.A. on delayed payment. I accept that vehicle once sold by dealer shall not be taken back
          /replaced for any reason.
        </p>

        <div style={{ marginTop: '15mm' }}>
          <p className="bold">Customer Signature</p>
        </div>

        <p className="jurisdiction">Subject To Sangamner Jurisdiction</p>
      </div>
    </div>
  )
}

export const generateDeliveryChallanHTML = (data, copyType) => {
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
          text-align:right;
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
      ${ReactDOMServer.renderToString(<CustomerCopy data={data} copyType={copyType} />)}
    </body>
    </html>
  `
}
