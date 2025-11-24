import React, { useState, useEffect } from 'react';
import '../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilDollar, cilLocationPin } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showError, showFormSubmitError, showFormSubmitToast } from '../../utils/sweetAlerts';
import axiosInstance from '../../axiosInstance';

function AddOpeningBalance() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const hasBranch = !!storedUser.branch?._id;
  const [formData, setFormData] = useState({
    branch: hasBranch ? storedUser.branch?._id : '',
    amount: ''
  });

  const [branches, setBranches] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

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
    if (id) {
      fetchBranch(id);
    }
  }, [id]);

  const fetchBranch = async (branchId) => {
    try {
      const res = await axiosInstance.get(`/branches/${branchId}`);
      const branchData = res.data.data;
      setFormData({
        branch: branchData._id,
        amount: branchData.opening_balance || ''
      });
    } catch (error) {
      console.error('Error fetching branch:', error);
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
    if (!formData.branch) formErrors.branch = 'Branch is required';
    if (!formData.amount || isNaN(formData.amount)) formErrors.amount = 'Valid amount is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        note: id ? 'Updated opening balance' : 'Initial opening balance'
      };

      // Use PATCH for updates, POST for new entries
      if (id) {
        await axiosInstance.patch(`/branches/${formData.branch}/opening-balance`, payload);
      } else {
        await axiosInstance.post(`/branches/${formData.branch}/opening-balance`, payload);
      }

      await showFormSubmitToast(id ? 'Opening balance updated successfully!' : 'Opening balance added successfully!', () => {
        navigate('/opening-balance');
      });
    } catch (error) {
      console.error('Error saving opening balance:', error);
      showFormSubmitError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/opening-balance');
  };

  return (
    <div>
      <h4>{id ? 'Update' : 'Add'} Opening Balance</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Branch</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>

                  {/* <CFormSelect name="unloadLocation" value={formData.unloadLocation} onChange={handleChange}>
                    <option value="">-Select-</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </CFormSelect> */}
                  <CFormSelect name="branch" value={formData.branch} onChange={handleChange} disabled={isSubmitting}>
                    <option value="">-Select-</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.branch && <p className="error">{errors.branch}</p>}
              </div>

              <div className="input-box">
                <div className="details-container">
                  <span className="details">Opening Balance Amount</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilDollar} />
                  </CInputGroupText>
                  <CFormInput
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    disabled={isSubmitting}
                  />
                </CInputGroup>
                {errors.amount && <p className="error">{errors.amount}</p>}
              </div>

              <div className="button-row">
                <button type="submit" className="simple-button primary-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="simple-button secondary-button" onClick={handleCancel} disabled={isSubmitting}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddOpeningBalance;
