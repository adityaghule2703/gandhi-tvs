import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CFormSelect,
  CFormLabel,
  CContainer,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CTable,
  CAlert,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react';
import axiosInstance from 'src/axiosInstance';
import { format, parseISO } from 'date-fns';
import tvsLogo from '../../../assets/images/logo.png';
const CalculateCommission = () => {
  const [subdealers, setSubdealers] = useState([]);
  const [selectedSubdealer, setSelectedSubdealer] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchSubdealers();
    generateYearOptions();
  }, []);

  useEffect(() => {
    generateMonthOptions();
  }, [selectedYear]);

  const fetchSubdealers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/subdealers');
      const subdealerData = response.data.data.subdealers || response.data.data || [];
      setSubdealers(subdealerData);
    } catch (error) {
      console.error('Error fetching subdealers:', error);
      setError('Failed to load subdealers');
    } finally {
      setIsLoading(false);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const yearOptions = [];

    for (let year = 2020; year <= currentYear + 1; year++) {
      yearOptions.push(year);
    }

    setYears(yearOptions);
    setSelectedYear(currentYear);
  };

  const generateMonthOptions = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let availableMonths = monthNames.map((name, index) => ({
      value: index + 1,
      name: name,
      disabled: false
    }));

    if (parseInt(selectedYear) === currentYear) {
      availableMonths = availableMonths.map((month) => ({
        ...month,
        disabled: month.value > currentMonth
      }));
    }

    setMonths(availableMonths);

    if (!selectedMonth && parseInt(selectedYear) === currentYear) {
      setSelectedMonth(currentMonth);
    } else if (!selectedMonth) {
      setSelectedMonth(1);
    }
  };

  const fetchCommissionReport = async () => {
    if (!selectedSubdealer) {
      setError('Please select a subdealer');
      return;
    }

    if (!selectedYear || !selectedMonth) {
      setError('Please select both year and month');
      return;
    }

    setLoadingReport(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `commission-master/${selectedSubdealer}/monthly-report?year=${selectedYear}&month=${selectedMonth}`
      );

      if (response.data.status === 'success') {
        setReportData(response.data.data);
        setVisible(true);
      } else {
        setError('Failed to fetch commission report');
      }
    } catch (error) {
      console.error('Error fetching commission report:', error);
      setError('Failed to fetch commission report');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleSubdealerChange = (e) => {
    setSelectedSubdealer(e.target.value);
    setReportData(null);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
    setSelectedMonth('');
    setReportData(null);
  };

  const handleMonthSelect = (monthValue) => {
    setSelectedMonth(monthValue);
    setReportData(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handlePrintCommissionLedger = () => {
    if (!reportData) return;

    const printWindow = window.open('', '_blank');
    const monthName = months.find((m) => m.value === parseInt(reportData.month))?.name;
    const subdealerName =
      subdealers.find((s) => s._id === selectedSubdealer)?.name ||
      subdealers.find((s) => s._id === selectedSubdealer)?.companyName ||
      'Subdealer';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Commission Ledger - ${subdealerName} - ${monthName} ${reportData.year}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm 10mm;
            }
            body {
              font-family: Courier New;
              width: 100%;
              margin: 0;
              padding: 0;
              font-size: 14px;
              line-height: 1.3;
            }
            .container {
              width: 190mm;
              margin: 0 auto;
              padding: 5mm;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
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
            .report-info {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 2mm;
              margin-bottom: 5mm;
              font-size: 14px;
            }
            .report-info strong {
              min-width: 40mm;
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
            .text-right {
              text-align: right;
            }
            .breakdown-table {
              width: 95%;
              margin: 3mm auto;
              border: 1px solid #999;
              font-size: 12px;
            }
            .breakdown-table th, .breakdown-table td {
              border: 1px solid #999;
              padding: 1.5mm;
            }
            .footer {
              margin-top: 10mm;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              font-size: 14px;
            }
            @media print {
              body {
                width: 190mm;
                height: 277mm;
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
            
            <div class="report-info">
              <div><strong>Subdealer:</strong> ${subdealerName}</div>
              <div><strong>Total Bookings:</strong> ${reportData.total_bookings}</div>
              <div><strong>Period:</strong> ${monthName} ${reportData.year}</div>
              <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
              <div><strong>Total Commission:</strong>${formatCurrency(reportData.total_commission)}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th width="15%">Date</th>
                  <th width="45%">Description</th>
                  <th width="20%">Booking Number</th>
                  <th width="20%" class="text-right">Commission (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.booking_commissions
                  ?.map(
                    (booking) => `
                  <tr>
                    <td>${formatDate(booking.booking_date)}</td>
                    <td>${booking.customer_name} - ${booking.model}</td>
                    <td>${booking.booking_number}</td>
                    <td class="text-right">${booking.total_commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td colspan="4">
                      <table class="breakdown-table">
                        <thead>
                          <tr>
                            <th>Header</th>
                            <th class="text-right">Commission (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${booking.commission_breakdown
                            .map(
                              (cb) => `
                              <tr>
                                <td>${cb.header}</td>
                                <td class="text-right">${cb.commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              </tr>
                            `
                            )
                            .join('')}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
                <tr>
                  <td colspan="3" class="text-right"><strong>Total Commission</strong></td>
                  <td class="text-right"><strong>${reportData.total_commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              <div>
                <p>Generated on: ${new Date().toLocaleString('en-GB')}</p>
              </div>
              <div>
                <p>For, Gandhi TVS</p>
                <p>Authorised Signature</p>
                <p>_________________________</p>
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
  };

  return (
    <CContainer className="my-4">
      <CRow className="justify-content-center">
        <CCol md={10} lg={8}>
          <CCard>
            <CCardHeader>
              <h4 className="mb-0">Subdealer Commission Report</h4>
              <p className="text-muted small mb-0">Select a subdealer and time period to generate a commission report</p>
            </CCardHeader>
            <CCardBody>
              {error && (
                <CAlert color="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </CAlert>
              )}

              <div className="mb-3">
                <CFormLabel htmlFor="subdealerSelect" className="fw-semibold">
                  Subdealer <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  id="subdealerSelect"
                  value={selectedSubdealer}
                  onChange={handleSubdealerChange}
                  disabled={isLoading}
                  className={!selectedSubdealer ? 'border-warning' : ''}
                >
                  <option value="">{isLoading ? 'Loading subdealers...' : 'Choose a subdealer'}</option>
                  {subdealers.map((subdealer) => (
                    <option key={subdealer._id} value={subdealer._id}>
                      {subdealer.name || subdealer.companyName || subdealer.email}
                    </option>
                  ))}
                </CFormSelect>
                {!selectedSubdealer && <div className="form-text text-warning">Please select a subdealer to continue</div>}
              </div>

              <CRow>
                <CCol md={12}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="yearSelect" className="fw-semibold">
                      Select Year <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect id="yearSelect" value={selectedYear} onChange={handleYearChange} className="border-primary">
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={12}>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold d-block">
                      Select Month <span className="text-danger">*</span>
                    </CFormLabel>
                    <div className="month-buttons-container">
                      <CRow className="g-2">
                        {months.map((month) => (
                          <CCol xs={4} sm={3} key={month.value}>
                            <CButton
                              color={selectedMonth === month.value ? 'primary' : 'outline-secondary'}
                              disabled={month.disabled}
                              className="w-100 month-button"
                              onClick={() => handleMonthSelect(month.value)}
                              size="sm"
                            >
                              {month.name}
                            </CButton>
                          </CCol>
                        ))}
                      </CRow>
                    </div>
                    {!selectedMonth && <div className="form-text text-warning mt-2">Please select a month</div>}
                  </div>
                </CCol>
              </CRow>

              <div className="d-grid gap-2 mt-4">
                <CButton
                  color="primary"
                  size="lg"
                  onClick={fetchCommissionReport}
                  disabled={!selectedSubdealer || !selectedMonth || loadingReport}
                  className="fw-semibold"
                >
                  {loadingReport ? (
                    <>
                      <CSpinner component="span" size="sm" aria-hidden="true" className="me-2" />
                      Generating Report...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </CButton>

                {(!selectedSubdealer || !selectedMonth) && (
                  <div className="text-center text-muted small">Please complete all required fields to generate a report</div>
                )}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={visible} onClose={() => setVisible(false)} size="lg" scrollable className="commission-report-modal">
        <CModalHeader>
          <CModalTitle>
            Commission Report: {months.find((m) => m.value === parseInt(reportData?.month))?.name} {reportData?.year}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div id="report-content">
            {reportData && (
              <>
                <div className="report-summary mb-4 p-3 bg-light rounded">
                  <CRow>
                    <CCol md={6}>
                      <p className="mb-1">
                        <strong>Subdealer ID:</strong> {reportData.subdealer._id}
                      </p>
                      <p className="mb-0">
                        <strong>Subdealer:</strong>{' '}
                        {subdealers.find((s) => s._id === selectedSubdealer)?.name ||
                          subdealers.find((s) => s._id === selectedSubdealer)?.companyName ||
                          'Selected subdealer'}
                      </p>
                    </CCol>
                    <CCol md={6} className="text-md-end">
                      <p className="mb-1">
                        <strong>Period:</strong> {months.find((m) => m.value === parseInt(reportData.month))?.name} {reportData.year}
                      </p>
                    </CCol>
                  </CRow>
                  <CRow className="mt-3">
                    <CCol md={6}>
                      <div className="p-3 bg-white rounded border">
                        <h6 className="text-muted">Total Bookings</h6>
                        <h3 className="text-primary">{reportData.total_bookings}</h3>
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="p-3 bg-white rounded border">
                        <h6 className="text-muted">Total Commission</h6>
                        <h3 className="text-success">{formatCurrency(reportData.total_commission)}</h3>
                      </div>
                    </CCol>
                  </CRow>
                </div>

                <h6 className="mb-3">Booking Details</h6>

                {reportData.booking_commissions && reportData.booking_commissions.length > 0 ? (
                  <CAccordion>
                    {reportData.booking_commissions.map((booking, index) => (
                      <CAccordionItem key={booking.booking_id} itemKey={index}>
                        <CAccordionHeader>
                          <div className="d-flex justify-content-between w-100 me-3">
                            <span>
                              <strong>{booking.booking_number}</strong> - {booking.model}
                            </span>
                            <span className="badge bg-primary rounded-pill">{formatCurrency(booking.total_commission)}</span>
                          </div>
                        </CAccordionHeader>
                        <CAccordionBody>
                          <div className="mb-3">
                            <CRow>
                              <CCol md={6}>
                                <p>
                                  <strong>Booking Date:</strong> {formatDate(booking.booking_date)}
                                </p>
                                <p>
                                  <strong>Customer:</strong> {booking.customer_name}
                                </p>
                              </CCol>
                              <CCol md={6}>
                                <p>
                                  <strong>Total Amount:</strong> {formatCurrency(booking.total_amount)}
                                </p>
                                <p>
                                  <strong>Commission:</strong> {formatCurrency(booking.total_commission)}
                                </p>
                              </CCol>
                            </CRow>
                          </div>

                          <h6 className="mb-3">Commission Breakdown</h6>
                          <div className="table-responsive">
                            <CTable striped responsive size="sm">
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th className="text-end">Rate</th>
                                  <th className="text-end">Commission</th>
                                </tr>
                              </thead>
                              <tbody>
                                {booking.commission_breakdown.map((item, idx) => (
                                  <tr key={idx}>
                                    <td>{item.header}</td>
                                    <td className="text-end">{item.rate}</td>
                                    <td className="text-end">{formatCurrency(item.commission)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <th colSpan={3} className="text-end">
                                    Total Commission:
                                  </th>
                                  <th className="text-end">{formatCurrency(booking.total_commission)}</th>
                                </tr>
                              </tfoot>
                            </CTable>
                          </div>
                        </CAccordionBody>
                      </CAccordionItem>
                    ))}
                  </CAccordion>
                ) : (
                  <CAlert color="info">No bookings found for the selected period.</CAlert>
                )}
              </>
            )}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handlePrintCommissionLedger}>
            Print Ledger
          </CButton>
        </CModalFooter>
      </CModal>

      <style jsx>{`
        .month-button {
          transition: all 0.2s ease;
        }
        .month-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        :global(.commission-report-modal) {
          z-index: 9999 !important;
        }

        :global(.modal-backdrop) {
          z-index: 9998 !important;
        }
      `}</style>
    </CContainer>
  );
};

export default CalculateCommission;
