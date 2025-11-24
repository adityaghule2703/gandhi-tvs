import React, { useState, useEffect } from 'react';
import '../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBank, cilDollar, cilList, cilLocationPin, cilUser } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../utils/sweetAlerts';
import axiosInstance from '../../axiosInstance';
import FormButtons from '../../utils/FormButtons';

function CashVoucher() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const hasBranch = !!storedUser.branch?._id;
  const [formData, setFormData] = useState({
    recipientName: '',
    voucherType: 'debit',
    expenseType: '',
    amount: '',
    remark: '',
    cashLocation: '',
    branch: hasBranch ? storedUser.branch?._id : ''
  });
  const [errors, setErrors] = useState({});
  const [cashLocations, setCashLocations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get('/branches');
        setBranches(response.data.data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
        showError(error);
      }
    };

    fetchBranches();
  }, []);
  useEffect(() => {
    const fetchCashLocations = async () => {
      try {
        const response = await axiosInstance.get('/cash-locations');
        setCashLocations(response.data.data.cashLocations || []);
      } catch (error) {
        console.error('Error fetching cash location:', error);
        showError(error);
      }
    };

    fetchCashLocations();
  }, []);
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await axiosInstance.get('/expense-accounts');
        setExpenses(response.data.data.expenseAccounts || []);
      } catch (error) {
        console.error('Error fetching expense:', error);
        showError(error);
      }
    };

    fetchExpense();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.recipientName) formErrors.recipientName = 'This field is required';
    if (!formData.expenseType) formErrors.expenseType = 'This field is required';
    if (!formData.amount) formErrors.amount = 'This field is required';
    if (!formData.cashLocation) formErrors.cashLocation = 'This field is required';
    if (!formData.branch) formErrors.branch = 'This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      await axiosInstance.post('/cash-vouchers', formData);
      await showFormSubmitToast('Cash Voucher added successfully!', () => navigate('/cash-receipt'));

      navigate('/cash-receipt');
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/cash-receipt');
  };
  return (
    <div>
      <h4>Cash Voucher</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Receipant Name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} />
                </CInputGroup>
                {errors.recipientName && <p className="error">{errors.recipientName}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Branch</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>
                  {/* {hasBranch ? (
                    <CFormInput value={storedUser.branch?.name || ''} readOnly />
                  ) : ( */}
                  <CFormSelect name="branch" value={formData.branch} onChange={handleChange}>
                    <option value="">-Select-</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </CFormSelect>
                  {/* )} */}
                </CInputGroup>
                {errors.branch && <p className="error">{errors.branch}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Expense Type</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect name="expenseType" value={formData.expenseType} onChange={handleChange}>
                    <option value="">-Select-</option>
                    {expenses.map((expense) => (
                      <option key={expense._id} value={expense.name}>
                        {expense.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.expenseType && <p className="error">{errors.expenseType}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Amount</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilDollar} />
                  </CInputGroupText>
                  <CFormInput type="text" name="amount" value={formData.amount} onChange={handleChange} />
                </CInputGroup>
                {errors.amount && <p className="error">{errors.amount}</p>}
              </div>
              <div className="input-box">
                <span className="details">Remark</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilList} />
                  </CInputGroupText>
                  <CFormInput type="text" name="remark" value={formData.remark} onChange={handleChange} />
                </CInputGroup>
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Cash Location</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilBank} />
                  </CInputGroupText>
                  <CFormSelect name="cashLocation" value={formData.cashLocation} onChange={handleChange}>
                    <option value="">-Select-</option>
                    {cashLocations.map((location) => (
                      <option key={location._id} value={location.name}>
                        {location.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.cashLocation && <p className="error">{errors.cashLocation}</p>}
              </div>
            </div>
            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
}
export default CashVoucher;
