import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from 'utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';
import FormButtons from '../../../utils/FormButtons';

function AddFinancer() {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchFinancer(id);
    }
  }, [id]);
  const fetchFinancer = async (id) => {
    try {
      const res = await axiosInstance.get(`/financers/providers/${id}`);
      setFormData(res.data.data);
    } catch (error) {
      console.error('Error fetching financer:', error);
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
      if (id) {
        await axiosInstance.put(`/financers/providers/${id}`, formData);
        await showFormSubmitToast('Financer updated successfully!', () => navigate('/financer/financer-list'));

        navigate('/financer/financer-list');
      } else {
        await axiosInstance.post('/financers/providers', formData);
        await showFormSubmitToast('Financer added successfully!', () => navigate('/financer/financer-list'));

        navigate('/financer/financer-list');
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/financer/financer-list');
  };
  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} Financer</h4>
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
              <FormButtons onCancel={handleCancel} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddFinancer;
