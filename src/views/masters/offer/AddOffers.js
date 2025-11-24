import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSwitch, CFormCheck, CFormSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilDescription, cilImage, cilLink, cilText } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import FormButtons from '../../../utils/FormButtons';
import axiosInstance from '../../../axiosInstance';
import '../../../css/offer.css';
function AddOffer() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    image: null,
    isActive: true,
    applyToAllModels: false,
    applicableModels: [],
    offerLanguage: '',
    priority: ''
  });
  const [errors, setErrors] = useState({});
  const [models, setModels] = useState([]);
  const [existingImage, setExistingImage] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchOffer(id);
    }
  }, [id]);

  const fetchOffer = async (id) => {
    try {
      const res = await axiosInstance.get(`/offers/${id}`);
      setFormData({
        ...res.data.data.offer,
        image: null
      });
      setExistingImage(res.data.data.offer.image);
    } catch (error) {
      console.error('Error fetching offers', error);
    }
  };

  useEffect(() => {
    return () => {
      if (formData.image) {
        URL.revokeObjectURL(URL.createObjectURL(formData.image));
      }
    };
  }, [formData.image]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axiosInstance.get('/models');
        setModels(response.data.data.models);
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };

    fetchModels();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleModelSelect = (modelId) => {
    setFormData((prevData) => {
      const isSelected = prevData.applicableModels.includes(modelId);
      return {
        ...prevData,
        applicableModels: isSelected ? prevData.applicableModels.filter((id) => id !== modelId) : [...prevData.applicableModels, modelId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.title) formErrors.title = 'Title is required';
    if (!formData.offerLanguage) formErrors.offerLanguage = 'Language is required';
    if (!formData.priority) formErrors.priority = 'Priority is required';
    if (!formData.description) formErrors.description = 'Description is required';

    if (!formData.isActive && formData.applicableModels.length === 0) {
      formErrors.applicableModels = 'Select at least one model if not applying for all.';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('url', formData.url);
      formDataToSend.append('isActive', formData.isActive);
      formDataToSend.append('applyToAllModels', formData.applyToAllModels);
      formDataToSend.append('offerLanguage', formData.offerLanguage);
      formDataToSend.append('priority', formData.priority);
      formData.applicableModels.forEach((modelId) => {
        formDataToSend.append('applicableModels[]', modelId);
      });

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      if (id) {
        await axiosInstance.put(`/offers/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        await showFormSubmitToast('Offer updated successfully!');
        navigate('/offers/offer-list');
      } else {
        await axiosInstance.post('/offers', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        await showFormSubmitToast('Offer added successfully!');
        navigate('/offers/offer-list');
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/offers/offer-list');
  };

  return (
    <div>
      <h4>Add New Offers</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Title</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilText} />
                  </CInputGroupText>
                  <CFormInput type="text" name="title" value={formData.title} onChange={handleChange} />
                </CInputGroup>
                {errors.title && <p className="error">{errors.title}</p>}
              </div>

              <div className="input-box">
                <div className="details-container">
                  <span className="details">Description</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilDescription} />
                  </CInputGroupText>
                  <CFormInput type="text" name="description" value={formData.description} onChange={handleChange} />
                </CInputGroup>
                {errors.description && <p className="error">{errors.description}</p>}
              </div>
              <div className="input-box">
                <span className="details">Url</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilLink} />
                  </CInputGroupText>
                  <CFormInput type="url" name="url" value={formData.url} onChange={handleChange} />
                </CInputGroup>
              </div>
              {/* <div className="input-box">
                <span className="details">Image</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilImage} />
                  </CInputGroupText>
                  <CFormInput type="file" name="image" onChange={handleChange} accept="image/*" />
                </CInputGroup>
              </div> */}
              <div className="input-box">
                <span className="details">Image</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilImage} />
                  </CInputGroupText>
                  <CFormInput type="file" name="image" onChange={handleChange} accept="image/*" />
                </CInputGroup>

                {/* Show existing image if in edit mode and no new image selected */}
                {id && existingImage && !formData.image && (
                  <div className="existing-image-preview">
                    <p>Current Image:</p>
                    <img
                      src={`${axiosInstance.defaults.baseURL}${existingImage}`}
                      alt="Current offer"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  </div>
                )}

                {/* Show preview of new image if selected */}
                {formData.image && (
                  <div className="new-image-preview">
                    <p>New Image:</p>
                    <img src={URL.createObjectURL(formData.image)} alt="New offer" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                  </div>
                )}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Offer Language </span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilText} />
                  </CInputGroupText>
                  <CFormSelect name="offerLanguage" value={formData.offerLanguage} onChange={handleChange}>
                    <option value="">-Select-</option>
                    <option value="Marathi">Marathi</option>
                    <option value="English">English</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.offerLanguage && <p className="error">{errors.offerLanguage}</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Priority</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilText} />
                  </CInputGroupText>
                  <CFormInput type="text" name="priority" value={formData.priority} onChange={handleChange} />
                </CInputGroup>
                {errors.priority && <p className="error">{errors.priority}</p>}
              </div>

              <div className="input-box">
                <span className="details">Apply for all</span>
                <CInputGroup>
                  <CFormSwitch
                    className="custom-switch-toggle"
                    name="applyToAllModels"
                    label={formData.applyToAllModels ? 'Yes' : 'No'}
                    checked={formData.applyToAllModels}
                    onChange={(e) => setFormData({ ...formData, applyToAllModels: e.target.checked })}
                  />
                </CInputGroup>
              </div>
            </div>
            <div className="offer-container">
              {!formData.applyToAllModels && (
                <form className="permissions-form">
                  <h4>Select Models</h4>
                  <div className="permissions-grid">
                    {models.map((model) => {
                      const isSelected = (formData.applicableModels || []).includes(model._id);
                      return (
                        <div key={model.id} className="permission-item">
                          <label>
                            <input type="checkbox" checked={isSelected} onChange={() => handleModelSelect(model._id)} />
                            {model.model_name}
                          </label>
                        </div>
                      );
                    })}

                    {errors.applicableModels && <p className="error">{errors.applicableModels}</p>}
                  </div>
                </form>
              )}
            </div>
            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddOffer;
