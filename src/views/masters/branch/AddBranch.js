import React, { useEffect, useState } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBarcode, cilBuilding, cilEnvelopeClosed, cilHome, cilImage, cilLocationPin, cilMap, cilPhone } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';
import FormButtons from '../../../utils/FormButtons';

function AddBranch() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    gst_number: '',
    logo1: '',
    logo2: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchBranch(id);
    }
  }, [id]);

  const fetchBranch = async (id) => {
    try {
      const res = await axiosInstance.get(`/branches/${id}`);
      setFormData(res.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === 'file') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0] || ''
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.name) formErrors.name = 'This field is required';
    if (!formData.address) formErrors.address = 'This field is required';
    if (!formData.city) formErrors.city = 'This fieldrequired';
    if (!formData.state) formErrors.state = 'This field is required';
    if (!formData.pincode) formErrors.pincode = 'This field is required';
    if (!formData.phone) formErrors.phone = 'This field is required';
    if (!formData.email) formErrors.email = 'This field is required';
    if (!formData.gst_number) {
      formErrors.gst_number = 'This field is required';
    } else {
      const gstRegex = /^([0][1-9]|[1-2][0-9]|3[0-5])[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gst_number)) {
        formErrors.gst_number = 'Please enter a valid GST number';
      }
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      if (id) {
        await axiosInstance.put(`/branches/${id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await showFormSubmitToast('Location updated successfully!', () => navigate('/branch/branch-list'));
      } else {
        await axiosInstance.post('/branches', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await showFormSubmitToast('Location added successfully!', () => navigate('/branch/branch-list'));
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/branch/branch-list');
  };
  return (
    <div className="form-container">
      <div className="title">{id ? 'Edit' : 'Add'} Branch</div>
      <div className="form-card">
        <div className="form-body">
          <form onSubmit={handleSubmit}>
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
                  <CFormInput type="text" name="name" value={formData.name} onChange={handleChange} />
                </CInputGroup>
                {errors.name && <p className="error">{errors.name}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Address</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilMap} />
                  </CInputGroupText>
                  <CFormInput type="text" name="address" value={formData.address} onChange={handleChange} />
                </CInputGroup>
                {errors.address && <p className="error">{errors.address}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">City</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>
                  <CFormInput type="text" name="city" value={formData.city} onChange={handleChange} />
                </CInputGroup>
                {errors.city && <p className="error">{errors.city}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">State</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilBuilding} />
                  </CInputGroupText>
                  <CFormInput type="text" name="state" value={formData.state} onChange={handleChange} />
                </CInputGroup>
                {errors.state && <p className="error">{errors.state}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Pincode</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilHome} />
                  </CInputGroupText>
                  <CFormInput type="text" name="pincode" onChange={handleChange} value={formData.pincode} />
                </CInputGroup>
                {errors.pincode && <p className="error">{errors.pincode}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Phone</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilPhone} />
                  </CInputGroupText>
                  <CFormInput type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </CInputGroup>
                {errors.phone && <p className="error">{errors.phone}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Email</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilEnvelopeClosed} />
                  </CInputGroupText>
                  <CFormInput type="text" name="email" value={formData.email} onChange={handleChange} />
                </CInputGroup>
                {errors.email && <p className="error">{errors.email}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">GST Number</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilBarcode} />
                  </CInputGroupText>
                  <CFormInput type="text" name="gst_number" onChange={handleChange} value={formData.gst_number} />
                </CInputGroup>
                {errors.gst_number && <p className="error">{errors.gst_number}</p>}
              </div>
              <div className="input-box">
                <span className="details">Logo1</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilImage} />
                  </CInputGroupText>
                  <CFormInput type="file" name="logo1" onChange={handleChange} />
                </CInputGroup>
              </div>

              <div className="input-box">
                <span className="details">Logo2</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilImage} />
                  </CInputGroupText>
                  <CFormInput type="file" name="logo2" onChange={handleChange} />
                </CInputGroup>
              </div>
              <div className="input-box">
                <span className="details">Is active?</span>
                <CFormSwitch
                  className="custom-switch-toggle"
                  name="is_active"
                  label={formData.is_active ? 'true' : 'false'}
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                />
              </div>
            </div>
            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddBranch;
