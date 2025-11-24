import React, { useState, useEffect } from 'react';
import '../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBuilding, cilCheckCircle, cilLocationPin, cilUser } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../utils/sweetAlerts';
import FormButtons from '../../utils/FormButtons'
import axiosInstance from '../../axiosInstance';

function InwardStock() {

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const hasBranch = !!storedUser.branch?._id;
  const branchId = storedUser.branch?._id;
  const userRole = localStorage.getItem('userRole');

  const [formData, setFormData] = useState({
    model: { _id: '', model_name: '', type: '' },
    unloadLocation: storedUser.branch?._id || '',
    type: '',
    color: { id: '' },
    batteryNumber: '',
    keyNumber: '',
    chassisNumber: '',
    engineNumber: '',
    motorNumber: '',
    chargerNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [models, setModels] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const inwardDate = new Date().toISOString().split('T')[0];
  const filteredModels = models.filter((model) => model.type === formData.type);

  useEffect(() => {
    if (id) {
      fetchInward(id);
    }
  }, [id]);

  const fetchInward = async (id) => {
    try {
      const res = await axiosInstance.get(`/vehicles/${id}`);
      const vehicle = res.data.data.vehicle;

      setFormData({
        ...vehicle,
        model: {
          _id: vehicle.model,
          model_name: vehicle.modelName
        },
        color: vehicle.color || { id: '', name: '' },
        unloadLocation: vehicle.unloadLocation?._id || ''
      });
    } catch (error) {
      console.error('Error fetching inward:', error);
    }
  };

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

  useEffect(() => {
    const fetchColorsForModel = async () => {
      if (formData.model._id) {
        try {
          const response = await axiosInstance.get(`/colors/model/${formData.model._id}`);
          setAvailableColors(response.data.data.colors || []);
          if (!id) {
            setFormData((prev) => ({ ...prev, color: { id: '' } }));
          }
        } catch (error) {
          console.error('Failed to fetch colors:', error);
          setAvailableColors([]);
        }
      } else {
        setAvailableColors([]);
      }
    };

    fetchColorsForModel();
  }, [formData.model._id, id]);

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

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!formData.model._id) {
      formErrors.model = 'Model is required';
      isValid = false;
    }

    if (!formData.unloadLocation) {
      formErrors.unloadLocation = 'Unload location is required';
      isValid = false;
    }

    if (!formData.type) {
      formErrors.type = 'Type is required';
      isValid = false;
    }

    if (!formData.color.id) {
      formErrors.color = 'Color is required';
      isValid = false;
    }

    if (!formData.keyNumber) {
      formErrors.keyNumber = 'Key number is required';
      isValid = false;
    }

    if (!formData.chassisNumber) {
      formErrors.chassisNumber = 'Chassis number is required';
      isValid = false;
    }

    if (formData.type === 'EV') {
      if (!formData.batteryNumber) {
        formErrors.batteryNumber = 'Battery number is required';
        isValid = false;
      }
      if (!formData.engineNumber) {
        formErrors.engineNumber = 'Engine number is required';
        isValid = false;
      }
      if (!formData.motorNumber) {
        formErrors.motorNumber = 'Motor number is required';
        isValid = false;
      }
      if (!formData.chargerNumber) {
        formErrors.chargerNumber = 'Charger number is required';
        isValid = false;
      }
    } else if (formData.type === 'ICE') {
      if (!formData.engineNumber) {
        formErrors.engineNumber = 'Engine number is required';
        isValid = false;
      }
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'type') {
      setFormData((prev) => ({
        ...prev,
        type: value,
        model: { _id: '', model_name: '' },
        color: { id: '' },
        batteryNumber: '',
        keyNumber: '',
        chassisNumber: '',
        engineNumber: '',
        motorNumber: '',
        chargerNumber: ''
      }));
    } else if (name === 'model') {
      const selectedModel = models.find((m) => m._id === value);
      setFormData((prev) => ({
        ...prev,
        model: {
          _id: selectedModel?._id || '',
          model_name: selectedModel?.model_name || ''
        },
        color: { id: '' }
      }));
    } else if (name === 'color') {
      const selectedColor = availableColors.find((c) => c.id === value);
      setFormData((prev) => ({
        ...prev,
        color: {
          id: selectedColor?.id || '',
          name: selectedColor?.name || ''
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        modelName: formData.model.model_name,
        model: formData.model._id,
        unloadLocation: formData.unloadLocation,
        type: formData.type,
        color: {
          id: formData.color.id,
          name: formData.color.name
        },
        batteryNumber: formData.batteryNumber,
        keyNumber: formData.keyNumber,
        chassisNumber: formData.chassisNumber,
        engineNumber: formData.engineNumber,
        motorNumber: formData.motorNumber,
        chargerNumber: formData.chargerNumber
      };

      if (id) {
        await axiosInstance.put(`/vehicles/${id}`, payload);
        await showFormSubmitToast('Vehicle updated successfully!', () => navigate('/inward-list'));
      } else {
        await axiosInstance.post('/vehicles', payload);
        await showFormSubmitToast('Vehicle added successfully!', () => navigate('/inward-list'));
      }
      navigate('/inward-list');
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/inward-list');
  };

  return (
    <div className="form-container">
      <div className="title">{id ? 'Edit' : 'Add'} Vehicle Inward</div>
      <div className="form-card">
        <div className="form-body">
          <form onSubmit={handleSubmit}>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details label">Unload Location</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CFormSelect name="unloadLocation" value={formData.unloadLocation} onChange={handleChange}>
                    <option value="">-Select-</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.unloadLocation && <p className="error">{errors.unloadLocation}</p>}
              </div>

              {!id && (
                <div className="input-box">
                  <div className="details-container">
                    <span className="details">Inward Date</span>
                    <span className="required">*</span>
                  </div>
                  <CInputGroup>
                    <CFormInput type="date" value={new Date().toISOString().split('T')[0]} readOnly />
                  </CInputGroup>
                </div>
              )}
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Type</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CFormSelect name="type" value={formData.type} onChange={handleChange}>
                    <option value="">-Select-</option>
                    <option value="EV">EV</option>
                    <option value="ICE">ICE</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.type && <p className="error">{errors.type}</p>}
              </div>

              <div className="input-box">
                <div className="details-container">
                  <span className="details">Model Name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CFormSelect name="model" value={formData.model._id} onChange={handleChange} disabled={!formData.type}>
                    <option value="">- Select a Model -</option>
                    {filteredModels.map((model) => (
                      <option key={model._id} value={model._id}>
                        {model.model_name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.model && <p className="error">{errors.model}</p>}
              </div>

              <div className="input-box">
                <div className="details-container">
                  <span className="details">Color</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CFormSelect
                    name="color"
                    value={formData.color.id}
                    onChange={handleChange}
                    disabled={!formData.model._id || availableColors.length === 0}
                  >
                    <option value="">-Select a color-</option>
                    {availableColors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.color && <p className="error">{errors.color}</p>}
                {formData.model._id && availableColors.length === 0 && <p className="error">No colors available for the selected model</p>}
              </div>
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Chassis No.</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CFormInput type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} />
                </CInputGroup>
                {errors.chassisNumber && <p className="error">{errors.chassisNumber}</p>}
              </div>

              <div className="input-box">
                <div className="details-container">
                  <span className="details">Key No.</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CFormInput type="text" name="keyNumber" value={formData.keyNumber} onChange={handleChange} />
                </CInputGroup>
                {errors.keyNumber && <p className="error">{errors.keyNumber}</p>}
              </div>

              <div className="input-box">
                <span className="details">Battery No.</span>
                <CInputGroup>
                  <CFormInput type="text" name="batteryNumber" value={formData.batteryNumber} onChange={handleChange} />
                </CInputGroup>
              </div>

              <div className="input-box">
                <div className="details-container">
                  <span className="details">Engine No.</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CFormInput type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} />
                </CInputGroup>
                {errors.engineNumber && <p className="error">{errors.engineNumber}</p>}
              </div>

              {formData.type === 'EV' && (
                <>
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Motor No.</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CFormInput type="text" name="motorNumber" value={formData.motorNumber} onChange={handleChange} />
                    </CInputGroup>
                    {errors.motorNumber && <p className="error">{errors.motorNumber}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Charger No.</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CFormInput type="text" name="chargerNumber" value={formData.chargerNumber} onChange={handleChange} />
                    </CInputGroup>
                    {errors.chargerNumber && <p className="error">{errors.chargerNumber}</p>}
                  </div>
                </>
              )}
            </div>
            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
}

export default InwardStock;
