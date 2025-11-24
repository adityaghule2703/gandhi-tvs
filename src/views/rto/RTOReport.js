
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import '../../css/report.css';
import { toast } from 'react-toastify';
import axiosInstance from '../../axiosInstance';

const RTOReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRTOReport = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both from and to dates');
      return;
    }

    if (fromDate > toDate) {
      toast.error('From date cannot be after To date');
      return;
    }

    try {
      setLoading(true);
      const formattedFromDate = fromDate.toISOString();
      const formattedToDate = toDate.toISOString();
      const response = await axiosInstance(`/rtoProcess/records?startDate=${formattedFromDate}&endDate=${formattedToDate}`);
      const data = await response.json();

      if (data.success) {
        setReportData(data.data);
        toast.success(`Found ${data.count} records`);
      } else {
        toast.error('Failed to fetch RTO report data');
      }
    } catch (error) {
      console.error('Error fetching RTO report:', error);
      toast.error('Error fetching RTO report data');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const excelData = reportData.map((item) => ({
      'Booking Number': item.bookingId.bookingNumber,
      'Customer Name': item.bookingId.customerDetails.name,
      Mobile: item.bookingId.customerDetails.mobile1,
      'Model Name': item.bookingId.model.model_name,
      'Chassis Number': item.bookingId.chassisNumber,
      'Application Number': item.applicationNumber,
      'RTO Status': item.rtoStatus,
      'Paper Status': item.rtoPaperStatus,
      Amount: item.rtoAmount,
      'Number Plate': item.numberPlate,
      'Receipt Number': item.receiptNumber,
      'HSRP Ordered': item.hsrbOrdering ? 'Yes' : 'No',
      'HSRP Installed': item.hsrbInstallation ? 'Yes' : 'No',
      'RC Confirmed': item.rcConfirmation ? 'Yes' : 'No',
      'RTO Date': new Date(item.rtoDate).toLocaleDateString(),
      'Created At': new Date(item.createdAt).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RTO Report');

    const fromDateStr = fromDate ? fromDate.toLocaleDateString().replace(/\//g, '-') : '';
    const toDateStr = toDate ? toDate.toLocaleDateString().replace(/\//g, '-') : '';
    const fileName = `RTO_Report_${fromDateStr}_to_${toDateStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };
  useEffect(() => {
    if (fromDate && toDate) {
      fetchRTOReport();
    }
  }, [fromDate, toDate]);

  return (
    <div className="rto-report-container">
      <h4 className="rto-report-title">Main RTO Report</h4>

      <div className="rto-report-card">
        <div className="date-filter-container">
          <div className="date-filter-group">
            <label className="date-filter-label">From Date:</label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              className="date-picker"
              maxDate={new Date()}
              selectsStart
              startDate={fromDate}
              endDate={toDate}
              placeholderText="Select start date"
            />
          </div>

          <div className="date-filter-group">
            <label className="date-filter-label">To Date:</label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              className="date-picker"
              maxDate={new Date()}
              selectsEnd
              startDate={fromDate}
              endDate={toDate}
              minDate={fromDate}
              placeholderText="Select end date"
            />
          </div>

          <button className="export-button" onClick={exportToExcel} disabled={loading || reportData.length === 0}>
            {loading ? 'Loading...' : 'Export'}
          </button>
        </div>
        {reportData.length > 0 && (
          <div className="report-summary">
            <p>Total Records: {reportData.length}</p>
            <p>
              Date Range: {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RTOReport;
