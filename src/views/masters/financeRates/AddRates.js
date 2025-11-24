import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLocationPin, cilUser } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';
import FormButtons from '../../../utils/FormButtons';

function AddRates() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const hasBranch = !!storedUser.branch?._id;
  const [formData, setFormData] = useState({
    branchId: hasBranch ? storedUser.branch?._id : '',
    providerId: '',
    gcRate: ''
  });
  const [branches, setBranches] = useState([]);
  const [providers, setProviders] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchFinanceRates(id);
    }
  }, [id]);
  const fetchFinanceRates = async (id) => {
    try {
      const res = await axiosInstance.get(`/financers/rates/${id}`);
      const rateData = res.data.data;

      setFormData({
        branchId: rateData.branch,
        providerId: rateData.financeProvider,
        gcRate: rateData.gcRate
      });
    } catch (error) {
      console.error('Error fetching finance rates:', error);
    }
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
    const fetchProviders = async () => {
      try {
        const response = await axiosInstance.get('/financers/providers');
        setProviders(response.data.data || []);
      } catch (error) {
        console.error('Error fetching finance providers:', error);
        showError(error);
      }
    };

    fetchProviders();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.branchId) formErrors.branchId = 'This field is required';
    if (!formData.providerId) formErrors.providerId = 'This field is required';
    if (!formData.gcRate) formErrors.gcRate = 'This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    const payload = {
      ...formData,
      gcRate: parseFloat(formData.gcRate)
    };

    try {
      if (id) {
        await axiosInstance.put(`/financers/rates/${id}`, payload);
        await showFormSubmitToast('Finance rates updated successfully!', () => navigate('/financer-rates/rates-list'));

        navigate('/financer-rates/rates-list');
      } else {
        await axiosInstance.post('/financers/rates', payload);
        await showFormSubmitToast('Finance rates added successfully!', () => navigate('/financer-rates/rates-list'));

        navigate('/financer-rates/rates-list');
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/financer-rates/rates-list');
  };
  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} Finance Rates</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Branch Name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>
                  <CFormSelect name="branchId" value={formData.branchId} onChange={handleChange}>
                    <option value="">-Select-</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.branchId && <p className="error">{errors.branchId}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Financer Name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect name="providerId" value={formData.providerId} onChange={handleChange}>
                    <option value="">-Select-</option>
                    {providers.map((provider) => (
                      <option key={provider._id} value={provider._id}>
                        {provider.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.providerId && <p className="error">{errors.providerId}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">GC Rate</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput type="text" name="gcRate" value={formData.gcRate} onChange={handleChange} />
                </CInputGroup>
                {errors.gcRate && <p className="error">{errors.gcRate}</p>}
              </div>
              <FormButtons onCancel={handleCancel} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddRates;
