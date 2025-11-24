import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBank, cilUser } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from 'src/utils/sweetAlerts';
import axiosInstance from 'src/axiosInstance';
import FormButtons from 'src/utils/FormButtons';

function SubdealerPayment() {
  const [formData, setFormData] = useState({
    subdealer_id: '',
    month: '',
    year: '',
    payment_method: '',
    transaction_reference: '',
    remarks: ''
  });
  const [errors, setErrors] = useState({});
  const [subdealers, setSubdealers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchSubdealers();
  }, [id]);

  const fetchSubdealers = async () => {
    try {
      const response = await axiosInstance.get('/subdealers');
      setSubdealers(response.data.data.subdealers || []);
    } catch (error) {
      console.error('Error fetching subdealers:', error);
      showError(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let formErrors = {};

    if (!formData.subdealer_id) formErrors.subdealer_id = 'Subdealer is required';
    if (!formData.transaction_reference) formErrors.transaction_reference = 'Reference Number is required';
    if (!formData.payment_method) formErrors.payment_method = 'Payment mode is required';
    if (!formData.month) formErrors.month = 'Month is required';
    if (!formData.year) formErrors.year = ' Year is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Extract just the month part from the YYYY-MM format and convert to number
      // const monthNumber = parseInt(formData.month.split('-')[1], 10);

      const submissionData = {
        subdealer_id: formData.subdealer_id,
        // month: monthNumber, // Send as number (e.g., 8)
        month: formData.month,
        year: parseInt(formData.year, 10), // Ensure year is a number too
        transaction_reference: formData.transaction_reference,
        payment_method: formData.payment_method,
        remarks: formData.remarks || ''
      };

      await axiosInstance.post(`/commission-payments`, submissionData);

      await showFormSubmitToast('Account balance added successfully!');
      navigate('/subdealer-account/onaccount-balance');
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/subdealer-account/onaccount-balance');
  };

  return (
    <div>
      <h4>Subdealer Commission Disbursement</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Subdealer Name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect name="subdealer_id" value={formData.subdealer_id} onChange={handleChange} invalid={!!errors.subdealer_id}>
                    <option value="">-Select-</option>
                    {subdealers.map((subdealer) => (
                      <option key={subdealer._id} value={subdealer._id}>
                        {subdealer.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.subdealer_id && <p className="error">{errors.subdealer_id}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Month</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  {/* <CFormInput type="month" name="month" value={formData.month} onChange={handleChange} invalid={!!errors.month} /> */}

                  <CFormSelect name="month" value={formData.month} onChange={handleChange}>
                    <option value="">-Select-</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.month && <p className="error">{errors.month}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Year</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect name="year" value={formData.year} onChange={handleChange} invalid={!!errors.year}>
                    <option value="">-Select Year-</option>
                    {[...Array(20)].map((_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </CFormSelect>
                </CInputGroup>
                {errors.year && <p className="error">{errors.year}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Reference Number</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput
                    type="text"
                    name="transaction_reference"
                    value={formData.transaction_reference}
                    onChange={handleChange}
                    invalid={!!errors.transaction_reference}
                  />
                </CInputGroup>
                {errors.transaction_reference && <p className="error">{errors.transaction_reference}</p>}
              </div>

              {/* <div className="input-box">
                <div className="details-container">
                  <span className="details">Amount</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput 
                    type="number" 
                    name="amount" 
                    value={formData.amount} 
                    onChange={handleChange} 
                    min="0"
                    step="0.01"
                    invalid={!!errors.amount}
                  />
                </CInputGroup>
                {errors.amount && <p className="error">{errors.amount}</p>}
              </div> */}

              <div className="input-box">
                <div className="details-container">
                  <span className="details">Payment Mode</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    invalid={!!errors.payment_method}
                  >
                    <option value="">-Select-</option>
                    <option value="ON_ACCOUNT">On Account</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">Cheque</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.payment_method && <p className="error">{errors.payment_method}</p>}
              </div>

              <div className="input-box">
                <div className="details-container">
                  <span className="details">Remarks</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput type="text" name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Optional remarks" />
                </CInputGroup>
              </div>
            </div>

            <FormButtons onCancel={handleCancel} isSubmitting={isSubmitting} submitText={id ? 'Update' : 'Add'} />
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubdealerPayment;
