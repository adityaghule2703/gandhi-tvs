// AddExpense.js
import React, { useState, useEffect } from 'react';
import '../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser } from '@coreui/icons';
import { showFormSubmitError, showFormSubmitToast } from '../../utils/sweetAlerts';
import axiosInstance from '../../axiosInstance';
import ExpenseList from './ExpenseList';
import { hasPermission } from '../../utils/permissionUtils';

function AddExpense() {
  const [formData, setFormData] = useState({ name: '' });
  const [errors, setErrors] = useState({});
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axiosInstance.get('/expense-accounts');
      setExpenses(response.data.data.expenseAccounts);
    } catch (error) {
      console.error('Error fetching expenses:', error);
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

    if (!formData.name) formErrors.name = 'This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      await axiosInstance.post('/expense-accounts', formData);
      await showFormSubmitToast('Expense added successfully!');
      setFormData({ name: '' });
      fetchExpenses();
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  return (
    <div>
      <h4>Expense Account Master</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput type="text" name="name" value={formData.name} onChange={handleChange} />
                </CInputGroup>
                {errors.name && <p className="error">{errors.name}</p>}
              </div>
              <div className="button-row">
                {hasPermission('EXPENSE_ACCOUNT', 'CREATE') && (
                  <button type="submit" className="simple-button primary-button">
                    Save
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      <ExpenseList expenses={expenses} onDelete={fetchExpenses} />
    </div>
  );
}

export default AddExpense;
