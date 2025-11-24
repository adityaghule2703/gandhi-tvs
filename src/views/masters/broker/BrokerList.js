import { hasPermission } from '../../../utils/permissionUtils';
import '../../../css/table.css';
import {
  React,
  useState,
  useEffect,
  Link,
  Menu,
  MenuItem,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  confirmDelete,
  showError,
  showSuccess,
  axiosInstance
} from '../../../utils/tableImports';
import { 
  CButton, 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CFormInput, 
  CFormLabel, 
  CTable, 
  CTableBody, 
  CTableHead, 
  CTableHeaderCell, 
  CTableRow,
  CTableDataCell,
  CSpinner,
  CBadge,
  CFormSwitch
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilSettings, cilPencil, cilTrash, cilCheckCircle, cilXCircle } from '@coreui/icons';

const BrokerList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);

  const { currentRecords, PaginationOptions } = usePagination(filteredData);
  const hasEditPermission = hasPermission('BROKER', 'UPDATE');
  const hasDeletePermission = hasPermission('BROKER', 'DELETE');
  const hasCreatePermission = hasPermission('BROKER', 'CREATE');
  const showActionColumn = hasEditPermission || hasDeletePermission;

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const branchId = storedUser.branch?._id;
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/brokers`);
      const allBrokers = response.data.data;

      let filtered = allBrokers;

      // Only filter by branch if user is NOT superadmin and has a branchId
      if (userRole !== 'SUPERADMIN' && branchId) {
        filtered = allBrokers
          .map((broker) => ({
            ...broker,
            branches: broker.branches.filter((br) => br.branch?._id === branchId)
          }))
          .filter((broker) => broker.branches.length > 0);
      }

      setData(filtered);
      setFilteredData(filtered);
    } catch (error) {
      console.log('Error fetching data', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuId(null);
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete();
    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/brokers/${id}`);
        setData(data.filter((broker) => broker.id !== id));
        fetchData();
        showSuccess();
      } catch (error) {
        console.log(error);
        showError(error);
      }
    }
  };

  const formatCommissionRanges = (commissionConfigurations) => {
    const variableConfig = commissionConfigurations.find((config) => config.commissionType === 'VARIABLE');

    if (!variableConfig || !variableConfig.commissionRanges || variableConfig.commissionRanges.length === 0) {
      return <CBadge color="secondary">N/A</CBadge>;
    }

    return (
      <div style={{ fontSize: '0.875rem' }}>
        {variableConfig.commissionRanges.map((range, index) => (
          <div key={index} className="mb-1">
            <CBadge color="info" className="me-1">
              ₹{range.commissionRangeMaster.minAmount} - ₹{range.commissionRangeMaster.maxAmount}
            </CBadge>
            : ₹{range.amount}
          </div>
        ))}
      </div>
    );
  };

  const getFixedCommission = (commissionConfigurations) => {
    const fixedConfig = commissionConfigurations.find((config) => config.commissionType === 'FIXED');

    return fixedConfig ? `₹${fixedConfig.fixedCommission}` : '';
  };

  const getCommissionTypes = (commissionConfigurations) => {
    return commissionConfigurations
      .filter((config) => config.isActive)
      .map((config) => config.commissionType)
      .join(', ');
  };

  const handleOtpToggle = async (brokerId, currentOtpStatus) => {
    try {
      await axiosInstance.post(`/brokers/${brokerId}/toggle-otp`);
      const updatedData = data.map((broker) => {
        if (broker.id === brokerId) {
          return {
            ...broker,
            otp_required: !currentOtpStatus
          };
        }
        return broker;
      });

      setData(updatedData);
      setFilteredData(updatedData);
      showSuccess('OTP requirement updated successfully!');
    } catch (error) {
      console.error('Error toggling OTP:', error);
      showError('Failed to update OTP requirement', error);
      fetchData();
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('broker'));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading brokers: {error}
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Brokers</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div>
            {hasCreatePermission && (
              <Link to="/broker/add-broker">
                <CButton size="sm" className="action-btn me-1">
                  <CIcon icon={cilPlus} className='icon'/> New Broker
                </CButton>
              </Link>
            )}
          </div>
        </CCardHeader>
        
        <CCardBody>
          <div className="d-flex justify-content-between mb-3">
            <div></div>
            <div className='d-flex'>
              <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
              <CFormInput
                type="text"
                className="d-inline-block square-search"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Mobile Number</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Branch</CTableHeaderCell>
                  <CTableHeaderCell>Commission Type</CTableHeaderCell>
                  <CTableHeaderCell>Fixed Commission</CTableHeaderCell>
                  <CTableHeaderCell>Commission Ranges</CTableHeaderCell>
                  <CTableHeaderCell>OTP Required?</CTableHeaderCell>
                  {showActionColumn && <CTableHeaderCell>Action</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={showActionColumn ? "11" : "10"} className="text-center">
                      <CBadge color="secondary">No brokers available</CBadge>
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.flatMap((broker, index) => {
                    const otp_required = broker.otp_required;
                    return broker.branches.map((branch, branchIndex) => {
                      const activeConfigs = branch.commissionConfigurations.filter((config) => config.isActive);

                      return (
                        <CTableRow key={`${broker.id}-${branchIndex}`}>
                          {branchIndex === 0 ? (
                            <>
                              <CTableDataCell rowSpan={broker.branches.length}>{index + 1}</CTableDataCell>
                              <CTableDataCell rowSpan={broker.branches.length}>
                                {broker.name}
                              </CTableDataCell>
                              <CTableDataCell rowSpan={broker.branches.length}>{broker.mobile}</CTableDataCell>
                              <CTableDataCell rowSpan={broker.branches.length}>{broker.email}</CTableDataCell>
                            </>
                          ) : null}

                          <CTableDataCell>
                          {branch.branch?.name || ''}
                          </CTableDataCell>
                          <CTableDataCell>{getCommissionTypes(activeConfigs)}</CTableDataCell>
                          <CTableDataCell>
                            {activeConfigs.some((config) => config.commissionType === 'FIXED') ? getFixedCommission(activeConfigs) : ''}
                          </CTableDataCell>
                          <CTableDataCell>
                            {activeConfigs.some((config) => config.commissionType === 'VARIABLE')
                              ? formatCommissionRanges(activeConfigs)
                              :" "}
                          </CTableDataCell>

                          {branchIndex === 0 ? (
                            <>
                              <CTableDataCell rowSpan={broker.branches.length}>
                                <div className="align-items-center">
                                  <CFormSwitch
                                    checked={otp_required}
                                    onChange={() => handleOtpToggle(broker.id, otp_required)}
                                    className="ms-2"
                                  />
                                </div>
                              </CTableDataCell>
                              {showActionColumn && (
                                <CTableDataCell rowSpan={broker.branches.length}>
                                  <CButton
                                    size="sm"
                                    className='option-button btn-sm'
                                    onClick={(event) => handleClick(event, broker.id)}
                                  >
                                    <CIcon icon={cilSettings} />
                                    Options
                                  </CButton>
                                  <Menu
                                    id={`action-menu-${broker.id}`}
                                    anchorEl={anchorEl}
                                    open={menuId === broker.id}
                                    onClose={handleClose}
                                  >
                                    {hasEditPermission && (
                                      <Link className="Link" to={`/broker/update-broker/${broker.id}`}>
                                        <MenuItem style={{ color: 'black' }}>
                                          <CIcon icon={cilPencil} className="me-2" />
                                          Edit
                                        </MenuItem>
                                      </Link>
                                    )}
                                    {hasDeletePermission && (
                                      <MenuItem onClick={() => handleDelete(broker.id)}>
                                        <CIcon icon={cilTrash} className="me-2" />
                                        Delete
                                      </MenuItem>
                                    )}
                                  </Menu>
                                </CTableDataCell>
                              )}
                            </>
                          ) : null}
                        </CTableRow>
                      );
                    });
                  })
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default BrokerList;