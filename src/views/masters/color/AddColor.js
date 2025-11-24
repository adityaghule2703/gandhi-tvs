import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';
import FormButtons from '../../../utils/FormButtons';
import '../../../css/offer.css';

function AddColor() {
  const [formData, setFormData] = useState({
    name: '',
    models: []
  });
  const [errors, setErrors] = useState({});
  const [models, setModels] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchColor(id);
    }
  }, [id]);

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

  const fetchColor = async (id) => {
    try {
      const res = await axiosInstance.get(`/colors/${id}`);
      setFormData({
        ...res.data.data.color,
        models: res.data.data.color.models.map((m) => m._id || m.id) || []
      });
    } catch (error) {
      console.error('Error fetching colours:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleModelSelect = (modelId) => {
    setFormData((prevData) => {
      const isSelected = prevData.models.includes(modelId);
      return {
        ...prevData,
        models: isSelected ? prevData.models.filter((id) => id !== modelId) : [...prevData.models, modelId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.name) formErrors.name = 'This field is required';
    if (formData.models.length === 0) {
      formErrors.models = 'Please select at least one model';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        models: formData.models
      };

      if (id) {
        await axiosInstance.put(`/colors/${id}`, payload);
        await showFormSubmitToast('Color updated successfully!');
        navigate('/color/color-list');
      } else {
        await axiosInstance.post('/colors', payload);
        await showFormSubmitToast('Color added successfully!');
        navigate('/color/color-list');
      }
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/color/color-list');
  };

  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} Color</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Color Name</span>
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
            </div>

            <div className="offer-container">
              <form className="permissions-form">
                <h4>
                  Select Models <span className="required">*</span>
                </h4>
                <div className="permissions-grid">
                  {models.map((model) => {
                    const modelId = model._id || model.id;
                    const isSelected = formData.models.includes(modelId);
                    return (
                      <div key={modelId} className="permission-item">
                        <label>
                          <input type="checkbox" checked={isSelected} onChange={() => handleModelSelect(modelId)} />
                          {model.model_name}
                        </label>
                      </div>
                    );
                  })}

                  {errors.models && <p className="error">{errors.models}</p>}
                </div>
              </form>
            </div>

            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddColor;
