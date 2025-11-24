import React, { useState, useEffect, useRef } from 'react';
import '../../css/form.css';
import './challan.css';
import {
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormCheck,
  CFormInput,
  CCol,
  CRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilSearch, cilPrint } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { showFormSubmitError, showSuccess } from '../../utils/sweetAlerts';
import axiosInstance from '../../axiosInstance';
import TransferChallan from './StockChallan';

function StockTransfer() {
  const [formData, setFormData] = useState({
    fromBranch: '',
    toBranch: ''
  });
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [challanData, setChallanData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get('/branches');
        setBranches(response.data.data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
        showFormSubmitError(error);
      }
    };

    fetchBranches();
  }, []);

  const fetchVehiclesForBranch = async (branchId) => {
    try {
      const res = await axiosInstance.get(`/vehicles/branch/${branchId}`);
      const inStockVehicles = (res.data.data.vehicles || []).filter((vehicle) => vehicle.status === 'in_stock');
      setVehicles(inStockVehicles);
      setFilteredVehicles(inStockVehicles);
      setSelectedVehicles([]);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      showFormSubmitError(error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = vehicles.filter((vehicle) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (vehicle.chassisNumber && vehicle.chassisNumber.toLowerCase().includes(searchLower)) ||
          (vehicle.engineNumber && vehicle.engineNumber.toLowerCase().includes(searchLower)) ||
          (vehicle.motorNumber && vehicle.motorNumber.toLowerCase().includes(searchLower)) ||
          (vehicle.model?.model_name && vehicle.model.model_name.toLowerCase().includes(searchLower)) ||
          (vehicle.type && vehicle.type.toLowerCase().includes(searchLower)) ||
          (vehicle.batteryNumber && vehicle.batteryNumber.toLowerCase().includes(searchLower)) ||
          (vehicle.keyNumber && vehicle.keyNumber.toLowerCase().includes(searchLower)) ||
          (vehicle.chargerNumber && vehicle.chargerNumber.toLowerCase().includes(searchLower)) ||
          (vehicle.unloadLocation?.name && vehicle.unloadLocation.name.toLowerCase().includes(searchLower))
        );
      });
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [searchTerm, vehicles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

    if (name === 'fromBranch' && value) {
      fetchVehiclesForBranch(value);
    } else if (name === 'fromBranch') {
      setVehicles([]);
      setFilteredVehicles([]);
      setSelectedVehicles([]);
    }
  };

  const handleVehicleSelect = (vehicleId, isSelected) => {
    setSelectedVehicles((prev) => {
      if (isSelected) {
        return [...prev, vehicleId];
      } else {
        return prev.filter((id) => id !== vehicleId);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newErrors = {};
    if (!formData.fromBranch) newErrors.fromBranch = 'From branch is required';
    if (!formData.toBranch) newErrors.toBranch = 'To branch is required';
    if (selectedVehicles.length === 0) newErrors.vehicles = 'Please select at least one vehicle';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        fromBranch: formData.fromBranch,
        toBranch: formData.toBranch,
        items: selectedVehicles.map((vehicleId) => ({ vehicle: vehicleId }))
      };

      const response = await axiosInstance.post('/transfers', payload);
      const fromBranchData = branches.find((b) => b._id === formData.fromBranch);
      const toBranchData = branches.find((b) => b._id === formData.toBranch);
      const selectedVehicleData = vehicles.filter((v) => selectedVehicles.includes(v._id));

      setChallanData({
        transferDetails: response.data,
        fromBranch: fromBranchData,
        toBranch: toBranchData,
        vehicles: selectedVehicleData
      });

      showSuccess('Stock transferred successfully!').then(() => {
        setShowChallanModal(true);
      });

      setFormData({ fromBranch: formData.fromBranch, toBranch: '' });
      fetchVehiclesForBranch(formData.fromBranch);
    } catch (error) {
      console.error('Error transferring stock:', error);
      showFormSubmitError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/upload-challan');
  };

  const handleCloseModal = () => {
    setShowChallanModal(false);
  };

  return (
    <div className="form-container">
      <div className="title">TRANSFER STOCK TO NETWORK</div>
      <div className="form-card">
        <div className="form-body">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">From</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect name="fromBranch" value={formData.fromBranch} onChange={handleChange} invalid={!!errors.fromBranch}>
                    <option value="">-Select-</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.fromBranch && <div className="invalid-feedback">{errors.fromBranch}</div>}
              </div>

              <div className="input-box">
                <div className="details-container">
                  <span className="details">To</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect name="toBranch" value={formData.toBranch} onChange={handleChange} invalid={!!errors.toBranch}>
                    <option value="">-Select-</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.toBranch && <div className="invalid-feedback">{errors.toBranch}</div>}
              </div>

              {errors.vehicles && <div className="alert alert-danger">{errors.vehicles}</div>}

              <div className="button-row">
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Transferring...' : 'Transfer'}
                </button>
                <button type="button"  className="reset-button" onClick={handleCancel} disabled={isSubmitting}>
                  Cancel
                </button>
              </div>
            </div>
          </form>

          {vehicles.length > 0 ? (
            <div className="vehicle-table mt-4 p-3">
              <h5>In-Stock Vehicle Details</h5>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilSearch} style={{ width: '20px' }} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Search vehicles by chassis, model, engine, etc..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>
              </CRow>

              <CTable striped bordered hover responsive>
                <CTableHead className="table-header-fixed">
                  <CTableRow>
                    <CTableHeaderCell>
                      {/* <CFormCheck
                        onChange={handleSelectAll}
                        checked={selectedVehicles.length === filteredVehicles.length && filteredVehicles.length > 0}
                      /> */}
                    </CTableHeaderCell>
                    <CTableHeaderCell>Sr. No</CTableHeaderCell>
                    <CTableHeaderCell>Unload Location</CTableHeaderCell>
                    <CTableHeaderCell>Inward Date</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Vehicle Model</CTableHeaderCell>
                    <CTableHeaderCell>Color</CTableHeaderCell>
                    <CTableHeaderCell>Battery No</CTableHeaderCell>
                    <CTableHeaderCell>Key No</CTableHeaderCell>
                    <CTableHeaderCell>Chassis No</CTableHeaderCell>
                    <CTableHeaderCell>Engine No</CTableHeaderCell>
                    <CTableHeaderCell>Motor No</CTableHeaderCell>
                    <CTableHeaderCell>Charger No</CTableHeaderCell>
                    <CTableHeaderCell>Current Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle, index) => (
                      <CTableRow key={vehicle._id}>
                        <CTableDataCell>
                          <CFormCheck
                            onChange={(e) => handleVehicleSelect(vehicle._id, e.target.checked)}
                            checked={selectedVehicles.includes(vehicle._id)}
                          />
                        </CTableDataCell>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{vehicle.unloadLocation?.name || ''}</CTableDataCell>
                        <CTableDataCell>{new Date(vehicle.createdAt).toLocaleDateString()}</CTableDataCell>
                        <CTableDataCell>{vehicle.type}</CTableDataCell>
                        <CTableDataCell>{vehicle.modelName || ''}</CTableDataCell>
                        <CTableDataCell>{vehicle.color?.name || ''}</CTableDataCell>
                        <CTableDataCell>{vehicle.batteryNumber || ''}</CTableDataCell>
                        <CTableDataCell>{vehicle.keyNumber || ''}</CTableDataCell>
                        <CTableDataCell>{vehicle.chassisNumber}</CTableDataCell>
                        <CTableDataCell>{vehicle.engineNumber || ''}</CTableDataCell>
                        <CTableDataCell>{vehicle.motorNumber || ''}</CTableDataCell>
                        <CTableDataCell>{vehicle.chargerNumber || ''}</CTableDataCell>
                        <CTableDataCell>{vehicle.status}</CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={14} className="text-center">
                        No vehicles match your search criteria
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          ) : formData.fromBranch ? (
            <div className="alert alert-info mt-4">No in-stock vehicles found for the selected branch.</div>
          ) : null}
        </div>
      </div>

      <CModal visible={showChallanModal} onClose={handleCloseModal} size="xl" scrollable>
        <CModalHeader closeButton>
          <CModalTitle>Transfer Challan Preview</CModalTitle>
        </CModalHeader>
        <CModalBody>{challanData && <TransferChallan {...challanData} />}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}

export default StockTransfer;
