import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSwitch} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilDescription, cilImage, cilLink, cilText } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import FormButtons from '../../../utils/FormButtons';
import axiosInstance from '../../../axiosInstance';
import '../../../css/offer.css';
function Attachments() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isForAllModels: false,
    applicableModels: [],
    youtubeUrls: '',
    images: [],
    videos: [],
    documents: []
  });
  const [errors, setErrors] = useState({});
  const [models, setModels] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchOffer(id);
    }
  }, [id]);
  const fetchOffer = async (id) => {
    try {
      const res = await axiosInstance.get(`/attachments/${id}`);
      const attachment = res.data.data.attachment;
      const existingImages = [];
      const existingVideos = [];
      const existingDocuments = [];
      let youtubeUrl = '';

      attachment.attachments.forEach((item) => {
        if (item.type === 'image') {
          existingImages.push(item);
        } else if (item.type === 'video') {
          existingVideos.push(item);
        } else if (item.type === 'document') {
          existingDocuments.push(item);
        } else if (item.type === 'youtube') {
          youtubeUrl = item.url;
        }
      });

      setFormData({
        title: attachment.title || '',
        description: attachment.description || '',
        isForAllModels: attachment.isForAllModels || false,
        // applicableModels: attachment.applicableModels || [],
        applicableModels: attachment.applicableModels.map((model) => model.id) || [],
        youtubeUrls: youtubeUrl,
        images: existingImages,
        videos: existingVideos,
        documents: existingDocuments,
        existingAttachments: attachment.attachments
      });
    } catch (error) {
      console.error('Error fetching attachment', error);
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

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === 'file') {
      if (name === 'videos' && files) {
        const oversizedVideos = Array.from(files).filter((file) => file.size > MAX_VIDEO_SIZE);

        if (oversizedVideos.length > 0) {
          const oversizedNames = oversizedVideos.map((file) => file.name).join(', ');
          Swal.fire({
            title: 'File Size Exceeded',
            text: `The following videos exceed 25MB limit: ${oversizedNames}`,
            icon: 'error'
          });
          return;
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: files
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
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
    if (formData.videos && formData.videos.length > 0) {
      const oversizedVideos = Array.from(formData.videos).filter((file) => file.size > MAX_VIDEO_SIZE);
      if (oversizedVideos.length > 0) {
        formErrors.videos = 'One or more videos exceed the 25MB size limit';
      }
    }

    if (!formData.title) formErrors.title = 'Title is required';
    if (!formData.isForAllModels && formData.applicableModels.length === 0) {
      formErrors.applicableModels = 'Select at least one model if not applying to all.';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('isForAllModels', formData.isForAllModels);

      data.append('applicableModels', JSON.stringify(formData.applicableModels));

      if (formData.youtubeUrls) {
        data.append('youtubeUrls', JSON.stringify([formData.youtubeUrls]));
      }

      Array.from(formData.images).forEach((file) => data.append('images', file));
      Array.from(formData.videos).forEach((file) => data.append('videos', file));
      Array.from(formData.documents).forEach((file) => data.append('documents', file));

      if (id) {
        await axiosInstance.put(`/attachments/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await showFormSubmitToast('Attachments updated successfully!');
      } else {
        await axiosInstance.post('/attachments', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await showFormSubmitToast('Attachments added successfully!');
      }

      navigate('/attachments/attachments-list');
    } catch (error) {
      console.error('Submit Error:', error);
      showFormSubmitError(error);
    }
  };
  const handleCancel = () => {
    navigate('/attachments/attachments-list');
  };

  return (
    <div>
      <h4>Add New Attachments</h4>
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
                <span className="details">Description</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilDescription} />
                  </CInputGroupText>
                  <CFormInput type="text" name="description" value={formData.description} onChange={handleChange} />
                </CInputGroup>
              </div>
              <div className="input-box">
                <span className="details">YouTube Url</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilLink} />
                  </CInputGroupText>
                  <CFormInput type="url" name="youtubeUrls" value={formData.youtubeUrls} onChange={handleChange} multiple />
                </CInputGroup>
              </div>
              <div className="input-box">
                <span className="details">Images</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilImage} />
                  </CInputGroupText>
                  <CFormInput type="file" name="images" onChange={handleChange} multiple accept="image/*" />
                </CInputGroup>
              </div>
              <div className="input-box">
                <span className="details">Videos</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilImage} />
                  </CInputGroupText>
                  <CFormInput type="file" name="videos" onChange={handleChange} multiple accept="video/*" />
                </CInputGroup>
                <p>only upload video 25mb size</p>
              </div>
              <div className="input-box">
                <span className="details">Documents</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilImage} />
                  </CInputGroupText>
                  <CFormInput type="file" name="documents" multiple accept=".pdf,.doc,.docx" onChange={handleChange} />
                </CInputGroup>
              </div>
              <div className="input-box">
                <span className="details">Apply for all</span>
                <CInputGroup>
                  <CFormSwitch
                    className="custom-switch-toggle"
                    name="isForAllModels"
                    label={formData.isForAllModels ? 'Yes' : 'No'}
                    checked={formData.isForAllModels}
                    onChange={(e) => setFormData({ ...formData, isForAllModels: e.target.checked })}
                  />
                </CInputGroup>
              </div>
            </div>
            <div className="offer-container">
              {!formData.isForAllModels && (
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
export default Attachments;
