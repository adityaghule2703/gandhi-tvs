import '../../css/table.css';
import {
  React,
  useState,
  useEffect,
  Menu,
  MenuItem,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  showError,
  showSuccess,
  axiosInstance
} from 'utils/tableImports';
import PendingUpdateDetailsModal from './ViewPendingUpdates';

const PendingUpdates = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(filteredData);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/bookings/pending-updates`);
      setData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      console.log('Error fetching data', error);
      showError('Failed to fetch pending updates');
    }
  };
  const handleViewDetails = (update) => {
    setSelectedUpdate(update);
    setDetailsModalOpen(true);
    handleClose();
  };

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  const handleApproveUpdate = async (id, payload) => {
    try {
      setLoadingId(id);
      await axiosInstance.post(`/bookings/${id}/approve-update`, payload);
      showSuccess('Update approved successfully');
      fetchData();
      setDetailsModalOpen(false);
    } catch (error) {
      console.log(error);
      showError(error.response?.data?.message || 'Failed to approve update');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectUpdate = async (id, payload) => {
    try {
      setLoadingId(id);
      await axiosInstance.post(`/bookings/${id}/reject-update`, payload);
      showSuccess('Update rejected successfully');
      fetchData();
      setDetailsModalOpen(false);
    } catch (error) {
      console.log(error);
      showError(error.response?.data?.message || 'Failed to reject update');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="status-badge pending">PENDING</span>;
      case 'APPROVED':
        return <span className="status-badge approved">APPROVED</span>;
      case 'REJECTED':
        return <span className="status-badge rejected">REJECTED</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div>
      <h4>Pending Booking Updates</h4>
      <div className="table-container">
        <div className="table-header">
          <div className="search-icon-data">
            <input
              type="text"
              placeholder="Search.."
              onChange={(e) => handleFilter(e.target.value, getDefaultSearchFields('booking-updates'))}
            />
            <SearchOutlinedIcon />
          </div>
        </div>
        <div className="table-responsive">
          <div className="table-wrapper">
            <table className="responsive-table" style={{ overflow: 'auto' }}>
              <thead className="table-header-fixed">
                <tr>
                  <th>Sr.no</th>
                  <th>Booking Number</th>
                  <th>Customer Name</th>
                  <th>Model</th>
                  <th>Current Color</th>
                  <th>Requested Color</th>
                  <th>Status</th>
                  <th>Request Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ color: 'red' }}>
                      No pending updates available
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((update, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{update.bookingNumber}</td>
                      <td>{update.customerName}</td>
                      <td>{update.model.name}</td>
                      <td>{update.color}</td>
                      <td>{update.pendingUpdates?.color || ''}</td>
                      <td>{getStatusBadge(update.updateRequestStatus)}</td>
                      <td>{update.updateRequestNote || ''}</td>
                      <td>
                        <button
                          className="action-button"
                          onClick={(event) => handleClick(event, update._id)}
                          disabled={update.updateRequestStatus !== 'PENDING'}
                        >
                          Action
                        </button>
                        <Menu id={`action-menu-${update._id}`} anchorEl={anchorEl} open={menuId === update._id} onClose={handleClose}>
                          <MenuItem onClick={() => handleViewDetails(update)}>View Details</MenuItem>
                        </Menu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <PaginationOptions />
        <PendingUpdateDetailsModal
          open={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          updateData={selectedUpdate}
          onApprove={(payload) => handleApproveUpdate(selectedUpdate._id, payload)}
          onReject={(payload) => handleRejectUpdate(selectedUpdate._id, payload)}
        />
      </div>
    </div>
  );
};

export default PendingUpdates;
