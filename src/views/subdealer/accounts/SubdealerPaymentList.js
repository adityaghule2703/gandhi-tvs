import React, { useState, useEffect } from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CFormSelect, CSpinner, CBadge } from '@coreui/react';
import './CommissionPayments.css';
import axiosInstance from 'src/axiosInstance';

const CommissionPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [subdealers, setSubdealers] = useState([]);
  const [selectedSubdealer, setSelectedSubdealer] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = [
    { value: '', label: 'All Years' },
    ...Array.from({ length: 6 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString()
    }))
  ];

  useEffect(() => {
    const fetchSubdealers = async () => {
      try {
        const response = await axiosInstance.get('/subdealers');
        setSubdealers(response.data.data.subdealers);
      } catch (err) {
        console.error('Error fetching subdealers', err);
        setError('Failed to load subdealers');
      }
    };

    fetchSubdealers();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      let url = '/commission-payments';
      const params = new URLSearchParams();

      if (selectedSubdealer) {
        params.append('subdealer_id', selectedSubdealer.id);
      }

      if (selectedMonth) {
        params.append('month', selectedMonth);
      }

      if (selectedYear) {
        params.append('year', selectedYear);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axiosInstance.get(url);
      setPayments(response.data.data.payments);
      setFilteredPayments(response.data.data.payments);
    } catch (err) {
      console.error('Error fetching payments', err);
      setError('Failed to load commission payments');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = () => {
    setShowFilterModal(true);
  };

  const handleSubdealerSelect = (event) => {
    const subdealerId = event.target.value;
    const subdealer = subdealers.find((s) => s.id === subdealerId);
    setSelectedSubdealer(subdealer || null);
  };

  const handleMonthSelect = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearSelect = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleApplyFilter = () => {
    fetchPayments();
    setShowFilterModal(false);
  };

  const handleClearFilter = () => {
    setSelectedSubdealer(null);
    setSelectedMonth('');
    setSelectedYear('');
    setPayments([]);
    setFilteredPayments([]);
    setShowFilterModal(false);
  };

  const handleGenerateReceipt = () => {
    if (!selectedSubdealer || !selectedMonth || !selectedYear) {
      setError('Please select subdealer, month, and year to generate receipt');
      return;
    }
    const receipt = {
      subdealer: selectedSubdealer,
      month: parseInt(selectedMonth),
      year: parseInt(selectedYear),
      totalCommission: filteredPayments.reduce((sum, payment) => sum + payment.total_commission, 0),
      paymentDate: new Date().toISOString(),
      receiptNumber: `RC-${Math.floor(1000 + Math.random() * 9000)}`,
      payments: filteredPayments
    };

    openReceiptInNewTab(receipt);
  };

  const openReceiptInNewTab = (receiptData) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      setError('Please allow popups for this site to generate receipts');
      return;
    }

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getMonthName = (monthNumber) => {
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
      return months[monthNumber - 1] || '';
    };

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Commission Payment Receipt</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          body {
            font-family: Courier New;
            background-color: #f8f9fa;
            padding: 20px;
            font-size:13px;
          }
          .receipt-container {
            width: 21cm;
            min-height: 29.7cm;
            padding: 1cm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .receipt-company-header {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3c4b64;
          }
          .receipt-company-header h2 {
            color: #3c4b64;
            margin-bottom: 5px;
          }
          .receipt-company-header p {
            margin: 2px 0;
            color: #6c757d;
          }
          .receipt-details {
            margin-bottom: 25px;
          }
          .detail-group {
            display: flex;
            margin-bottom: 5px;
          }
          .detail-group label {
            font-weight: 600;
            min-width: 150px;
            color: #495057;
          }
          .detail-group span {
            color: #3c4b64;
          }
          .receipt-summary {
            margin-bottom: 30px;
            text-align: center;
          }
          .summary-card {
            display: inline-block;
            background: linear-gradient(135deg, #3c4b64 0%, #2c3e50 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .summary-card h4 {
            margin: 0 0 10px 0;
            font-size: 1.1rem;
          }
          .summary-card .amount {
            font-size: 1.8rem;
            font-weight: bold;
          }
          .receipt-payments h5 {
            color: #3c4b64;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ddd;
          }
          .receipt-payments table {
            border: 1px solid #dee2e6;
            width: 100%;
          }
          .receipt-payments th {
            background-color: #f8f9fa;
            color: #3c4b64;
            font-weight: 600;
            padding: 10px;
            text-align: left;
          }
          .receipt-payments td {
            padding: 10px;
            border-top: 1px solid #dee2e6;
          }
          .authorized-signature, .subdealer-signature {
            text-align: center;
            margin-top: 10px;
          }
          .authorized-signature p, .subdealer-signature p {
            margin: 5px 0;
          }
          .receipt-notes {
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            border-left: 4px solid #3c4b64;
            margin-top: 10px;
          }
          .receipt-notes ul {
            padding-left: 20px;
          }
          @media print {
            body {
              padding: 0;
              background: white;
            }
            .receipt-container {
              width: 100%;
              height: 100%;
              padding: 0;
              margin: 0;
              box-shadow: none;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-company-header">
            <h4>Gandhi TVS</h4>
            <p>Authorised Main Dealer: TVS Motor Company Ltd.
Registered office: 'JOGPREET' Asher Estate, Near Ichhamani Lawns,
Upnagar, Nashik Road, Nashik - 422101</p>
            <p>Phone: 7498903672</p>
          </div>
          
          <div class="receipt-details">
            <div class="row">
              <div class="col-md-6">
                <div class="detail-group">
                  <label>Receipt Number:</label>
                  <span>${receiptData.receiptNumber}</span>
                </div>
                <div class="detail-group">
                  <label>Issue Date:</label>
                  <span>${formatDate(receiptData.paymentDate)}</span>
                </div>
                <div class="detail-group">
                  <label>Payment Period:</label>
                  <span>${getMonthName(receiptData.month)} ${receiptData.year}</span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="detail-group">
                  <label>Subdealer Name:</label>
                  <span>${receiptData.subdealer.name}</span>
                </div>
                <div class="detail-group">
                  <label>Location:</label>
                  <span>${receiptData.subdealer.location}</span>
                </div>
                <div class="detail-group">
                  <label>Type:</label>
                  <span>${receiptData.subdealer.type}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="receipt-payments">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Customer</th>
                    <th>Model</th>
                    <th>Booking Date</th>
                    <th class="text-end">Commission Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${receiptData.payments
                    .flatMap((payment) =>
                      payment.booking_commissions
                        .map(
                          (booking) => `
                      <tr>
                        <td>${booking.booking_number}</td>
                        <td>${booking.customer_name}</td>
                        <td>${booking.model}</td>
                        <td>${formatDate(booking.booking_date)}</td>
                        <td class="text-end">₹${booking.total_commission.toFixed(2)}</td>
                      </tr>
                    `
                        )
                        .join('')
                    )
                    .join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="text-end"><strong>Total Commission:</strong></td>
                    <td class="text-end"><strong>₹${receiptData.totalCommission.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div class="receipt-footer">
            <div class="row">
              <div class="col-md-6">
                <div class="authorized-signature">
                  <p>_________________________</p>
                  <p>Authorized Signature</p>
                  <p>Gandhi TVS</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="subdealer-signature">
                  <p>_________________________</p>
                  <p>Subdealer Signature</p>
                  <p>${receiptData.subdealer.name}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="receipt-notes">
            <p><strong>Notes:</strong></p>
            <ul>
              <li>This receipt serves as confirmation of commission payment for the specified period.</li>
              <li>Please retain this document for your records.</li>
              <li>For any queries, contact Gandhi TVS</li>
            </ul>
          </div>

          <div class="text-center mt-4 no-print">
            <button class="btn btn-primary" onclick="window.print()">
              <i class="fas fa-print"></i> Print Receipt
            </button>
            <button class="btn btn-secondary ms-2" onclick="window.close()">
              <i class="fas fa-times"></i> Close
            </button>
          </div>
        </div>
      </body>
      </html>
    `);

    receiptWindow.document.close();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    return months[monthNumber - 1] || '';
  };

  const getStatusBadge = (status) => {
    let color = 'secondary';
    if (status === 'PROCESSED') color = 'success';
    if (status === 'PENDING') color = 'warning';
    if (status === 'FAILED') color = 'danger';

    return <CBadge color={color}>{status}</CBadge>;
  };

  return (
    <div className="commission-payments-container">
      <div className="header-section">
        <h4>Commission Payments</h4>
        <div className="action-buttons">
          <button className="btn btn-primary filter-btn" onClick={handleFilterClick}>
            <i className="fas fa-filter"></i> Filter
          </button>
          <button
            className="btn btn-success receipt-btn"
            onClick={handleGenerateReceipt}
            disabled={!selectedSubdealer || !selectedMonth || !selectedYear || filteredPayments.length === 0}
          >
            <i className="fas fa-receipt"></i> Generate Receipt
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {(selectedSubdealer || selectedMonth || selectedYear) && (
        <div className="active-filters">
          <h5>Active Filters:</h5>
          <div className="filter-badges">
            {selectedSubdealer && <span className="badge bg-primary">Subdealer: {selectedSubdealer.name}</span>}
            {selectedMonth && <span className="badge bg-info text-dark">Month: {getMonthName(parseInt(selectedMonth))}</span>}
            {selectedYear && <span className="badge bg-info text-dark">Year: {selectedYear}</span>}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <CSpinner color="primary" />
          <p className="mt-2">Loading commission payments...</p>
        </div>
      ) : filteredPayments.length > 0 ? (
        <div className="payments-table-container">
          {selectedSubdealer && (
            <div className="subdealer-info">
              <h4>{selectedSubdealer.name}</h4>
              <p>
                {selectedSubdealer.location} • {selectedSubdealer.type}
              </p>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Month/Year</th>
                  <th>Total Commission</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Created On</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      {getMonthName(payment.month)} {payment.year}
                    </td>
                    <td>₹{payment.total_commission.toFixed(2)}</td>
                    <td>{payment.payment_method === 'ON_ACCOUNT' ? 'On Account' : payment.payment_method}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>{payment.remarks}</td>
                    <td>{formatDate(payment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments[0]?.booking_commissions && (
            <div className="booking-commissions mt-5">
              <h4>Booking Commissions</h4>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Booking #</th>
                      <th>Model</th>
                      <th>Booking Date</th>
                      <th>Customer</th>
                      <th>Total Amount</th>
                      <th>Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments[0].booking_commissions.map((booking) => (
                      <tr key={booking.booking_id}>
                        <td>{booking.booking_number}</td>
                        <td>{booking.model}</td>
                        <td>{formatDate(booking.booking_date)}</td>
                        <td>{booking.customer_name}</td>
                        <td>₹{booking.total_amount.toFixed(2)}</td>
                        <td>₹{booking.total_commission.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-5 no-data">
          <i className="fas fa-receipt fa-3x mb-3"></i>
          <p>No commission payments found. Apply filters to view payments.</p>
        </div>
      )}

      {/* Filter Modal */}
      <CModal visible={showFilterModal} onClose={() => setShowFilterModal(false)}>
        <CModalHeader>
          <CModalTitle>Filter Commission Payments</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label htmlFor="subdealerSelect" className="form-label">
              Select Subdealer
            </label>
            <CFormSelect id="subdealerSelect" onChange={handleSubdealerSelect} value={selectedSubdealer?.id || ''}>
              <option value="">Select a subdealer...</option>
              {subdealers.map((subdealer) => (
                <option key={subdealer.id} value={subdealer.id}>
                  {subdealer.name} - {subdealer.location}
                </option>
              ))}
            </CFormSelect>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="monthSelect" className="form-label">
                Select Month
              </label>
              <CFormSelect id="monthSelect" onChange={handleMonthSelect} value={selectedMonth}>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="col-md-6 mb-3">
              <label htmlFor="yearSelect" className="form-label">
                Select Year
              </label>
              <CFormSelect id="yearSelect" onChange={handleYearSelect} value={selectedYear}>
                {years.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </CFormSelect>
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleClearFilter}>
            Clear Filter
          </CButton>
          <CButton color="primary" onClick={handleApplyFilter}>
            Apply Filter
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default CommissionPayments;
