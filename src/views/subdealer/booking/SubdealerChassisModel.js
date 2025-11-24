import React, { useState, useEffect } from 'react';
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CButton,
  CFormSelect,
  CSpinner,
  CFormInput,
  CFormTextarea,
  CForm
} from '@coreui/react';
import axiosInstance from 'src/axiosInstance.js';
import { showError } from 'src/utils/sweetAlerts';

const SubDealerChassisNumberModal = ({ show, onClose, onSave, isLoading, booking, isUpdate = false }) => {
  const [chassisNumber, setChassisNumber] = useState(booking?.chassisNumber || '');
  const [reason, setReason] = useState('');
  const [availableChassisNumbers, setAvailableChassisNumbers] = useState([]);
  const [loadingChassisNumbers, setLoadingChassisNumbers] = useState(false);
  const [previousChassis, setPreviousChassis] = useState('');

  useEffect(() => {
    if (show && booking) {
      if (isUpdate) {
        setPreviousChassis(booking.chassisNumber || '');
      }
      fetchAvailableChassisNumbers();
    }
  }, [show, booking, isUpdate]);

  const fetchAvailableChassisNumbers = async () => {
    try {
      setLoadingChassisNumbers(true);
      const response = await axiosInstance.get(`/vehicles/model/${booking.model._id}/${booking.color._id}/chassis-numbers`);
      // Include the previous chassis number in available options if it's an update
      const chassisNumbers = response.data.data.chassisNumbers || [];
      if (isUpdate && booking.chassisNumber && !chassisNumbers.includes(booking.chassisNumber)) {
        chassisNumbers.unshift(booking.chassisNumber);
      }
      setAvailableChassisNumbers(chassisNumbers);
    } catch (error) {
      console.error('Error fetching chassis numbers:', error);
      showError(error);
    } finally {
      setLoadingChassisNumbers(false);
    }
  };

  const handleSubmit = () => {
    if (!chassisNumber.trim()) {
      showError('Please enter a chassis number');
      return;
    }
    if (isUpdate && !reason.trim()) {
      showError('Please enter a reason for updating');
      return;
    }

    const payload = {
      chassisNumber: chassisNumber.trim(),
      ...(isUpdate && { reason })
    };

    onSave(payload);
  };

  return (
    <CModal visible={show} onClose={onClose} alignment="center">
      <CModalHeader>
        <h5 className="modal-title">{isUpdate ? 'Update' : 'Allocate'} Chassis Number</h5>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <div className="mb-3">
            <CFormLabel>Model: {booking?.model?.model_name}</CFormLabel>
          </div>
          <div className="mb-3">
            <CFormLabel>Color: {booking?.color?.name}</CFormLabel>
          </div>

          {isUpdate && previousChassis && (
            <div className="mb-3">
              <CFormLabel>Previously Allocated Chassis:</CFormLabel>
              <div className="form-control bg-light">{previousChassis}</div>
            </div>
          )}

          <div className="mb-3">
            <CFormLabel htmlFor="chassisNumber">{isUpdate ? 'New Chassis Number' : 'Chassis Number'}</CFormLabel>
            {loadingChassisNumbers ? (
              <div className="text-center">
                <CSpinner size="sm" />
                <span className="ms-2">Loading chassis numbers...</span>
              </div>
            ) : availableChassisNumbers.length > 0 ? (
              <CFormSelect value={chassisNumber} onChange={(e) => setChassisNumber(e.target.value)} required>
                <option value="">Select a chassis number</option>
                {availableChassisNumbers.map((num) => (
                  <option key={num} value={num}>
                    {num}
                    {num === previousChassis && ' (Previous Allocation)'}
                  </option>
                ))}
              </CFormSelect>
            ) : (
              <CFormInput
                type="text"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                placeholder="Enter chassis number"
                required
              />
            )}
          </div>

          {isUpdate && (
            <div className="mb-3">
              <CFormLabel htmlFor="reason">Reason for Update</CFormLabel>
              <CFormTextarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={3}
                placeholder="Enter reason for changing chassis number"
              />
            </div>
          )}
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </CButton>
        <CButton
          color="primary"
          onClick={handleSubmit}
          disabled={isLoading || (loadingChassisNumbers && availableChassisNumbers.length === 0)}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default SubDealerChassisNumberModal;
