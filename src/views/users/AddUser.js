import React, { useState, useEffect } from 'react';
import '../../css/permission.css';
import '../../css/form.css';
import {
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormCheck,
  CButtonGroup,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilDollar, cilEnvelopeClosed, cilLocationPin, cilPhone, cilUser } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showError, showFormSubmitError, showFormSubmitToast } from 'src/utils/sweetAlerts';
import axiosInstance from 'src/axiosInstance';
import { jwtDecode } from 'jwt-decode';

function AddUser() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    branch: '',
    roleId: '',
    discount: '',
    permissions: []
  });

  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [permissionsData, setPermissionsData] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [availableActions, setAvailableActions] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPermissions, setShowPermissions] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded.user_id) {
          setFormData(prev => ({
            ...prev,
            created_by: decoded.user_id
          }));
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchBranches();
    fetchAllPermissions();
    if (id) fetchUser(id);
  }, [id]);

  const fetchUser = async (userId) => {
    try {
      const res = await axiosInstance.get(`/users/${userId}`);
      const userData = res.data.data;
      
      // Extract role permissions and user-specific permissions
      const rolePermissions = userData.roles[0]?.permissions || [];
      const userPermissions = userData.permissions?.map(p => p.permission) || [];
      
      setFormData({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        branch: userData.branchDetails?._id || '',
        roleId: userData.roles[0]?._id || '',
        discount: userData.discount || '',
        permissions: [...rolePermissions] // Only use role permissions initially
      });

      if (userData.roles[0]?._id) {
        setShowPermissions(true);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      showFormSubmitError(error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('/roles');
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showFormSubmitError(error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axiosInstance.get('/branches');
      setBranches(response.data.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      showError(error);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await axiosInstance.get('/permissions');
      setPermissionsData(res.data.data);
      
      const grouped = res.data.data.reduce((acc, permission) => {
        const module = permission.module;
        if (!acc[module]) {
          acc[module] = [];
        }
        acc[module].push({
          action: permission.action,
          id: permission._id
        });
        return acc;
      }, {});

      setGroupedPermissions(grouped);

      const actions = [...new Set(res.data.data.map((p) => p.action))];
      setAvailableActions(actions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchRolePermissions = async (roleId) => {
    if (!roleId) return;
    
    setIsLoadingPermissions(true);
    try {
      const res = await axiosInstance.get(`/roles/${roleId}`);
      const rolePermissions = res.data.data.permissions || [];
      
      // Only set role permissions, don't merge with existing
      setFormData(prev => ({
        ...prev,
        permissions: rolePermissions
      }));
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'roleId') {
      setShowPermissions(true);
      await fetchRolePermissions(value);
    }
  };

  const toggleAction = (module, action) => {
    setFormData(prev => {
      const permission = permissionsData.find(p => p.module === module && p.action === action);
      if (!permission) return prev;

      const newPermissions = prev.permissions.includes(permission._id)
        ? prev.permissions.filter(id => id !== permission._id)
        : [...prev.permissions, permission._id];

      return { ...prev, permissions: newPermissions };
    });
  };

  const handleGlobalAction = (actionType) => {
    setFormData(prev => {
      switch (actionType) {
        case 'none':
          return { ...prev, permissions: [] };
        case 'selectAll':
          return { ...prev, permissions: permissionsData.map(p => p._id) };
        case 'viewOnly':
          return { 
            ...prev, 
            permissions: permissionsData
              .filter(p => p.action === 'READ')
              .map(p => p._id)
          };
        default:
          return prev;
      }
    });
  };

  const isPermissionEnabled = (module, action) => {
    const permission = permissionsData.find(p => p.module === module && p.action === action);
    return permission && formData.permissions.includes(permission._id);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    if (!formData.roleId) newErrors.roleId = 'Role is required';

    const selectedRole = roles.find(role => role._id === formData.roleId);
    if (selectedRole?.name === 'SALES_EXECUTIVE') {
      if (formData.discount === '' || formData.discount === null) {
        newErrors.discount = 'Discount is required for Sales Executive';
      } else if (isNaN(Number(formData.discount))) {
        newErrors.discount = 'Discount must be a number';
      } else if (Number(formData.discount) < 0) {
        newErrors.discount = 'Discount must be positive';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      branch: formData.branch,
      roleId: formData.roleId,
      permissions: formData.permissions,
      ...(formData.discount !== '' && { discount: Number(formData.discount) })
    };

    try {
      if (id) {
        await axiosInstance.put(`/users/${id}`, payload);
        await showFormSubmitToast('User updated successfully!', () => navigate('/users/users-list'));
      } else {
        await axiosInstance.post('/auth/register', payload);
        await showFormSubmitToast('User added successfully!', () => navigate('/users/users-list'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showFormSubmitError(error);
    }
  };

  const handleCancel = () => {
    navigate('/users/users-list');
  };

  return (
    <div>
      <h4>{id ? 'Edit' : 'Add'} User</h4>
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
                  <CFormInput 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                  />
                </CInputGroup>
                {errors.name && <p className="error">{errors.name}</p>}
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
                  <CFormInput 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                  />
                </CInputGroup>
                {errors.email && <p className="error">{errors.email}</p>}
              </div>
              
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Branch</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilLocationPin} />
                  </CInputGroupText>
                  <CFormSelect 
                    name="branch" 
                    value={formData.branch} 
                    onChange={handleChange}
                  >
                    <option value="">-Select-</option>
                    {branches.map(branch => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.branch && <p className="error">{errors.branch}</p>}
              </div>
              
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Role</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect 
                    name="roleId" 
                    value={formData.roleId} 
                    onChange={handleChange}
                  >
                    <option value="">-Select-</option>
                    {roles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
                {errors.roleId && <p className="error">{errors.roleId}</p>}
              </div>
              
              {roles.find(role => role._id === formData.roleId)?.name === 'SALES_EXECUTIVE' && (
                <div className="input-box">
                  <div className="details-container">
                    <span className="details">Discount</span>
                    <span className="required">*</span>
                  </div>
                  <CInputGroup>
                    <CInputGroupText className="input-icon">
                      <CIcon icon={cilDollar} />
                    </CInputGroupText>
                    <CFormInput 
                      type="number" 
                      name="discount" 
                      value={formData.discount} 
                      onChange={handleChange} 
                      min="0"
                    />
                  </CInputGroup>
                  {errors.discount && <p className="error">{errors.discount}</p>}
                </div>
              )}

              <div className="input-box">
                <div className="details-container">
                  <span className="details">Mobile number</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilPhone} />
                  </CInputGroupText>
                  <CFormInput 
                    type="tel" 
                    name="mobile" 
                    value={formData.mobile} 
                    onChange={handleChange} 
                  />
                </CInputGroup>
                {errors.mobile && <p className="error">{errors.mobile}</p>}
              </div>
            </div>

            {showPermissions && (
              <div className="permissions-section mt-4">
                <h5>Permissions</h5>
                <div className="permissions-actions mb-3">
                  <CButtonGroup>
                    <CButton color="secondary" onClick={() => handleGlobalAction('none')} variant="outline">
                      None
                    </CButton>
                    <CButton color="secondary" onClick={() => handleGlobalAction('selectAll')} variant="outline">
                      Select All
                    </CButton>
                    <CButton color="secondary" onClick={() => handleGlobalAction('viewOnly')} variant="outline">
                      View Only
                    </CButton>
                  </CButtonGroup>
                </div>

                {isLoadingPermissions ? (
                  <div className="text-center py-4">Loading permissions...</div>
                ) : (
                  <div className="permissions-table-container">
                    <div className="permission-table-wrapper">
                      <CTable bordered responsive hover small className="permission-table">
                        <CTableHead color="light" className="permission-table-header">
                          <CTableRow>
                            <CTableHeaderCell scope="col" className="sticky-module-header">Module</CTableHeaderCell>
                            {availableActions.map(action => (
                              <CTableHeaderCell 
                                key={action} 
                                scope="col" 
                                className="text-center sticky-action-header"
                              >
                                {action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()}
                              </CTableHeaderCell>
                            ))}
                          </CTableRow>
                        </CTableHead>
                        <CTableBody className="permission-table-body">
                          {Object.entries(groupedPermissions).map(([module, actions]) => (
                            <CTableRow key={module}>
                              <CTableHeaderCell scope="row" className="sticky-module-cell">{module}</CTableHeaderCell>
                              {availableActions.map(action => (
                                <CTableDataCell key={`${module}-${action}`} className="text-center">
                                  {actions.some(a => a.action === action) ? (
                                    <CFormCheck
                                      type="checkbox"
                                      checked={isPermissionEnabled(module, action)}
                                      onChange={() => toggleAction(module, action)}
                                      aria-label={`${module}-${action}`}
                                    />
                                  ) : (
                                    <span>-</span>
                                  )}
                                </CTableDataCell>
                              ))}
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="button-row mt-4">
              <button type="submit" className="simple-button primary-button">
                Save
              </button>
              <button type="button" className="simple-button secondary-button" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddUser;