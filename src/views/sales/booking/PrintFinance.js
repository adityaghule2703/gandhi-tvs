import React, { useState, useEffect } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CRow,
  CCol,
  CFormInput,
  CFormSelect,
  CBackdrop,
  CAlert
} from '@coreui/react';
import { showError, showSuccess, axiosInstance } from '../../../utils/tableImports';

const PrintModal = ({ show, onClose, bookingId }) => {
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [financeDisbursement, setFinanceDisbursement] = useState(0);
  const [hasDeviation, setHasDeviation] = useState('NO');

  useEffect(() => {
    if (show && bookingId) {
      fetchBookingDetails();
      setError('');
      setSuccess('');
    }
  }, [show, bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/bookings/${bookingId}`);
      const booking = response.data.data;
      setBookingData(booking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleFinanceDisbursementChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setFinanceDisbursement(value);
  };

  const calculateDownPayment = () => {
    if (!bookingData) return 0;

    const dealAmount = bookingData.discountedAmount || 0;
    const gcAmount = bookingData.payment?.gcAmount || 0;
    const exchangeAmount = bookingData?.exchangeDetails?.price || 0;

    // return dealAmount - (financeDisbursement + gcAmount);

    //return dealAmount - financeDisbursement - exchangeAmount + gcAmount;
    return (dealAmount + gcAmount) - financeDisbursement - exchangeAmount;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      const disbursementData = {
        bookingId: bookingId,
        disbursementAmount: financeDisbursement,
        downPaymentExpected: calculateDownPayment(),
        is_deviation: hasDeviation === 'YES'
      };

      console.log('Submitting disbursement data:', disbursementData);

      const response = await axiosInstance.post('/disbursements', disbursementData);
      if (response.data.success) {
        setSuccess('Disbursement details saved successfully');
        showSuccess('Disbursement details saved successfully');

        setTimeout(() => {
          handlePrintFinanceLetter();
          onClose();
        }, 1000);
      } else {
        throw new Error(response.data.message || 'Failed to save disbursement details');
      }
    } catch (error) {
      console.error('Error saving disbursement details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save disbursement details';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const dealAmount = bookingData?.discountedAmount || 0;
  const gcAmount = bookingData?.payment?.gcAmount || 0;
  const exchangeAmount = bookingData?.exchangeDetails?.price || 0;
  const downPayment = calculateDownPayment();

  const handlePrintFinanceLetter = () => {
    if (!bookingData) return;

    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString('en-GB');

    printWindow.document.write(`
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FINANCER's ASSURANCE LETTER</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background: #f5f5f5;
        }
        .page {
            width: 210mm;
            min-height: 297mm;
            margin: 10mm auto;
            padding: 15mm;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            box-sizing: border-box;
        }
        .content {
            width: 100%;
        }
        .subject {
            font-weight: bold;
            margin: 15px 0;
            text-align: left;
        }
        .salutation {
            margin: 15px 0;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .details-table, .details-table td {
            border: 1px solid black;
        }
        .details-table td {
            padding: 8px;
            vertical-align: top;
        }
        .left-col {
            width: 70%;
            font-weight: bold;
        }
        .instruction-text {
            margin: 15px 0;
            text-align: justify;
        }
        .signature-block {
            margin-top: 40px;
        }
        .signature-line {
            border-top: 1px solid black;
            width: 70%;
            margin-top: 40px;
            padding-top: 5px;
        }
         .signature-box {
  width: 25%;
  border-top: 1px dashed black;
  margin-top: 5px;
  margin-left: auto;
  padding: 1px 0;
  text-align: right;
  color: #555555;
  font-weight: bold;
}
        @media print {
            body {
                background: white;
            }
            .page {
                box-shadow: none;
                margin: 0;
                padding: 0;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="content">
            <div style="text-align: right;">Date: <strong>${today}</strong></div>
            
            <div class="salutation">
                To,<br>
                The Director/Manager,<br>
                Gandhi Motors Pvt Ltd,<br>
                Nasik
            </div>
            
            <div class="subject">
                Sub:- Delivery Order & Disbursement Assurance letter.
            </div>
            
            <div class="salutation">
                Dear sir,
            </div>
            
            <div>
                We have sanctioned a loan for purchase of a two-wheeler to our below mentioned customer:
            </div>
            
            <div style="margin: 15px 0;">
                Name : Mr./Mrs. : ${bookingData.customerDetails?.name || ''}
            </div>
            
            <div style="margin: 15px 0;">
                Vehicle make & model :<b> ${bookingData.model?.model_name || ''}</b> &nbsp;&nbsp;&nbsp;
                Booking Number: ${bookingData.bookingNumber}
            </div>
            
            <table class="details-table">
                <tr>
                    <td class="left-col">Total Deal Amount including On road price + Accessories + Addons</td>
                    <td>${dealAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td class="left-col">Disbursement Amount assured by finance company</td>
                    <td>${financeDisbursement.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td class="left-col">Finance Charges</td>
                    <td>${gcAmount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                    <td class="left-col">Net Down Payment to be taken from Customer</td>
                    <td>${downPayment.toLocaleString('en-IN')}</td>
                </tr>
            </table>
            
            <div class="instruction-text">
                The loan process for the purchase of abovesaid vehicle has been completed and the Loan amount will be disbursed to your bank account within two working days from the date of issuance of this letter.
            </div>
            
            <div class="instruction-text">
                This letter is non revokable & we promise to pay you the above-mentioned loan amount within stipulated time.
            </div>
            
            <div class="instruction-text">
                You are hereby requested to endorse our hypothecation mark on the vehicle and deliver the same to the above-mentioned customer after registering the vehicle with the respective RTO Office & give us the details of RTO registration along with the invoice, insurance & Down payment receipt.
            </div>
            
            <div class="instruction-text">
                Please do the needful.
            </div>
            
            <div class="signature-block">
                <div>For & on behalf of</div>
                <div>Financer's / Bank</div>
                <div>Name:<b>${bookingData.payment.financer.name}</b></div>
                <div style="margin-top: 15px;">Employee Name:________________________________</div>
                <div style="margin-top: 15px;">Mobile No:________________________________</div>
            </div>
             <div class="signature-box">
            <div><b>Authorised Signature</b></div>
          </div>
        </div>
    </div>
    
    <script>
        window.onload = function() {
            setTimeout(() => { window.print(); }, 500);
        };
    </script>
</body>
</html>
    `);
  };

  return (
    <>
      <CBackdrop visible={show} className="modal-backdrop" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />
      <CModal visible={show} onClose={onClose} size="lg" alignment="center">
        <CModalHeader className="text-white" style={{ backgroundColor: '#243c7c' }}>
          <CModalTitle className="text-white">Disbursement Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {error && <CAlert color="danger">{error}</CAlert>}
          {success && <CAlert color="success">{success}</CAlert>}

          <div className="booking-header mb-2 p-1 bg-light rounded">
            <h5 className="mb-0">
              Booking Number: <strong>{bookingData?.bookingNumber || ''}</strong>
            </h5>
          </div>
          <hr></hr>

          <CRow className="mb-3">
            <CCol md={6}>
              <label className="form-label">Customer Name</label>
              <CFormInput type="text" value={bookingData?.customerDetails?.name || ''} readOnly className="bg-light" />
            </CCol>
            <CCol md={6}>
              <label className="form-label">Model Name</label>
              <CFormInput type="text" value={bookingData?.model?.model_name || ''} readOnly className="bg-light" />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <label className="form-label">Deal Amount (₹)</label>
              <CFormInput type="text" value={dealAmount.toLocaleString()} readOnly className="bg-light font-weight-bold" />
            </CCol>
            <CCol md={6}>
              <label className="form-label">GC Amount (₹)</label>
              <CFormInput type="text" value={gcAmount.toLocaleString()} readOnly className="bg-light font-weight-bold" />
            </CCol>
          </CRow>

          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <label className="form-label">Exchange Amount (₹)</label>
                <CFormInput type="text" value={exchangeAmount.toLocaleString()} readOnly className="bg-light font-weight-bold" />
              </CCol>
              <CCol md={6}>
                <label className="form-label">Finance Disbursement Amount (₹)</label>
                <CFormInput
                  type="number"
                  value={financeDisbursement}
                  onChange={handleFinanceDisbursementChange}
                  placeholder="Enter finance disbursement amount"
                  disabled={loading}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <label className="form-label">Downpayment Amount (₹)</label>
                <CFormInput type="number" value={downPayment} readOnly className="bg-light font-weight-bold" />
              </CCol>
              <CCol md={6}>
                <label className="form-label">Is there a deviation?</label>
                <CFormSelect value={hasDeviation} onChange={(e) => setHasDeviation(e.target.value)} disabled={loading}>
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                </CFormSelect>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter className="d-flex justify-content-between">
          <div>
            <CButton color="primary" onClick={handleSubmit} className="me-2" disabled={loading}>
              {loading ? 'Processing...' : 'Save & Print'}
            </CButton>
          </div>
          <CButton color="secondary" onClick={onClose} disabled={loading}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default PrintModal;
