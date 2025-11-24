import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSelect, CFormSwitch } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCode, cilDollar, cilFile, cilKeyboard, cilListRich, cilStar, cilText } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import FormButtons from '../../../utils/FormButtons';
import axiosInstance from '../../../axiosInstance';

function AddHeader() {
  const [formData, setFormData] = useState({
    header_key: '',
    category_key: '',
    priority: '',
    type: '',
    page_no: '',
    hsn_code: '',
    gst_rate: '',
    is_mandatory: '',
    is_discount: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchHeader(id);
    }
  }, [id]);

  const fetchHeader = async (id) => {
    try {
      const res = await axiosInstance.get(`/headers/id/${id}`);
      // setFormData(res.data.data.header);

      const header = res.data.data.header;

      setFormData({
        header_key: header.header_key || '',
        category_key: header.category_key || '',
        priority: header.priority || '',
        type: header.type || '',
        page_no: header.metadata?.page_no || '',
        hsn_code: header.metadata?.hsn_code || '',
        gst_rate: header.metadata?.gst_rate || '',
        is_mandatory: header.is_mandatory ?? false,
        is_discount: header.is_discount ?? false
      });
    } catch (error) {
      console.error('Error fetching document:', error);
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

    if (!formData.header_key) formErrors.header_key = 'This field is required';
    if (!formData.type) formErrors.type = 'This field is required';
    if (!formData.priority) formErrors.priority = 'This field is required';
    if (!formData.page_no) formErrors.page_no = 'This field is required';
    if (!formData.hsn_code) formErrors.hsn_code = 'This field is required';
    if (!formData.gst_rate) formErrors.gst_rate = 'This field is required';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const payload = {
      header_key: formData.header_key,
      category_key: formData.category_key,
      type: formData.type,
      priority: parseInt(formData.priority),
      is_mandatory: formData.is_mandatory,
      is_discount: formData.is_discount,
      metadata: {
        page_no: parseInt(formData.page_no),
        hsn_code: formData.hsn_code,
        gst_rate: formData.gst_rate
      }
    };

    try {
      if (id) {
        await axiosInstance.patch(`/headers/${id}`, payload);
        await showFormSubmitToast('Header updated successfully!', () => navigate('/headers/headers-list'));
      } else {
        await axiosInstance.post('/headers', payload);
        await showFormSubmitToast('Header added successfully!', () => navigate('/headers/headers-list'));
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/headers/headers-list');
  };
  return (
    <div className="form-container">
      <div className="title">{id ? 'Edit' : 'Add'} Header</div>
      <div className="form-card">
        <div className="form-body">
          <form onSubmit={handleSubmit}>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilText} />
                  </CInputGroupText>
                  <CFormInput type="text" name="header_key" value={formData.header_key} onChange={handleChange} />
                </CInputGroup>
                {errors.header_key && <p className="error">{errors.header_key}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Category key</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilText} />
                  </CInputGroupText>
                  <CFormSelect name="category_key" value={formData.category_key} onChange={handleChange}>
                    <option value="">-Select-</option>
                    <option value="vehicle_price">Vehicle Price</option>
                    <option value="AddONservices">Add on service</option>
                    <option value="Accesories">Accessories</option>
                  </CFormSelect>
                </CInputGroup>
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Type</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilListRich} />
                  </CInputGroupText>
                  <CFormSelect name="type" value={formData.type} onChange={handleChange}>
                    <option value="">-Select-</option>
                    <option value="EV">EV</option>
                    <option value="ICE">ICE</option>
                    <option value="CSD">CSD</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.type && <p className="error">{errors.type}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Priority no</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilStar} />
                  </CInputGroupText>
                  <CFormInput type="text" name="priority" onChange={handleChange} value={formData.priority} />
                </CInputGroup>
                {errors.priority && <p className="error">{errors.priority}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Page number</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilFile} />
                  </CInputGroupText>
                  <CFormInput type="test" name="page_no" onChange={handleChange} value={formData.page_no} />
                </CInputGroup>
                {errors.page_no && <p className="error">{errors.page_no}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">HSN code</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilCode} />
                  </CInputGroupText>
                  <CFormInput type="test" name="hsn_code" onChange={handleChange} value={formData.hsn_code} />
                </CInputGroup>
                {errors.hsn_code && <p className="error">{errors.hsn_code}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">GST rate</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilDollar} />
                  </CInputGroupText>
                  <CFormInput type="test" name="gst_rate" onChange={handleChange} value={formData.gst_rate} />
                </CInputGroup>
                {errors.gst_rate && <p className="error">{errors.gst_rate}</p>}
              </div>
              <div className="input-box">
                <span className="details">Is Mandatory?</span>
                <CFormSwitch
                  className="custom-switch-toggle"
                  name="is_mandatory"
                  label={formData.is_mandatory ? 'Yes' : 'No'}
                  checked={formData.is_mandatory}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_mandatory: e.target.checked }))}
                />
              </div>

              <div className="input-box">
                <span className="details">Is Discount?</span>
                <CFormSwitch
                  className="custom-switch-toggle"
                  name="is_discount"
                  label={formData.is_discount ? 'Yes' : 'No'}
                  checked={formData.is_discount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_discount: e.target.checked }))}
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
export default AddHeader;
