import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser } from '@coreui/icons';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';
import RangeList from './RangeList';
import { hasPermission } from '../../../utils/permissionUtils';

function BrokerRange() {
  const [formData, setFormData] = useState({ minAmount: '', maxAmount: '' });
  const [errors, setErrors] = useState({});
  const [ranges, setRanges] = useState([]);

  useEffect(() => {
    fetchRanges();
  }, []);

  const fetchRanges = async () => {
    try {
      const response = await axiosInstance.get('/commission-ranges');
      setRanges(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setRanges([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.minAmount) formErrors.minAmount = 'This field is required';
    if (!formData.maxAmount) formErrors.maxAmount = 'This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      await axiosInstance.post('/commission-ranges', formData);
      await showFormSubmitToast('Payment mode added successfully!');
      setFormData({ payment_mode: '' });
      fetchRanges();
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  return (
    <div>
      <h4>Add Broker Commission Range</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Min Amount</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput type="number" name="minAmount" value={formData.minAmount} onChange={handleChange} />
                </CInputGroup>
                {errors.minAmount && <p className="error">{errors.minAmount}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Max Amount</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput
                    type="number"
                    name="maxAmount"
                    value={formData.maxAmount}
                    onChange={handleChange}
                    placeholder="Enter payment mode"
                  />
                </CInputGroup>
                {errors.maxAmount && <p className="error">{errors.maxAmount}</p>}
              </div>
              <div className="button-row">
                {hasPermission('BROKER', 'CREATE') && (
                  <button type="submit" className="simple-button primary-button">
                    Save
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* <RangeList ranges={ranges} onDelete={fetchRanges} /> */}
    </div>
  );
}

export default BrokerRange;
