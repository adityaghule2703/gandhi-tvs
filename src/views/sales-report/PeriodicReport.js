import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import '../../css/report.css';
import { toast } from 'react-toastify';
import axiosInstance from '../../axiosInstance';

const PeriodicReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPeriodicReport = async () => {
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
      const formattedFromDate = fromDate.toISOString().split('T')[0];
      const formattedToDate = toDate.toISOString().split('T')[0];

      const response = await axiosInstance.get(`/bookings?fromDate=${formattedFromDate}&toDate=${formattedToDate}`);

      if (response.data.success) {
        setReportData(response.data.data.bookings || []);
        toast.success(`Found ${response.data.data.bookings.length} records`);
      } else {
        toast.error('Failed to fetch report data');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Error fetching report data');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const excelData = reportData.map((booking) => {
      const safeGet = (obj, path, defaultValue = '') => {
        return path.split('.').reduce((acc, key) => {
          return acc && acc[key] !== undefined ? acc[key] : defaultValue;
        }, obj);
      };

      return {
        'Booking Number': safeGet(booking, 'bookingNumber'),
        'Model Name': safeGet(booking, 'model.model_name'),
        'Model Color': safeGet(booking, 'color.name'),
        Type: safeGet(booking, 'model.type'),
        chassisNumber: safeGet(booking, 'chassisNumber'),
        'Booking Type': safeGet(booking, 'bookingType'),
        'Customer Type': safeGet(booking, 'customerType'),
        'Customer Name': safeGet(booking, 'customerDetails.name'),
        'PAN No': safeGet(booking, 'customerDetails.panNo'),
        'Aadhar Number': safeGet(booking, 'customerDetails.aadharNumber'),
        DOB: safeGet(booking, 'customerDetails.dob'),
        Occupation: safeGet(booking, 'customerDetails.occupation'),
        Address: safeGet(booking, 'customerDetails.address'),
        Taluka: safeGet(booking, 'customerDetails.taluka'),
        District: safeGet(booking, 'customerDetails.district'),
        Pincode: safeGet(booking, 'customerDetails.pincode'),
        Mobile1: safeGet(booking, 'customerDetails.mobile1'),
        Mobile2: safeGet(booking, 'customerDetails.mobile2', ''),
        'Nominee Name': safeGet(booking, 'customerDetails.nomineeName'),
        'Nominee Relation': safeGet(booking, 'customerDetails.nomineeRelation'),
        'Nominee Age': safeGet(booking, 'customerDetails.nomineeAge'),
        'Total Amount': safeGet(booking, 'totalAmount', 0),
        'Received Amount': safeGet(booking, 'receivedAmount', 0),
        'Balance Amount': safeGet(booking, 'balanceAmount', 0),
        'Booking Status': safeGet(booking, 'status'),
        RTO: safeGet(booking, 'rto'),
        'RTO Status': safeGet(booking, 'rtoStatus'),
        'RTO Amount': safeGet(booking, 'rtoAmount', 0),
        'Branch Name': safeGet(booking, 'branch.name', ''),
        'Sales Executive': safeGet(booking, 'salesExecutive.name', ''),
        'Created By': safeGet(booking, 'createdBy.name', ''),
        'Created Date': booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '',
        'Exchange Vehicle': booking.exchange ? 'Yes' : 'No',
        'Exchange Amount': booking.exchange && booking.exchangeDetails ? booking.exchangeDetails.price : 0,
        HPA: booking.hpa ? 'Yes' : 'No',
        'Hypothecation Charges': safeGet(booking, 'hypothecationCharges', 0)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Periodic Report');

    const fromDateStr = fromDate ? fromDate.toLocaleDateString().replace(/\//g, '-') : '';
    const toDateStr = toDate ? toDate.toLocaleDateString().replace(/\//g, '-') : '';
    const fileName = `Periodic_Report_${fromDateStr}_to_${toDateStr}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  useEffect(() => {
    if (fromDate && toDate) {
      fetchPeriodicReport();
    }
  }, [fromDate, toDate]);

  return (
    <div className="rto-report-container">
      <h4 className="rto-report-title">Periodic Report</h4>

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
            {loading ? 'Loading...' : 'Export to Excel'}
          </button>
        </div>

        {reportData.length > 0 && (
          <div className="report-summary">
            <p>Total Records: {reportData.length}</p>
            <p>
              Date Range: {fromDate ? new Date(fromDate).toLocaleDateString() : ''} to {toDate ? new Date(toDate).toLocaleDateString() : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodicReport;
