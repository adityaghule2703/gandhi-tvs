import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import {
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilBuilding } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from 'src/utils/sweetAlerts';
import axiosInstance from 'src/axiosInstance.js';
import FormButtons from 'src/utils/FormButtons';

function AddCommission() {
  const [formData, setFormData] = useState({
    subdealer_id: '',
    model_id: '',
    commission_rates: []
  });
  const [subdealers, setSubdealers] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchSubdealers();

    if (id) {
      fetchCommissionData(id);
    }
  }, [id]);

  const fetchSubdealers = async () => {
    try {
      const res = await axiosInstance.get('/subdealers');
      setSubdealers(res.data.data.subdealers || res.data.data);
    } catch (error) {
      console.error('Error fetching subdealers:', error);
    }
  };

  const fetchModelsBySubdealer = async (subdealerId) => {
    if (!subdealerId) {
      setModels([]);
      setSelectedModel(null);
      return;
    }

    setIsLoadingModels(true);
    try {
      const res = await axiosInstance.get(`/models/with-prices?subdealer_id=${subdealerId}`);
      setModels(res.data.data.models || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const fetchCommissionData = async (id) => {
    try {
      const res = await axiosInstance.get(`/commissions/${id}`);
      const commissionData = res.data.data;

      const transformedData = {
        subdealer_id: commissionData.subdealer_id,
        model_id: commissionData.model_id,
        commission_rates: commissionData.commission_rates || []
      };

      setFormData(transformedData);

      if (commissionData.subdealer_id) {
        fetchModelsBySubdealer(commissionData.subdealer_id);
        if (commissionData.model_id) {
          try {
            const modelRes = await axiosInstance.get(`/models/with-prices?subdealer_id=${commissionData.subdealer_id}`);
            const foundModel = modelRes.data.data.models.find((model) => model._id === commissionData.model_id);
            setSelectedModel(foundModel);
          } catch (error) {
            console.error('Error fetching model details:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    if (name === 'subdealer_id') {
      setFormData((prev) => ({
        ...prev,
        model_id: '',
        commission_rates: []
      }));
      setSelectedModel(null);
      fetchModelsBySubdealer(value);
    }

    if (name === 'model_id') {
      const selected = models.find((model) => model._id === value);
      setSelectedModel(selected);

      if (selected && selected.prices) {
        const initialRates = selected.prices.map((price) => ({
          header_id: price.header._id,
          commission_rate: 0
        }));

        setFormData((prev) => ({
          ...prev,
          model_id: value,
          commission_rates: initialRates
        }));
      }
    }
  };

  const handleCommissionRateChange = (headerId, value) => {
    setFormData((prev) => {
      const updatedRates = prev.commission_rates.map((rate) => (rate.header_id === headerId ? { ...rate, commission_rate: value } : rate));

      return { ...prev, commission_rates: updatedRates };
    });
  };

  const validateForm = () => {
    let formErrors = {};

    if (!formData.subdealer_id) formErrors.subdealer_id = 'Subdealer is required';
    if (!formData.model_id) formErrors.model_id = 'Model is required';
    if (formData.commission_rates.length === 0) {
      formErrors.commission_rates = 'Commission rates are required';
    } else {
      const invalidRates = formData.commission_rates.filter(
        (rate) => rate.commission_rate === '' || isNaN(parseFloat(rate.commission_rate))
      );

      if (invalidRates.length > 0) {
        formErrors.commission_rates = 'All commission rates must be valid numbers';
      }
    }

    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data before validation:', formData);

    const formErrors = validateForm();
    console.log('Form errors:', formErrors);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      console.log('Form has errors, not submitting');
      return;
    }

    try {
      const submissionData = {
        ...formData,
        commission_rates: formData.commission_rates.map((rate) => ({
          ...rate,
          commission_rate: parseFloat(rate.commission_rate)
        }))
      };

      console.log('Submitting data:', submissionData);

      if (id) {
        await axiosInstance.put(`/commission-master/${id}`, submissionData);
        await showFormSubmitToast('Commission updated successfully!', () => navigate('/subdealer-commission'));
      } else {
        await axiosInstance.post('/commission-master', submissionData);
        await showFormSubmitToast('Commission added successfully!', () => navigate('/subdealer-commission'));
      }
      navigate('/subdealer-commission');
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };
  const handleCancel = () => {
    navigate('/subdealer-commission');
  };

  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} Commission</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Subdealer</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect name="subdealer_id" value={formData.subdealer_id} onChange={handleChange} disabled={!!id}>
                    <option value="">Select Subdealer</option>
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
                  <span className="details">Model</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilBuilding} />
                  </CInputGroupText>
                  <CFormSelect
                    name="model_id"
                    value={formData.model_id}
                    onChange={handleChange}
                    disabled={isLoadingModels || !formData.subdealer_id}
                  >
                    <option value="">Select Model</option>
                    {isLoadingModels ? (
                      <option value="" disabled>
                        Loading models...
                      </option>
                    ) : (
                      models.map((model) => (
                        <option key={model._id} value={model._id}>
                          {model.model_name}
                        </option>
                      ))
                    )}
                  </CFormSelect>
                </CInputGroup>
                {errors.model_id && <p className="error">{errors.model_id}</p>}
                {!isLoadingModels && formData.subdealer_id && models.length === 0 && (
                  <p className="error">No models found for this subdealer</p>
                )}
              </div>
            </div>
            {selectedModel && selectedModel.prices && (
              <div>
                <div>
                  <h5 style={{ marginTop: '20px' }}>Commission Rates for Price Headers</h5>
                </div>
                <CTable striped>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Price Header</CTableHeaderCell>
                      <CTableHeaderCell>Commission Rate</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {selectedModel.prices.map((price, index) => {
                      const commissionRate = formData.commission_rates.find((rate) => rate.header_id === price.header._id);

                      return (
                        <CTableRow key={price.header._id}>
                          <CTableDataCell>{price.header.header_key}</CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="number"
                              value={commissionRate ? commissionRate.commission_rate : ''}
                              onChange={(e) => handleCommissionRateChange(price.header._id, e.target.value)}
                              placeholder="Enter commission rate"
                              step="0.01"
                              min="0"
                            />
                          </CTableDataCell>
                        </CTableRow>
                      );
                    })}
                  </CTableBody>
                </CTable>
              </div>
            )}
            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCommission;

// import React, { useState, useEffect } from 'react';
// import '../../../css/form.css';
// import { CInputGroup, CInputGroupText, CFormSelect, CFormInput, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CCard, CCardBody, CCardHeader } from '@coreui/react';
// import CIcon from '@coreui/icons-react';
// import { cilUser} from '@coreui/icons';
// import { useNavigate, useParams } from 'react-router-dom';
// import { showFormSubmitError, showFormSubmitToast } from 'utils/sweetAlerts';
// import axiosInstance from 'axiosInstance';
// import FormButtons from 'utils/FormButtons';

// function AddCommission() {
//   const [formData, setFormData] = useState({
//     subdealer_id: '',
//     commission_rates: []
//   });
//   const [subdealers, setSubdealers] = useState([]);
//   const [models, setModels] = useState([]);
//   const [priceHeaders, setPriceHeaders] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const navigate = useNavigate();
//   const { id } = useParams();

//   useEffect(() => {
//     fetchSubdealers();

//     if (id) {
//       fetchCommissionData(id);
//     }
//   }, [id]);

//   const fetchSubdealers = async () => {
//     try {
//       const res = await axiosInstance.get('/subdealers');
//       setSubdealers(res.data.data.subdealers || res.data.data);
//     } catch (error) {
//       console.error('Error fetching subdealers:', error);
//     }
//   };

//   const fetchModelsAndPriceHeaders = async (subdealerId) => {
//     if (!subdealerId) {
//       setModels([]);
//       setPriceHeaders([]);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const res = await axiosInstance.get(`/models/with-prices?subdealer_id=${subdealerId}`);
//       const modelsData = res.data.data.models || [];
//       setModels(modelsData);
//       const headers = [];
//       const headerMap = new Map();

//       modelsData.forEach(model => {
//         if (model.prices) {
//           model.prices.forEach(price => {
//             if (!headerMap.has(price.header._id)) {
//               headerMap.set(price.header._id, price.header);
//               headers.push(price.header);
//             }
//           });
//         }
//       });

//       setPriceHeaders(headers);

//       if (id) {
//         return;
//       }
//       const initialRates = modelsData.map(model => ({
//         model_id: model._id,
//         rates: headers.map(header => ({
//           header_id: header._id,
//           commission_rate: 0
//         }))
//       }));

//       setFormData(prev => ({
//         ...prev,
//         commission_rates: initialRates
//       }));
//     } catch (error) {
//       console.error('Error fetching models:', error);
//       setModels([]);
//       setPriceHeaders([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchCommissionData = async (id) => {
//     try {
//       const res = await axiosInstance.get(`/commissions/${id}`);
//       const commissionData = res.data.data;

//       await fetchModelsAndPriceHeaders(commissionData.subdealer_id);
//       const transformedData = {
//         subdealer_id: commissionData.subdealer_id,
//         commission_rates: models.map(model => {
//           const modelRates = commissionData.commission_rates.filter(
//             rate => rate.model_id === model._id
//           );

//           return {
//             model_id: model._id,
//             rates: priceHeaders.map(header => {
//               const existingRate = modelRates.find(
//                 rate => rate.header_id === header._id
//               );

//               return {
//                 header_id: header._id,
//                 commission_rate: existingRate ? existingRate.commission_rate : 0
//               };
//             })
//           };
//         })
//       };

//       setFormData(transformedData);
//     } catch (error) {
//       console.error('Error fetching commission data:', error);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({ ...prevData, [name]: value }));
//     setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

//     if (name === 'subdealer_id') {
//       setFormData(prev => ({
//         ...prev,
//         commission_rates: []
//       }));
//       fetchModelsAndPriceHeaders(value);
//     }
//   };

//   const handleCommissionRateChange = (modelId, headerId, value) => {
//     setFormData(prev => {
//       const updatedRates = prev.commission_rates.map(modelRate => {
//         if (modelRate.model_id === modelId) {
//           const updatedModelRates = modelRate.rates.map(rate =>
//             rate.header_id === headerId
//               ? { ...rate, commission_rate: value }
//               : rate
//           );

//           return { ...modelRate, rates: updatedModelRates };
//         }
//         return modelRate;
//       });

//       return { ...prev, commission_rates: updatedRates };
//     });
//   };

//   const validateForm = () => {
//     let formErrors = {};

//     if (!formData.subdealer_id) formErrors.subdealer_id = 'Subdealer is required';

//     if (formData.commission_rates.length === 0) {
//       formErrors.commission_rates = 'Commission rates are required';
//     } else {
//       const invalidRates = formData.commission_rates.flatMap(modelRate =>
//         modelRate.rates.filter(rate =>
//           rate.commission_rate === '' || isNaN(parseFloat(rate.commission_rate))
//       ));
//       if (invalidRates.length > 0) {
//         formErrors.commission_rates = 'All commission rates must be valid numbers';
//       }
//     }

//     return formErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const formErrors = validateForm();

//     if (Object.keys(formErrors).length > 0) {
//       setErrors(formErrors);
//       return;
//     }

//     try {
//       const submissionData = {
//         ...formData,
//         commission_rates: formData.commission_rates.flatMap(modelRate =>
//           modelRate.rates.map(rate => ({
//             model_id: modelRate.model_id,
//             header_id: rate.header_id,
//             commission_rate: parseFloat(rate.commission_rate)
//           }))
//         )
//       };

//       if (id) {
//         await axiosInstance.put(`/commission-master/${id}`, submissionData);
//         await showFormSubmitToast('Commission updated successfully!', () => navigate('/subdealer-commission'));
//       } else {
//         await axiosInstance.post('/commission-master', submissionData);
//         await showFormSubmitToast('Commission added successfully!', () => navigate('/subdealer-commission'));
//       }
//       navigate('/subdealer-commission');
//     } catch (error) {
//       console.error('Error details:', error);
//       showFormSubmitError(error);
//     }
//   };

//   const handleCancel = () => {
//     navigate('/subdealer-commission');
//   };
//   const findPriceValue = (modelId, headerId) => {
//     const model = models.find(m => m._id === modelId);
//     if (!model || !model.prices) return '-';

//     const price = model.prices.find(p => p.header._id === headerId);
//     return price ? price.value : '-';
//   };

//   return (
//     <div>
//       <h4>{id ? 'Edit' : 'Add'} Commission</h4>
//       <div className="form-container">
//         <div className="page-header">
//           <form onSubmit={handleSubmit}>
//             <div className="form-note">
//               <span className="required">*</span> Field is mandatory
//             </div>
//             <div className="user-details">
//               <div className="input-box">
//                 <div className="details-container">
//                   <span className="details">Subdealer</span>
//                   <span className="required">*</span>
//                 </div>
//                 <CInputGroup>
//                   <CInputGroupText className="input-icon">
//                     <CIcon icon={cilUser} />
//                   </CInputGroupText>
//                   <CFormSelect
//                     name="subdealer_id"
//                     value={formData.subdealer_id}
//                     onChange={handleChange}
//                     disabled={!!id}
//                   >
//                     <option value="">Select Subdealer</option>
//                     {subdealers.map((subdealer) => (
//                       <option key={subdealer._id} value={subdealer._id}>
//                         {subdealer.name}
//                       </option>
//                     ))}
//                   </CFormSelect>
//                 </CInputGroup>
//                 {errors.subdealer_id && <p className="error">{errors.subdealer_id}</p>}
//               </div>
//             </div>

//             {isLoading && <p>Loading models and price headers...</p>}

//             {!isLoading && models.length > 0 && priceHeaders.length > 0 && (
//               <CCard style={{marginTop: '20px'}}>
//                 <CCardHeader>
//                   <h5>Commission Rates for All Models</h5>
//                 </CCardHeader>
//                 <CCardBody>
//                   <CTable striped responsive>
//                     <CTableHead>
//                       <CTableRow>
//                         <CTableHeaderCell>Model Name</CTableHeaderCell>
//                         {priceHeaders.map(header => (
//                           <CTableHeaderCell key={header._id}>
//                             {header.header_key}
//                           </CTableHeaderCell>
//                         ))}
//                       </CTableRow>
//                     </CTableHead>
//                     <CTableBody>
//                       {models.map(model => (
//                         <CTableRow key={model._id}>
//                           <CTableDataCell>{model.model_name}</CTableDataCell>
//                           {priceHeaders.map(header => {
//                             const modelRates = formData.commission_rates.find(
//                               rate => rate.model_id === model._id
//                             );

//                             const commissionRate = modelRates
//                               ? modelRates.rates.find(rate => rate.header_id === header._id)
//                               : null;

//                             return (
//                               <CTableDataCell key={header._id}>
//                                 <div>
//                                   <strong>Price: </strong>{findPriceValue(model._id, header._id)}
//                                 </div>
//                                 <div style={{marginTop: '5px'}}>
//                                   <CFormInput
//                                     type="number"
//                                     value={commissionRate ? commissionRate.commission_rate : ''}
//                                     onChange={(e) => handleCommissionRateChange(
//                                       model._id,
//                                       header._id,
//                                       e.target.value
//                                     )}
//                                     placeholder="Commission %"
//                                     step="0.01"
//                                     min="0"
//                                     size="sm"
//                                   />
//                                 </div>
//                               </CTableDataCell>
//                             );
//                           })}
//                         </CTableRow>
//                       ))}
//                     </CTableBody>
//                   </CTable>
//                 </CCardBody>
//               </CCard>
//             )}

//             {!isLoading && formData.subdealer_id && models.length === 0 && (
//               <p className="error">No models found for this subdealer</p>
//             )}

//             <FormButtons onCancel={handleCancel} />
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AddCommission;
