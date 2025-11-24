import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import '../../../css/brokerForm.css';
import {
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSwitch,
  CFormSelect,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormLabel
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBuilding, cilEnvelopeClosed, cilLocationPin, cilMobile, cilUser, cilPlus, cilMinus, cilDollar } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';
import FormButtons from '../../../utils/FormButtons';

function AddBroker() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    otp_required: false,
    branchesData: [
      {
        branch: '',
        commissionType: '',
        fixedCommission: '',
        commissionRanges: [{ range: '', amount: '' }],
        isActive: true
      }
    ]
  });
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [commissionRanges, setCommissionRanges] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchBroker(id);
    }
  }, [id]);

  useEffect(() => {
    const fetchCommissionRanges = async () => {
      try {
        const response = await axiosInstance.get('/commission-ranges');
        if (response.data.success) {
          setCommissionRanges(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching commission ranges:', error);
      }
    };

    fetchCommissionRanges();
  }, []);

  const fetchBroker = async (id) => {
    try {
      const res = await axiosInstance.get(`/brokers/${id}`);
      const apiData = res.data.data;

      setFormData({
        name: apiData.name,
        mobile: apiData.mobile,
        email: apiData.email,
        otp_required: apiData.otp_required || false,
        branchesData: apiData.branches.map((branch) => {
          const commissionConfig = branch.commissionConfigurations[0] || {};

          return {
            branch: branch.branch._id,
            commissionType: commissionConfig.commissionType || '',
            fixedCommission: commissionConfig.fixedCommission || '',
            commissionRanges: commissionConfig.commissionRanges || [{ range: '', amount: '' }],
            isActive: branch.isActive
          };
        })
      });
    } catch (error) {
      console.error('Error fetching broker:', error);
    }
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get('/branches');
        setBranches(response.data.data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  // Format commission range for display
  const formatCommissionRange = (range) => {
    if (range.maxAmount) {
      return `${range.minAmount} - ${range.maxAmount}`;
    } else {
      return `${range.minAmount} & above`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleBranchChange = (index, e) => {
    const { name, value } = e.target;
    const updatedBranchesData = [...formData.branchesData];
    updatedBranchesData[index] = {
      ...updatedBranchesData[index],
      [name]: value
    };

    if (name === 'commissionType') {
      if (value === 'FIXED') {
        updatedBranchesData[index].commissionRanges = [{ range: '', amount: '' }];
      } else if (value === 'VARIABLE') {
        updatedBranchesData[index].fixedCommission = '';
      }
    }

    setFormData((prevData) => ({
      ...prevData,
      branchesData: updatedBranchesData
    }));
  };

  const handleRangeChange = (branchIndex, rangeIndex, e) => {
    const { name, value } = e.target;
    const updatedBranchesData = [...formData.branchesData];
    const updatedRanges = [...updatedBranchesData[branchIndex].commissionRanges];

    updatedRanges[rangeIndex] = {
      ...updatedRanges[rangeIndex],
      [name]: value
    };

    updatedBranchesData[branchIndex] = {
      ...updatedBranchesData[branchIndex],
      commissionRanges: updatedRanges
    };

    setFormData((prevData) => ({
      ...prevData,
      branchesData: updatedBranchesData
    }));
  };

  const addRange = (branchIndex) => {
    const updatedBranchesData = [...formData.branchesData];
    updatedBranchesData[branchIndex].commissionRanges.push({ range: '', amount: '' });

    setFormData((prevData) => ({
      ...prevData,
      branchesData: updatedBranchesData
    }));
  };

  const removeRange = (branchIndex, rangeIndex) => {
    const updatedBranchesData = [...formData.branchesData];
    const updatedRanges = [...updatedBranchesData[branchIndex].commissionRanges];

    if (updatedRanges.length <= 1) return;

    updatedRanges.splice(rangeIndex, 1);
    updatedBranchesData[branchIndex].commissionRanges = updatedRanges;

    setFormData((prevData) => ({
      ...prevData,
      branchesData: updatedBranchesData
    }));
  };

  const addBranch = () => {
    setFormData((prevData) => ({
      ...prevData,
      branchesData: [
        ...prevData.branchesData,
        {
          branch: '',
          commissionType: '',
          fixedCommission: '',
          commissionRanges: [{ range: '', amount: '' }],
          isActive: true
        }
      ]
    }));
  };

  const removeBranch = (index) => {
    if (formData.branchesData.length <= 1) return;

    const updatedBranchesData = [...formData.branchesData];
    updatedBranchesData.splice(index, 1);

    setFormData((prevData) => ({
      ...prevData,
      branchesData: updatedBranchesData
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.name) formErrors.name = 'This field is required';
    if (!formData.mobile) formErrors.mobile = 'This field is required';
    if (!formData.email) formErrors.email = 'This field is required';

    formData.branchesData.forEach((branchData, index) => {
      if (!branchData.branch) {
        formErrors[`branch-${index}`] = 'Branch is required';
      }
      if (!branchData.commissionType) {
        formErrors[`commissionType-${index}`] = 'Commission type is required';
      }
      if (branchData.commissionType === 'FIXED' && !branchData.fixedCommission) {
        formErrors[`fixedCommission-${index}`] = 'Fixed commission is required';
      }
      if (branchData.commissionType === 'VARIABLE') {
        branchData.commissionRanges.forEach((range, rangeIndex) => {
          if (!range.range) {
            formErrors[`range-${index}-${rangeIndex}`] = 'Price range is required';
          }
          if (!range.amount) {
            formErrors[`amount-${index}-${rangeIndex}`] = 'Amount is required';
          }
        });
      }
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Prepare the payload according to your API structure
    const payload = {
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      otp_required: formData.otp_required,
      branchesData: formData.branchesData.map((branch) => ({
        branch: branch.branch,
        commissionConfigurations: [
          {
            commissionType: branch.commissionType.toUpperCase(),
            ...(branch.commissionType === 'FIXED' && {
              fixedCommission: branch.fixedCommission
            }),
            ...(branch.commissionType === 'VARIABLE' && {
              commissionRanges: branch.commissionRanges.map((range) => ({
                commissionRangeMaster: range.range, // This should be the ID of the commission range
                amount: range.amount
              }))
            })
          }
        ]
      }))
    };

    try {
      if (id) {
        await axiosInstance.put(`/brokers/${id}`, payload);
        await showFormSubmitToast('Broker updated successfully!', () => navigate('/broker/broker-list'));
      } else {
        await axiosInstance.post('/brokers', payload);
        await showFormSubmitToast('Broker added successfully!', () => navigate('/broker/broker-list'));
      }
      navigate('/broker/broker-list');
    } catch (error) {
      console.error('Error details:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/broker/broker-list');
  };

  return (
    <div className="container-fluid">
      <h4 className="mb-4">{id ? 'Edit' : 'Add'} Broker</h4>

      <div className="form-container">
        <CCard className="mb-4">
          <CCardBody>
            <div className="form-note mb-3">
              <span className="required">*</span> Indicates a required field
            </div>

            <form onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">
                    Name <span className="required">*</span>
                  </CFormLabel>
                  <CInputGroup>
                    <CInputGroupText className="input-icon">
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter broker name"
                      invalid={!!errors.name}
                    />
                  </CInputGroup>
                  {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                </CCol>

                <CCol md={6}>
                  <CFormLabel className="fw-semibold">
                    Mobile Number <span className="required">*</span>
                  </CFormLabel>
                  <CInputGroup>
                    <CInputGroupText className="input-icon">
                      <CIcon icon={cilMobile} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      invalid={!!errors.mobile}
                    />
                  </CInputGroup>
                  {errors.mobile && <div className="text-danger small mt-1">{errors.mobile}</div>}
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel className="fw-semibold">
                    Email <span className="required">*</span>
                  </CFormLabel>
                  <CInputGroup>
                    <CInputGroupText className="input-icon">
                      <CIcon icon={cilEnvelopeClosed} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      invalid={!!errors.email}
                    />
                  </CInputGroup>
                  {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                </CCol>

                <CCol md={6} className="d-flex align-items-end">
                  <div className="w-100">
                    <CFormLabel className="fw-semibold">OTP Required?</CFormLabel>
                    <div className="d-flex align-items-center">
                      <CFormSwitch
                        className="custom-switch-toggle me-2"
                        id="otpRequiredSwitch"
                        name="otp_required"
                        label={formData.otp_required ? 'Yes' : 'No'}
                        checked={formData.otp_required}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            otp_required: e.target.checked
                          }));
                        }}
                        value={formData.otp_required}
                      />
                    </div>
                  </div>
                </CCol>
              </CRow>

              <div className="branches-section mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Branch Details</h5>
                  <CButton color="primary" size="sm" onClick={addBranch}>
                    Add Branch
                  </CButton>
                </div>

                {formData.branchesData.map((branchData, branchIndex) => (
                  <CCard key={branchIndex} className="mb-3">
                    <CCardHeader className="bg-light d-flex justify-content-between align-items-center py-2">
                      <h6 className="mb-0 subtitle">Branch {branchIndex + 1}</h6>
                      {formData.branchesData.length > 1 && (
                        <CButton color="danger" size="sm" onClick={() => removeBranch(branchIndex)}>
                          <CIcon icon={cilMinus} style={{ height: '15px' }} />
                        </CButton>
                      )}
                    </CCardHeader>

                    <CCardBody>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CFormLabel className="fw-semibold">
                            Branch <span className="required">*</span>
                          </CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="input-icon">
                              <CIcon icon={cilLocationPin} />
                            </CInputGroupText>
                            <CFormSelect
                              name="branch"
                              value={branchData.branch}
                              onChange={(e) => handleBranchChange(branchIndex, e)}
                              invalid={!!errors[`branch-${branchIndex}`]}
                              style={{ height: '35px' }}
                            >
                              <option value="">Select a branch</option>
                              {branches.map((branch) => (
                                <option key={branch._id} value={branch._id}>
                                  {branch.name}
                                </option>
                              ))}
                            </CFormSelect>
                          </CInputGroup>
                          {errors[`branch-${branchIndex}`] && (
                            <div className="text-danger small mt-1">{errors[`branch-${branchIndex}`]}</div>
                          )}
                        </CCol>

                        <CCol md={6}>
                          <CFormLabel className="fw-semibold">
                            Commission Type <span className="required">*</span>
                          </CFormLabel>
                          <CInputGroup>
                            <CInputGroupText className="input-icon">
                              <CIcon icon={cilDollar} />
                            </CInputGroupText>
                            <CFormSelect
                              style={{ height: '35px' }}
                              name="commissionType"
                              value={branchData.commissionType}
                              onChange={(e) => handleBranchChange(branchIndex, e)}
                              invalid={!!errors[`commissionType-${branchIndex}`]}
                            >
                              <option value="">Select commission type</option>
                              <option value="FIXED">Fixed</option>
                              <option value="VARIABLE">Variable</option>
                            </CFormSelect>
                          </CInputGroup>
                          {errors[`commissionType-${branchIndex}`] && (
                            <div className="text-danger small mt-1">{errors[`commissionType-${branchIndex}`]}</div>
                          )}
                        </CCol>
                      </CRow>

                      {branchData.commissionType === 'FIXED' && (
                        <CRow>
                          <CCol md={6}>
                            <CFormLabel className="fw-semibold">
                              Fixed Commission Amount <span className="required">*</span>
                            </CFormLabel>
                            <CInputGroup>
                              <CInputGroupText className="input-icon">
                                <CIcon icon={cilDollar} />
                              </CInputGroupText>
                              <CFormInput
                                type="number"
                                name="fixedCommission"
                                value={branchData.fixedCommission}
                                onChange={(e) => handleBranchChange(branchIndex, e)}
                                placeholder="Enter fixed commission amount"
                                invalid={!!errors[`fixedCommission-${branchIndex}`]}
                              />
                            </CInputGroup>
                            {errors[`fixedCommission-${branchIndex}`] && (
                              <div className="text-danger small mt-1">{errors[`fixedCommission-${branchIndex}`]}</div>
                            )}
                          </CCol>
                        </CRow>
                      )}

                      {branchData.commissionType === 'VARIABLE' && (
                        <div className="commission-ranges-section">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">Commission Ranges</h6>
                            <CButton color="primary" size="sm" onClick={() => addRange(branchIndex)}>
                              Add Range
                            </CButton>
                          </div>

                          {branchData.commissionRanges.map((range, rangeIndex) => (
                            <CRow key={rangeIndex} className="mb-2 align-items-end">
                              <CCol md={5}>
                                <CFormLabel className="fw-semibold">
                                  Price Range <span className="required">*</span>
                                </CFormLabel>
                                <CInputGroup>
                                  <CInputGroupText className="input-icon">
                                    <CIcon icon={cilBuilding} />
                                  </CInputGroupText>
                                  <CFormSelect
                                    style={{ height: '35px' }}
                                    name="range"
                                    value={range.range}
                                    onChange={(e) => handleRangeChange(branchIndex, rangeIndex, e)}
                                    invalid={!!errors[`range-${branchIndex}-${rangeIndex}`]}
                                  >
                                    <option value="">Select price range</option>
                                    {commissionRanges.map((commissionRange) => (
                                      <option key={commissionRange._id} value={commissionRange._id}>
                                        {formatCommissionRange(commissionRange)}
                                      </option>
                                    ))}
                                  </CFormSelect>
                                </CInputGroup>
                                {errors[`range-${branchIndex}-${rangeIndex}`] && (
                                  <div className="text-danger small mt-1">{errors[`range-${branchIndex}-${rangeIndex}`]}</div>
                                )}
                              </CCol>

                              <CCol md={5}>
                                <CFormLabel className="fw-semibold">
                                  Commission Amount <span className="required">*</span>
                                </CFormLabel>
                                <CInputGroup>
                                  <CInputGroupText className="input-icon">
                                    <CIcon icon={cilDollar} />
                                  </CInputGroupText>
                                  <CFormInput
                                    type="number"
                                    name="amount"
                                    value={range.amount}
                                    onChange={(e) => handleRangeChange(branchIndex, rangeIndex, e)}
                                    placeholder="Enter commission amount"
                                    invalid={!!errors[`amount-${branchIndex}-${rangeIndex}`]}
                                  />
                                </CInputGroup>
                                {errors[`amount-${branchIndex}-${rangeIndex}`] && (
                                  <div className="text-danger small mt-1">{errors[`amount-${branchIndex}-${rangeIndex}`]}</div>
                                )}
                              </CCol>

                              <CCol md={2} className="text-end">
                                {branchData.commissionRanges.length > 1 && (
                                  <CButton
                                    color="danger"
                                    size="sm"
                                    onClick={() => removeRange(branchIndex, rangeIndex)}
                                    title="Remove range"
                                  >
                                    <CIcon icon={cilMinus} style={{ height: '10px' }} />
                                  </CButton>
                                )}
                              </CCol>
                            </CRow>
                          ))}
                        </div>
                      )}
                    </CCardBody>
                  </CCard>
                ))}
              </div>

              <FormButtons onCancel={handleCancel} />
            </form>
          </CCardBody>
        </CCard>
      </div>
    </div>
  );
}

export default AddBroker;
