import React from 'react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

export const usePagination = (data, initialRowsPerPage = 100) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const indexOfLastRecord = currentPage * rowsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - rowsPerPage;
  const currentRecords = data.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const PaginationButtons = () => (
    <div className="pagination">
      <button onClick={() => paginate(currentPage - 1)} className="page-icon" disabled={currentPage === 1} title="Previous Page">
        <ChevronLeft />
      </button>
      <button onClick={() => paginate(currentPage + 1)} className="page-icon" disabled={currentPage === totalPages} title="Next Page">
        <ChevronRight />
      </button>
    </div>
  );

  const PaginationOptions = () => (
    <div className="pagination-options-container">
      <div className="rows-per-page">
        <label htmlFor="rows-per-page">Rows per page:</label>
        <select id="rows-per-page" value={rowsPerPage} onChange={handleRowsPerPageChange}>
          <option value={100}>100</option>
          <option value={150}>150</option>
          <option value={200}>200</option>
        </select>
      </div>
      <div className="pagination-buttons">
        <PaginationButtons />
      </div>
    </div>
  );

  return {
    currentPage,
    rowsPerPage,
    currentRecords,
    totalPages,
    PaginationButtons,
    PaginationOptions,
    handleRowsPerPageChange,
    paginate
  };
};
