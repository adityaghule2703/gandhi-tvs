import React, { useState, useEffect } from 'react';
import '../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBank, cilDollar, cilList, cilLocationPin, cilUser } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../utils/sweetAlerts';
import axiosInstance from '../../axiosInstance';
import FormButtons from '../../utils/FormButtons';

function WorkshopReceipt() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const hasBranch = !!storedUser.branch?._id;
  const [formData, setFormData] = useState({
    recipientName: '',
    voucherType: '',
    receiptType: '',
    amount: '',
    remark: '',
    bankLocation: '',
    branch: hasBranch ? storedUser.branch?._id : ''
  });
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [banks, setBanks] = useState([]);
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
    const fetchBanks = async () => {
      try {
        const response = await axiosInstance.get('/banks');
        setBanks(response.data.data.banks || []);
      } catch (error) {
        console.error('Error fetching banks:', error);
        showError(error);
      }
    };

    fetchBanks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.recipientName) formErrors.recipientName = 'This field is required';
    if (!formData.receiptType) formErrors.receiptType = 'This field is required';
    if (!formData.amount) formErrors.amount = 'This field is required';
    if (!formData.voucherType) formErrors.voucherType = 'This field is required';
    if (!formData.bankLocation) formErrors.bankLocation = 'This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      await axiosInstance.post('/workshop-receipts', formData);
      await showFormSubmitToast('Data added successfully!', () => navigate('/cash-receipt'));

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
      <h4>Workshop Cash Receipt</h4>
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
                  <CFormSelect name="branch" value={formData.branch} onChange={handleChange}>
                    <option value="">-Select-</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.branch && <p className="error">{errors.branch}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Voucher Type</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect type="text" name="voucherType" value={formData.voucherType} onChange={handleChange}>
                    <option value="">-Select</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.voucherType && <p className="error">{errors.voucherType}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Receipt Type</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect type="text" name="receiptType" value={formData.receiptType} onChange={handleChange}>
                    <option value="">-Select</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Other">Other</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.receiptType && <p className="error">{errors.receiptType}</p>}
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
                  <span className="details">Bank Location</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilBank} />
                  </CInputGroupText>
                  <CFormSelect name="bankLocation" value={formData.bankLocation} onChange={handleChange}>
                    <option value="">-Select-</option>
                    {banks.map((bank) => (
                      <option key={bank._id} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.bankLocation && <p className="error">{errors.bankLocation}</p>}
              </div>
            </div>
            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
}
export default WorkshopReceipt;
