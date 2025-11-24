import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser } from '@coreui/icons';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';
import PaymentModeList from './PaymentModeList';
import { hasPermission } from '../../../utils/permissionUtils';

function PaymentMode() {
  const [formData, setFormData] = useState({ payment_mode: '' });
  const [errors, setErrors] = useState({});
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axiosInstance.get('/banksubpaymentmodes');
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
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

    if (!formData.payment_mode) formErrors.payment_mode = 'This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      await axiosInstance.post('/banksubpaymentmodes', formData);
      await showFormSubmitToast('Payment mode added successfully!');
      setFormData({ payment_mode: '' });
      fetchPayments();
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  return (
    <div>
      <h4>Payment Mode Master</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Payment Mode</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput
                    type="text"
                    name="payment_mode"
                    value={formData.payment_mode}
                    onChange={handleChange}
                    placeholder="Enter payment mode"
                  />
                </CInputGroup>
                {errors.payment_mode && <p className="error">{errors.payment_mode}</p>}
              </div>
              {hasPermission('BANK_SUB_PAYMENT_MODE', 'CREATE') && (
                <div className="button-row">
                  <button type="submit" className="simple-button primary-button">
                    Save
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      <PaymentModeList payments={payments} onDelete={fetchPayments} />
    </div>
  );
}

export default PaymentMode;
