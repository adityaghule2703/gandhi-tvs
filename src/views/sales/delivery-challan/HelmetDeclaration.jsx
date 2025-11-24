import React from 'react';

const HelmetDeclaration = ({ data }) => {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  return (
    <div className="declaration-wrapper">
      <div className="declaration-body">
        <div className="header">हेल्मेट प्राप्ती घोषणापत्र</div>

        <div className="content">केंद्रीय मोटर वाहन नियम १३८ ( ४ ) {फ}</div>
        <div className="divider"></div>
        <div className="declaration">
          <p>
            मी..${data.customerDetails.name}, असे घोषित करतो कि दि. ${formattedDate} रोजी गांधी मोटार टि व्हि यस नासिक या वितरकाकडून टि व्हि
            यस..${data.model.model_name}, हे वाहन खरेदी केले आहे. त्याचा तपशील खालील प्रमाणे...
          </p>
          <div className="vehicle-details">
            <div className="customer-info-row">
              <strong>चेसिस नंबर:</strong> {data.chassisNumber}
            </div>
            <div className="customer-info-row">
              <strong>इंजिन नंबर:</strong> {data.engineNumber}
            </div>
          </div>

          <p>
            केंद्रीय मोटर वाहन नियम १३८ ( ४ ) ( फ ) प्रमाणे वितरकाने दुचाकी वितरीत करते वेळी विहित मानाकनाचे २ (दोन) हेल्मेट पुरवणे/विकत
            देणे बंधनकारक आहे. त्याचप्रमाणे मला BUREAU OF INDIA STANDARS UNDER THE BUREAU OF INDIA ACT-1986 ( 63 TO 1986 ) या प्रमाणे
            हेल्मेट मिळाले आहे.
          </p>
          <p>मी याद्वारे जाहीर करतो/करते की वर दिलेला तपशील माझ्या संपूर्ण माहिती प्रमाणे व तपासा्रमाणे सत्य आहे.</p>
        </div>

        <div className="signature">
          <div>
            स्वाक्षरी व शिक्का
            <br />
            गांधी मोटर्स
            <br />
            नासिक
          </div>
          <div>
            दुचाकी खरेदिदाराची स्वाक्षरी
            <br />
            नाव :- {data.customerDetails.name}
          </div>
        </div>

        <div className="jurisdiction">Subject To Nashik Jurisdiction</div>
      </div>
    </div>
  );
};

export const generateHelmetDeclarationHTML = (data) => {
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
      ${ReactDOMServer.renderToString(<HelmetDeclaration data={data} />)}
    </body>
    </html>
  `;
};
