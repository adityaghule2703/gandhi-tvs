import React, { useState, useEffect } from 'react';
import {
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
  CFormCheck,
  CButtonGroup,
  CCol,
  CRow,
  CFormSwitch,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CSpinner,
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilListRich, cilUser, cilSearch } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from 'src/utils/sweetAlerts';
import axiosInstance from 'src/axiosInstance';
import FormButtons from 'src/utils/FormButtons';
import '../../css/form.css';
import '../../css/table.css';

const CreateRoleWithHierarchy = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    permissions: []
  });

  const [permissionsData, setPermissionsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeModule, setActiveModule] = useState(null);

  const mainModules = {
    Masters: [
      'ACCESSORIES',
      'ACCESSORY_CATEGORY',
      'ATTACHMENTS',
      'BRANCH',
      'BROKER',
      'COLOR',
      'CSV',
      'DECLARATION',
      'EMPLOYEE',
      'FINANCE_PROVIDER',
      'HEADER',
      'INSURANCE',
      'INSURANCE_PROVIDER',
      'MODEL',
      'OFFER',
      'RTO',
      'SUBDEALERMODEL',
      'TERMS_CONDITION'
    ],
    Purchase: ['VEHICLE_INWARD', 'STOCK_TRANSFER'],
    Sales: ['BOOKING', 'FINANCE_LETTER', 'KYC'],
    Fund_Management: ['CASH_VOUCHER', 'CONTRA_VOUCHER', 'EXPENSE_ACCOUNT', 'WORKSHOP_RECEIPT'],
    Fund_Master: ['BANK', 'BANK_SUB_PAYMENT_MODE', 'CASH_LOCATION', 'EXPENSE_ACCOUNT'],
    Accessory_Billing: ['ACCESSORY_BILLING'],
    Account: ['LEDGER', 'BROKER_LEDGER'],
    Insurance: ['INSURANCE'],
    Rto: ['RTO_PROCESS'],
    Subdealer_Master: ['SUBDEALER', 'SUBDEALER_COMMISSION', 'SUBDEALERMODEL'],
    Subdealer_Accounts: ['SUBDEALER_ON_ACCOUNT', 'SUBDEALER_COMMISSION'],
    Quotation: ['CUSTOMER', 'QUOTATION'],
    User_Management: ['PERMISSION', 'ROLE', 'SUBDEALER', 'USER', 'USER_BUFFER', 'USER_STATUS']
  };

  useEffect(() => {
    fetchPermissions();
    if (id) fetchRole(id);
  }, [id]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/permissions');
      setPermissionsData(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to fetch permissions. Please try again.');
      setLoading(false);
    }
  };

  const fetchRole = async (roleId) => {
    try {
      const res = await axiosInstance.get(`/roles/${roleId}`);
      const serverPerms = res.data.data.permissions ?? [];

      if (permissionsData.length === 0) {
        await fetchPermissions();
      }

      const selectedPermissionIds = serverPerms.map((perm) => {
        if (typeof perm === 'object' && perm._id) {
          return perm._id;
        }
        return perm;
      });

      setFormData({
        ...res.data.data,
        permissions: selectedPermissionIds
      });
    } catch (error) {
      console.error('Error fetching role:', error);
      setError('Failed to fetch role data. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const togglePermission = (permissionId) => {
    setFormData((prev) => {
      const newPermissions = [...prev.permissions];
      const index = newPermissions.indexOf(permissionId);

      if (index >= 0) {
        newPermissions.splice(index, 1);
      } else {
        newPermissions.push(permissionId);
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  const handleModuleAction = (actionType, moduleName = null) => {
    setFormData((prev) => {
      let newPermissions = [...prev.permissions];

      const targetModule = moduleName || activeModule;

      if (!targetModule) return prev;

      if (actionType === 'none') {
        const modulePermissionIds = permissionsData.filter((p) => mainModules[targetModule].includes(p.module)).map((p) => p._id);

        newPermissions = newPermissions.filter((id) => !modulePermissionIds.includes(id));
      } else if (actionType === 'selectAll') {
        const modulePermissionIds = permissionsData.filter((p) => mainModules[targetModule].includes(p.module)).map((p) => p._id);
        modulePermissionIds.forEach((id) => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
      } else if (actionType === 'viewOnly') {
        const moduleReadPermissionIds = permissionsData
          .filter((p) => mainModules[targetModule].includes(p.module) && p.action === 'READ')
          .map((p) => p._id);
        const allModulePermissionIds = permissionsData.filter((p) => mainModules[targetModule].includes(p.module)).map((p) => p._id);

        newPermissions = newPermissions.filter((id) => !allModulePermissionIds.includes(id));

        moduleReadPermissionIds.forEach((id) => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  const handleGlobalAction = (actionType) => {
    setFormData((prev) => {
      let newPermissions = [];

      if (actionType === 'none') {
        return { ...prev, permissions: [] };
      }

      if (actionType === 'selectAll') {
        newPermissions = permissionsData.map((p) => p._id);
      }

      if (actionType === 'viewOnly') {
        newPermissions = permissionsData.filter((p) => p.action === 'READ').map((p) => p._id);
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  const formatLabel = (text) => {
    return text
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const isPermissionEnabled = (permissionId) => {
    return formData.permissions.includes(permissionId);
  };

  const getPermissionsForModule = (module) => {
    return permissionsData.filter((p) => p.module === module);
  };

  // Get available actions for a specific main module
  const getAvailableActionsForMainModule = (mainModule) => {
    const allActions = new Set();

    mainModules[mainModule].forEach((submodule) => {
      const submodulePermissions = getPermissionsForModule(submodule);
      submodulePermissions.forEach((permission) => {
        allActions.add(permission.action);
      });
    });

    return Array.from(allActions).sort();
  };

  const getFilteredMainModules = () => {
    return Object.keys(mainModules).filter((mainModule) => {
      if (!searchTerm) return true;

      const mainModuleMatch = mainModule.toLowerCase().includes(searchTerm.toLowerCase());
      const submoduleMatch = mainModules[mainModule].some((submodule) => submodule.toLowerCase().includes(searchTerm.toLowerCase()));

      return mainModuleMatch || submoduleMatch;
    });
  };

  const validate = () => {
    const { name, permissions } = formData;
    const errs = {};

    if (!name.trim()) errs.name = 'Role name is required';
    if (permissions.length === 0) errs.permissions = 'Please grant at least one permission';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData
    };

    try {
      if (id) {
        await axiosInstance.put(`/roles/${id}`, payload);
        await showFormSubmitToast('Role updated successfully!', () => navigate('/roles/all-role'));
      } else {
        await axiosInstance.post('/roles', payload);
        await showFormSubmitToast('Role created successfully!', () => navigate('/roles/all-role'));
      }
    } catch (error) {
      console.error('Role save error:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => navigate('/roles/all-role');

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <CSpinner color="primary" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-4">
        <CAlert color="danger">{error}</CAlert>
        <CButton color="primary" onClick={fetchPermissions}>
          Retry
        </CButton>
      </div>
    );
  }

  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} Role</h4>

      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>

            {/* ------------ Details block ------------- */}
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Role Name</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter role name" />
                </CInputGroup>
                {errors.name && <p className="error">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="input-box">
                <span className="details">Description</span>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilListRich} />
                  </CInputGroupText>
                  <CFormInput
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter role description"
                  />
                </CInputGroup>
              </div>

              <div className="input-box">
                <span className="details">Active Status</span>
                <CFormSwitch
                  label={formData.is_active ? 'Active' : 'Inactive'}
                  checked={formData.is_active}
                  onChange={() => setFormData((prev) => ({ ...prev, is_active: !prev.is_active }))}
                  style={{ height: '20px' }}
                />
              </div>
            </div>

            {/* ------------ Permissions table ------------- */}
            <div className="permissions-container mt-3">
              <CRow className="mb-3 align-items-center">
                <CCol>
                  <h6 className="mb-0">Permissions</h6>
                </CCol>
                <CCol className="text-end">
                  <CButtonGroup>
                    <CButton color="secondary" onClick={() => handleGlobalAction('none')} variant="outline">
                      None (All)
                    </CButton>
                    <CButton color="secondary" onClick={() => handleGlobalAction('selectAll')} variant="outline">
                      Select All (All)
                    </CButton>
                    <CButton color="secondary" onClick={() => handleGlobalAction('viewOnly')} variant="outline">
                      View Only (All)
                    </CButton>
                  </CButtonGroup>
                </CCol>
              </CRow>

              <CRow className="mb-3 align-items-center">
                <CCol>
                  <CInputGroup className="search-box">
                    <CInputGroupText className="input-icon">
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Search modules or submodules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ height: '35px' }}
                    />
                  </CInputGroup>
                </CCol>
              </CRow>

              <CAccordion activeItemKey={activeModule} onActiveItemChange={setActiveModule}>
                {getFilteredMainModules().map((mainModule) => {
                  const availableActionsForModule = getAvailableActionsForMainModule(mainModule);

                  return (
                    <CAccordionItem key={mainModule} itemKey={mainModule}>
                      <CAccordionHeader>
                        <div className="d-flex justify-content-between w-100 me-3">
                          <h6 className="mb-0">{formatLabel(mainModule)}</h6>
                          <span className="badge bg-primary rounded-pill">{mainModules[mainModule].length} submodules</span>
                        </div>
                      </CAccordionHeader>
                      <CAccordionBody>
                        <div className="module-actions mb-2">
                          <CButtonGroup size="sm">
                            <CButton color="secondary" onClick={() => handleModuleAction('none', mainModule)} variant="outline">
                              None
                            </CButton>
                            <CButton color="secondary" onClick={() => handleModuleAction('selectAll', mainModule)} variant="outline">
                              Select All
                            </CButton>
                            <CButton color="secondary" onClick={() => handleModuleAction('viewOnly', mainModule)} variant="outline">
                              View Only
                            </CButton>
                          </CButtonGroup>
                        </div>
                        <div className="table-responsive">
                          <CTable bordered responsive hover small className="permission-table">
                            <CTableHead color="light">
                              <CTableRow>
                                <CTableHeaderCell scope="col">Submodule</CTableHeaderCell>
                                {availableActionsForModule.map((action) => (
                                  <CTableHeaderCell key={action} scope="col" className="text-center">
                                    {action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()}
                                  </CTableHeaderCell>
                                ))}
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {mainModules[mainModule]
                                .filter(
                                  (submodule) =>
                                    !searchTerm ||
                                    submodule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    mainModule.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((submodule) => {
                                  const submodulePermissions = getPermissionsForModule(submodule);
                                  return (
                                    <CTableRow key={submodule}>
                                      <CTableHeaderCell className="table-header-fixed" scope="row">
                                        {formatLabel(submodule)}
                                      </CTableHeaderCell>
                                      {availableActionsForModule.map((action) => {
                                        const permission = submodulePermissions.find((p) => p.action === action);
                                        return (
                                          <CTableDataCell key={`${submodule}-${action}`} className="text-center">
                                            {permission ? (
                                              <CFormCheck
                                                type="checkbox"
                                                checked={isPermissionEnabled(permission._id)}
                                                onChange={() => togglePermission(permission._id)}
                                                aria-label={`${submodule}-${action}`}
                                              />
                                            ) : (
                                              <span>-</span>
                                            )}
                                          </CTableDataCell>
                                        );
                                      })}
                                    </CTableRow>
                                  );
                                })}
                            </CTableBody>
                          </CTable>
                        </div>
                      </CAccordionBody>
                    </CAccordionItem>
                  );
                })}
              </CAccordion>

              {errors.permissions && (
                <p className="error" style={{ color: 'red' }}>
                  {errors.permissions}
                </p>
              )}
            </div>

            {/* ------------ Buttons ------------- */}
            <FormButtons onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoleWithHierarchy;
