import { hasPermission } from '../../utils/permissionUtils';
import '../../css/table.css';
import {
  React,
  useEffect,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  axiosInstance,
  confirmDelete
} from '../../utils/tableImports';

const ExpenseList = ({ expenses, onDelete }) => {
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);

  useEffect(() => {
    setData(expenses);
    setFilteredData(expenses);
  }, [expenses]);

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/expense-accounts/${id}`);
        onDelete();
        showSuccess();
      } catch (error) {
        console.log(error);
        showError(error);
      }
    }
  };

  return (
    <div className="table-container" style={{ marginTop: '-40px' }}>
      <div className="table-header">
        <div className="search-icon-data">
          <input type="text" placeholder="Search.." onChange={(e) => handleFilter(e.target.value, getDefaultSearchFields('expense'))} />
          <SearchOutlinedIcon />
        </div>
      </div>
      <div className="table-responsive">
        <div className="table-wrapper">
          <table className="responsive-table" style={{ overflow: 'auto' }}>
            <thead className="table-header-fixed">
              <tr>
                <th>Sr.no</th>
                <th>Name</th>
                {hasPermission('EXPENSE_ACCOUNT', 'DELETE') && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ color: 'red' }}>
                    No expense available
                  </td>
                </tr>
              ) : (
                currentRecords.map((expense, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{expense.name}</td>

                    {hasPermission('EXPENSE_ACCOUNT', 'DELETE') && (
                      <td>
                        <button className="action-button" onClick={() => handleDelete(expense.id)}>
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

export default ExpenseList;
