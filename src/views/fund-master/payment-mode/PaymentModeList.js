import { hasPermission } from '../../../utils/permissionUtils';
import '../../../css/table.css';
import {
  React,
  useEffect,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  axiosInstance,
  confirmDelete,
  showSuccess,
  showError
} from '../../../utils/tableImports';

const PaymentModeList = ({ payments, onDelete }) => {
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData || []);

  useEffect(() => {
    const paymentData = Array.isArray(payments) ? payments : [];
    setData(paymentData);
    setFilteredData(paymentData);
  }, [payments]);

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/banksubpaymentmodes/${id}`);
        onDelete();
        showSuccess('Payment mode deleted successfully!');
      } catch (error) {
        console.log('Delete error:', error);
        showError(error.response?.data?.message || 'Failed to delete payment mode');
      }
    }
  };

  return (
    <div className="table-container" style={{ marginTop: '20px' }}>
      {' '}
      <div className="table-header">
        <div className="search-icon-data">
          <input
            type="text"
            placeholder="Search payment modes..."
            onChange={(e) => handleFilter(e.target.value, getDefaultSearchFields('payment_mode'))}
          />
          <SearchOutlinedIcon />
        </div>
      </div>
      <div className="table-responsive">
        <div className="table-wrapper">
          <table className="responsive-table">
            <thead className="table-header-fixed">
              <tr>
                <th>Sr.no</th>
                <th>Payment Mode</th>
                {hasPermission('BANK_SUB_PAYMENT_MODE', 'DELETE') && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {currentRecords && currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ color: 'red', textAlign: 'center' }}>
                    {' '}
                    No payment modes available
                  </td>
                </tr>
              ) : (
                currentRecords.map((payment, index) => (
                  <tr key={payment.id || index}>
                    <td>{index + 1}</td>
                    <td>{payment.payment_mode}</td>
                    {hasPermission('BANK_SUB_PAYMENT_MODE', 'DELETE') && (
                      <td>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDelete(payment.id)}
                          title="Delete payment mode"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationOptions />
    </div>
  );
};

export default PaymentModeList;
