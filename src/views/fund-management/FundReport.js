import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../css/report.css';
const FundReport = () => {
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState(new Date());

  return (
    <div className="rto-report-container">
      <h4 className="rto-report-title">Main Cash Report</h4>

      <div className="rto-report-card">
        <div className="date-filter-container">
          <div className="date-filter-group">
            <label className="date-filter-label">From Date:</label>
            <DatePicker selected={fromDate} onChange={(date) => setFromDate(date)} className="date-picker" maxDate={new Date()} />
          </div>

          <div className="date-filter-group">
            <label className="date-filter-label">To Date:</label>
            <DatePicker selected={toDate} onChange={(date) => setToDate(date)} className="date-picker" maxDate={new Date()} />
          </div>

          <button className="export-button">Export</button>
        </div>
      </div>
    </div>
  );
};

export default FundReport;
