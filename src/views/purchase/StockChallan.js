import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CButton,
  CFormCheck
} from '@coreui/react';
import './challan.css';
import axiosInstance from '../../axiosInstance';
import tvsLogo from '../../assets/images/logo1.png';

const TransferChallan = ({ transferDetails, fromBranch, toBranch, vehicles }) => {
  const [modelAccessories, setModelAccessories] = useState({});
  const [declarations, setDeclarations] = useState([]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options).replace(/\//g, '-');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (vehicles?.length > 0) {
        try {
          const modelIds = [...new Set(vehicles.map((v) => v.model?._id || v.model).filter((id) => id))];
          const newModelAccessories = {};

          await Promise.all(
            modelIds.map(async (modelId) => {
              try {
                const response = await axiosInstance.get(`/accessories/model/${modelId}`);
                newModelAccessories[modelId] = response.data.data.accessories || [];
              } catch (error) {
                console.error(`Error fetching accessories for model ${modelId}:`, error);
                newModelAccessories[modelId] = [];
              }
            })
          );

          setModelAccessories(newModelAccessories);
        } catch (error) {
          console.error('Error fetching accessories:', error);
        }
      }

      try {
        const response = await axiosInstance.get('/declarations?formType=stock_transfer');
        if (response.data.status === 'success') {
          const sortedDeclarations = response.data.data.declarations.sort((a, b) => a.priority - b.priority);
          setDeclarations(sortedDeclarations);
        }
      } catch (error) {
        console.error('Error fetching declarations:', error);
      }
    };

    fetchData();
  }, [vehicles]);

  const getModelId = (vehicle) => {
    return vehicle.model?._id || vehicle.model;
  };

  const generateDeclarationHTML = () => {
    if (declarations.length === 0) {
      return `
        <b>Declaration</b> - I/We Authorised the dealer or its representative to register the vehicle at RTO in my/Our name as booked by
        us, However getting the vehicle insured from Insurance company & getting the vehicle registered from RTO is entirely my/our sole
        responsibility. Registration Number alloted by RTO will be acceptable to me as else I will pre book for choise number at RTO at
        my own. Dealership has no role in RTO Number allocation. I/We are exclusively responsible for any loss /personally/legal action
        occurred due to non-compliance or Delay in Insurance or RTO registration. I have understood and accepted all the T & C about
        warranty as per the Warranty policy of TVS MOTOR COMPANY Ltd & agree to abide the same. I have also understood & accepted that
        the warranty for Tyres & Battery lies with concerned Manufacturer or its dealer & I will not claim for warranty of these
        products to TVS MOTOR COMPANY or to its Dealer. I am being informed about the price breakup, I had understood & agreed upon the
        same & then had booked the vehicle.
      `;
    }

    return declarations
      .map(
        (declaration) => `
      <b>${declaration.title}</b> - ${declaration.content}
    `
      )
      .join('<br/><br/>');
  };

  const generateTransferChallanHTML = () => {
    const currentDate = formatDate(transferDetails?.createdAt || new Date());

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transfer Challan</title>
      <style>
         body {
            font-family: Courier New;
            margin: 0;
            padding: 0;
          }
          .page {
            width: 250mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 5mm;
            box-sizing: border-box;
          }
          .challan-header {
            margin-bottom: 10px;
            text-align: center;
          }
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .header-content h2 {
            flex: 1;
            text-align: center;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .header-logo {
            height: 25px;
            margin-left: 20px;
          }
          .header2 {
            display: flex;
            justify-content: space-between;
          }
          .dealer-name {
            font-size: 16px;
            font-weight: bold;
          }
          .challan-date {
            font-size: 14px;
          }
          .locations-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 2px 0 0 0;
            border-top: 3px solid #AAAAAA;
            border-bottom: 3px solid #AAAAAA;
          }
          .location-item {
            flex: 1;
            padding: 0 15px;
          }
          .location-label {
            font-weight: bold;
          }
          .vehicle-details-table {
            width: 100%;
            margin-bottom: 10px;
            border-collapse: collapse;
          }
          .vehicle-details-table th {
            font-weight: bold;
            text-align: center;
            padding: 4px;
          }
          .vehicle-details-table td {
            padding: 2px;
            text-align: center;
            text-transform: uppercase;
          }
          .model-accessories-container {
            margin-top: 5px;
            padding: 5px;
            background: #f8f9fa;
            border-radius: 5px;
          }
          .print-checkbox-container {
            display: flex;
            align-items: center;
            margin: 2px 0;
          }
          .print-checkbox {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            border: 1px solid #333;
            border-radius: 3px;
            margin-right: 6px;
            position: relative;
            cursor: pointer;
          }
          .accessories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
          }
          .notes-section {
            margin-bottom: 20px;
            padding-top: 15px;
            border-top: 3px solid #AAAAAA;
          }
          .notes-text {
            font-size: 12px;
            line-height: 1.4;
          }
          .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .signatures-section {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            padding-top: 20px;
          }
          .signature-line {
            border-top: 1px dashed #000;
            width: 45%;
            padding-top: 10px;
            text-align: center;
          }
          .signature-line p {
            font-weight: bold;
            margin: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
          .print-checkbox-container {
            display: flex;
            align-items: center;
            margin: 2px 0;
          }
          .print-checkbox {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            border: 1px solid #333;
            border-radius: 3px;
            margin-right: 6px;
            position: relative;
            cursor: pointer;
          }
          .print-checkbox:checked::before {
            content: "✓";
            position: absolute;
            font-size: 12px;
            color: #333;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          .print-checkbox-label {
            font-size: 12px;
          }
          .print-accessories-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            padding: 5px;
          }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="challan-header">
            <div class="header-content">
              <h2>SALES / DELIVERY CHALLAN</h2>
              <img src="${tvsLogo}" class="header-logo" alt="TVS Logo" />
            </div>
          </div>
          <div class="header2">
            <p class="dealer-name">Authorized Main Dealer: TVS Motor Company Ltd.</p>
            <p class="challan-date">Date: ${currentDate}</p>
          </div>
          <div class="locations-container">
            <div class="location-item">
              <p>
                <span class="location-label">Load Location:</span>
                ${fromBranch?.name || 'N/A'}
              </p>
            </div>
            <div class="location-item">
              <p>
                <span class="location-label">Unload Location:</span>
                ${toBranch?.name || 'N/A'}
              </p>
            </div>
          </div>
        <div class="vehicle-section">
          <table class="vehicle-details-table">
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Colour</th>
                <th>Key NO</th>
                <th>Chassis NO</th>
                <th>Engine NO</th>
                <th>Motor NO</th>
                <th>Battery NO</th>
              </tr>
            </thead>
            <tbody>
              ${vehicles
                .map((vehicle, index) => {
                  const modelId = getModelId(vehicle);
                  const vehicleAccessories = modelId ? modelAccessories[modelId] || [] : [];

                  return `
                  <tr>
                    <td><strong>${vehicle.modelName || 'N/A'}</strong></td>
                    <td>${vehicle.color?.name || 'N/A'}</td>
                    <td>${vehicle.keyNumber || '0'}</td>
                    <td>${vehicle.chassisNumber || 'N/A'}</td>
                    <td>${vehicle.engineNumber || 'N/A'}</td>
                    <td>${vehicle.motorNumber || 'N/A'}</td>
                    <td>${vehicle.batteryNumber || 'N/A'}</td>
                  </tr>
                  ${
                    vehicleAccessories.length > 0
                      ? `
                    <tr>
                      <td colspan="7">
                        <div class="print-accessories-grid">
                          ${vehicleAccessories
                            .map(
                              (acc) => `
                            <div class="print-checkbox-container">
                              <input type="checkbox" class="print-checkbox" id="print-acc-${modelId}-${acc._id}">
                              <label class="print-checkbox-label" for="print-acc-${modelId}-${acc._id}">
                                ${acc.name}
                              </label>
                            </div>
                          `
                            )
                            .join('')}
                        </div>
                      </td>
                    </tr>
                  `
                      : ''
                  }
                `;
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="notes-section">
          <p class="section-title">Notes:</p>
          <p class="notes-text">
            ${generateDeclarationHTML()}
          </p>
        </div>

        <div class="signatures-section">
          <div class="signature-line">
            <p>Transporter's Signature</p>
          </div>
          <div class="signature-line">
            <p>Receiver's Signature</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  };

  const generateDeclarationPreview = () => {
    if (declarations.length === 0) {
      return (
        <p className="notes-text">
          <b>Declaration</b> - I/We Authorised the dealer or its representative to register the vehicle at RTO in my/Our name as booked by
          us, However getting the vehicle insured from Insurance company & getting the vehicle registered from RTO is entirely my/our sole
          responsibility. Registration Number alloted by RTO will be acceptable to me as else I will pre book for choise number at RTO at my
          own. Dealership has no role in RTO Number allocation. I/We are exclusively responsible for any loss /personally/legal action
          occurred due to non-compliance or Delay in Insurance or RTO registration. I have understood and accepted all the T & C about
          warranty as per the Warranty policy of TVS MOTOR COMPANY Ltd & agree to abide the same. I have also understood & accepted that the
          warranty for Tyres & Battery lies with concerned Manufacturer or its dealer & I will not claim for warranty of these products to
          TVS MOTOR COMPANY or to its Dealer. I am being informed about the price breakup, I had understood & agreed upon the same & then
          had booked the vehicle.
        </p>
      );
    }

    // return declarations.map((declaration, index) => (
    //   <p key={declaration._id} className="notes-text">
    //     <b>Declaration</b> - {declaration.content}
    //     {index < declarations.length - 1}
    //   </p>
    // ));
    return (
      <>
        <p>
          <b>Declaration:</b>
        </p>
        <div className="notes-text">
          {declarations.map((declaration, index) => (
            <p key={declaration._id}>
              {declaration.content}
              {index < declarations.length - 1}
            </p>
          ))}
        </div>
      </>
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateTransferChallanHTML());
    printWindow.document.close();
    printWindow.focus();
    // printWindow.print();
  };

  return (
    <CCard className="mb-4 challan-card">
      <CCardBody className="challan-body">
        {/* Preview content */}
        <div className="challan-header">
          <div className="header-content">
            <h2>SALES / DELIVERY CHALLAN</h2>
            <img src={tvsLogo} alt="TVS Logo" className="header-logo" />
          </div>
        </div>

        <div className="header2">
          <p className="dealer-name">Authorized Main Dealer: TVS Motor Company Ltd.</p>
          <p className="challan-date">Date: {formatDate(transferDetails?.createdAt || new Date())}</p>
        </div>
        <div className="locations-container">
          <div className="location-item">
            <p>
              <span className="location-label">Load Location:</span>
              {fromBranch?.name || 'N/A'}
            </p>
          </div>
          <div className="location-item">
            <p>
              <span className="location-label"> Unload Location:</span>
              {toBranch?.name || 'N/A'}
            </p>
          </div>
        </div>

        <div className="vehicle-section">
          <CTable className="vehicle-details-table">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Sr. No</CTableHeaderCell>
                <CTableHeaderCell>Model Name</CTableHeaderCell>
                <CTableHeaderCell>Colour</CTableHeaderCell>
                <CTableHeaderCell>Key NO</CTableHeaderCell>
                <CTableHeaderCell>Chassis NO</CTableHeaderCell>
                <CTableHeaderCell>Engine NO</CTableHeaderCell>
                <CTableHeaderCell>Motor NO</CTableHeaderCell>
                <CTableHeaderCell>Battery NO</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {vehicles.map((vehicle, index) => {
                const modelId = getModelId(vehicle);
                const vehicleAccessories = modelId ? modelAccessories[modelId] : [];

                return (
                  <React.Fragment key={vehicle._id || index}>
                    <CTableRow>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>
                        <strong>{vehicle.modelName || 'N/A'}</strong>
                      </CTableDataCell>
                      <CTableDataCell>{vehicle.color?.name || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{vehicle.keyNumber || '0'}</CTableDataCell>
                      <CTableDataCell>{vehicle.chassisNumber || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{vehicle.engineNumber || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{vehicle.motorNumber || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{vehicle.batteryNumber || 'N/A'}</CTableDataCell>
                    </CTableRow>

                    {vehicleAccessories?.length > 0 && (
                      <CTableRow>
                        <CTableDataCell colSpan="8">
                          <div className="model-accessories-container">
                            <div className="accessories-grid">
                              {vehicleAccessories.map((acc) => (
                                <div key={acc._id}>
                                  <CFormCheck id={`acc-${modelId}-${acc._id}`} label={acc.name} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </CTableBody>
          </CTable>
        </div>

        <div className="notes-section">
          <p className="section-title">Notes:</p>
          {generateDeclarationPreview()}
        </div>

        <div className="signatures-section">
          <div className="signature-line">
            <p>Transporter's Signature</p>
          </div>
          <div className="signature-line">
            <p>Receiver's Signature</p>
          </div>
        </div>

        <div className="challan-actions">
          <CButton color="primary" onClick={handlePrint}>
            Print Challan
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default TransferChallan;
