import React, { useEffect, useState, useRef } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import '../../css/table.css';
import '../../css/importCsv.css';
import './uploadChallan.css';
import { getDefaultSearchFields, useTableFilter } from '../../utils/tableFilters';
import { usePagination } from '../../utils/pagination.jsx';
import axiosInstance from '../../axiosInstance';
import { showError, showSuccess } from '../../utils/sweetAlerts';
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
  CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCloudUpload, cilPaperclip } from '@coreui/icons';

const UploadChallan = () => {
  const [fileInputs, setFileInputs] = useState({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef({});

  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([]);
  const { currentRecords, PaginationOptions } = usePagination(Array.isArray(filteredData) ? filteredData : []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/transfers`);
      const transfers = response.data.data.transfers || [];
      setData(transfers);
      setFilteredData(transfers);

      const inputs = {};
      transfers.forEach((transfer) => {
        inputs[transfer._id] = null;
      });
      setFileInputs(inputs);
    } catch (error) {
      console.log('Error fetching data', error);
      showError(error.response?.data?.message || 'Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (transferId, e) => {
    setFileInputs((prev) => ({
      ...prev,
      [transferId]: e.target.files[0]
    }));
  };

  const handleUploadClick = (transferId) => {
    fileInputRef.current[transferId]?.click();
  };

  const handleUpload = async (transferId) => {
    if (!fileInputs[transferId]) {
      showError('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('challan', fileInputs[transferId]);

      await axiosInstance.post(`/transfers/${transferId}/challan`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showSuccess('Challan uploaded successfully!');
      fetchData();
    } catch (error) {
      console.error('Error uploading challan:', error);
      showError(error.response?.data?.message || 'Failed to upload challan');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilter(value, getDefaultSearchFields('stockTransfer'));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className='title'>Upload Stock Transfer Challan</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
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
        </CCardHeader>
        
        <CCardBody>
          <div className="responsive-table-wrapper">
            <CTable bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>From Branch</CTableHeaderCell>
                  <CTableHeaderCell>To Branch</CTableHeaderCell>
                  <CTableHeaderCell>Transfer Date</CTableHeaderCell>
                  <CTableHeaderCell>Model</CTableHeaderCell>
                  <CTableHeaderCell>Color</CTableHeaderCell>
                  <CTableHeaderCell>Chassis Number</CTableHeaderCell>
                  <CTableHeaderCell>Challan Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="8" className="text-center">
                      No transfers available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((transfer, index) => (
                    <React.Fragment key={`transfer-${index}`}>
                      <CTableRow>
                        <CTableDataCell rowSpan={transfer.items?.length + 1 || 1}>{index + 1}</CTableDataCell>
                        <CTableDataCell rowSpan={transfer.items?.length + 1 || 1}>{transfer.fromBranchDetails?.name || 'N/A'}</CTableDataCell>
                        <CTableDataCell rowSpan={transfer.items?.length + 1 || 1}>{transfer.toBranchDetails?.name || 'N/A'}</CTableDataCell>
                        <CTableDataCell rowSpan={transfer.items?.length + 1 || 1}>
                          {transfer.transferDate ? new Date(transfer.transferDate).toLocaleDateString('en-GB') : 'N/A'}
                        </CTableDataCell>
                      </CTableRow>

                      {transfer.items?.map((item, itemIndex) => (
                        <CTableRow key={`item-${index}-${itemIndex}`}>
                          <CTableDataCell>{item.vehicle?.modelName || item.vehicle?.model?.model_name || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{item.vehicle?.color?.name || 'N/A'}</CTableDataCell>
                          <CTableDataCell>{item.vehicle?.chassisNumber || 'N/A'}</CTableDataCell>
                          {itemIndex === 0 && (
                            <CTableDataCell rowSpan={transfer.items.length} style={{ maxWidth: '200px' }}>
                              {transfer.challanStatus === 'pending' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <input
                                    type="file"
                                    ref={(el) => (fileInputRef.current[transfer._id] = el)}
                                    onChange={(e) => handleFileChange(transfer._id, e)}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    style={{ display: 'none' }}
                                  />
                                  <CButton 
                                    size="sm" 
                                    color="primary"
                                    onClick={() => handleUploadClick(transfer._id)} 
                                    disabled={uploading}
                                    className="action-btn"
                                  >
                                    <CIcon icon={cilCloudUpload} className="me-1" />
                                    Upload Challan
                                  </CButton>
                                  {fileInputs[transfer._id] && (
                                    <div className="d-flex align-items-center gap-2">
                                      <small className="text-muted">
                                        <CIcon icon={cilPaperclip} className="me-1" />
                                        {fileInputs[transfer._id].name}
                                      </small>
                                      <CButton
                                        size="sm"
                                        color="success"
                                        onClick={() => handleUpload(transfer._id)}
                                        disabled={uploading}
                                        className="action-btn"
                                      >
                                        {uploading ? 'Uploading...' : 'Upload'}
                                      </CButton>
                                    </div>
                                  )}
                                </div>
                              ) : transfer.challanDocument ? (
                                <div className="document-preview">
                                  {transfer.challanDocument.endsWith('.pdf') ? (
                                    <iframe
                                      src={`${axiosInstance.defaults.baseURL}/${transfer.challanDocument}`}
                                      width="150"
                                      height="100"
                                      style={{ border: 'none' }}
                                      title="Challan Document"
                                    />
                                  ) : (
                                    <img
                                      src={`${axiosInstance.defaults.baseURL}/${transfer.challanDocument}`}
                                      alt="Challan Document"
                                      style={{ maxWidth: '150px', maxHeight: '100px' }}
                                    />
                                  )}
                                  <CButton
                                    size="sm"
                                    color="info"
                                    href={`${axiosInstance.defaults.baseURL}/${transfer.challanDocument}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 action-btn"
                                  >
                                    View Full
                                  </CButton>
                                </div>
                              ) : (
                                <span>No Document</span>
                              )}
                            </CTableDataCell>
                          )}
                        </CTableRow>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default UploadChallan;