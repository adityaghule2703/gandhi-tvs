import React, { useState, useEffect } from 'react';
import '../../../css/form.css';
import { CInputGroup, CInputGroupText, CFormInput, CFormSelect, CFormCheck, CButton } from '@coreui/react';
import CIcon from '@coreui/icons-react';

import { cilSearch } from '@coreui/icons';
import {
  cilBank,
  cilBarcode,
  cilBike,
  cilBirthdayCake,
  cilBriefcase,
  cilCalendar,
  cilCarAlt,
  cilChartLine,
  cilCreditCard,
  cilEnvelopeClosed,
  cilFingerprint,
  cilHome,
  cilInstitution,
  cilList,
  cilListRich,
  cilLocationPin,
  cilMap,
  cilMoney,
  cilPaint,
  cilPeople,
  cilPhone,
  cilShieldAlt,
  cilSwapVertical,
  cilTask,
  cilUser
} from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../../utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';

function BookingForm() {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = localStorage.getItem('userRole');
  const isSalesExecutive = userRole === 'SALES_EXECUTIVE';

  const [formData, setFormData] = useState({
    model_id: '',
    model_color: '',
    customer_type: 'B2C',
    rto_type: 'MH',
    // branch: '',
    branch: isSalesExecutive ? storedUser.branch?._id : '',
    optionalComponents: [],
    // sales_executive: '',
    sales_executive: isSalesExecutive ? storedUser.id : '',
    gstin: '',
    rto_amount: '',
    salutation: '',
    name: '',
    pan_no: '',
    dob: '',
    occupation: '',
    address: '',
    taluka: '',
    district: '',
    pincode: '',
    mobile1: '',
    mobile2: '',
    aadhar_number: '',
    nomineeName: '',
    nomineeRelation: '',
    nomineeAge: '',
    type: 'cash',
    financer_id: '',
    scheme: '',
    emi_plan: '',
    gc_applicable: true,
    gc_amount: '',
    discountType: 'fixed',
    value: 0,
    selected_accessories: [],
    hpa: true,
    is_exchange: false,
    broker_id: '',
    exchange_price: '',
    vehicle_number: '',
    chassis_number: '',
    note: ''
  });

  const [errors, setErrors] = useState({});
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [colors, setColors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [salesExecutives, setSalesExecutives] = useState([]);
  const [financers, setFinancers] = useState([]);
  const [selectedBranchName, setSelectedBranchName] = useState('');
  const [modelDetails, setModelDetails] = useState(null);
  const [accessoriesTotal, setAccessoriesTotal] = useState(0);
  const [activeTab, setActiveTab] = useState(1);
  const [selectedModelHeaders, setSelectedModelHeaders] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (isSalesExecutive && storedUser.branch?._id) {
      fetchModels('B2C', storedUser.branch._id);
    } else {
      fetchModels('B2C');
    }
  }, []);

  const handleCustomerSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter PAN or Aadhar number');
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      const response = await axiosInstance.get(`/customer-ledgers/search?q=${encodeURIComponent(searchQuery)}`);

      if (response.data.success && response.data.data.customers.length > 0) {
        const customer = response.data.data.customers[0];

        const dobFromApi = customer.bookings?.[0]?.customerDetails?.dob;
        const formattedDob = dobFromApi ? dobFromApi.split('T')[0] : '';

        setFormData((prev) => ({
          ...prev,
          salutation: customer.bookings?.[0]?.customerDetails?.salutation || '',
          name: customer.name || '',
          pan_no: customer.pan || '',
          address: customer.address || '',
          taluka: customer.taluka || '',
          district: customer.district || '',
          mobile1: customer.mobile1 || '',
          mobile2: customer.mobile2 || '',
          aadhar_number: customer.aadhaar || '',
          pincode: customer.bookings?.[0]?.customerDetails?.pincode || '',
          dob: formattedDob,
          occupation: customer.bookings?.[0]?.customerDetails?.occupation || ''
        }));
      } else {
        setSearchError('No customer found with this PAN/Aadhar');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Error searching for customer');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBrokerChange = (e) => {
    const brokerId = e.target.value;
    const broker = brokers.find((b) => b._id === brokerId);
    setSelectedBroker(broker);
    setFormData((prev) => ({ ...prev, broker_id: brokerId }));
    setErrors((prev) => ({ ...prev, broker_id: '' }));
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
  };

  const handleSendOtp = async () => {
    try {
      if (!selectedBroker) return;

      const response = await axiosInstance.post(`/brokers/${selectedBroker._id}/send-otp`);
      if (response.data.success) {
        setOtpSent(true);
        setOtpVerified(false);
        setOtp('');
        showFormSubmitToast('OTP sent successfully to broker');
      } else {
        showFormSubmitError(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      showFormSubmitError(error.response?.data?.message || 'Error sending OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (!selectedBroker || !otp) return;

      const response = await axiosInstance.post('/brokers/verify-otp', {
        brokerId: selectedBroker._id,
        otp
      });

      if (response.data.success) {
        setOtpVerified(true);
        setOtpError('');
        showFormSubmitToast('OTP verified successfully');
      } else {
        setOtpError(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError(error.response?.data?.message || 'Error verifying OTP');
    }
  };

  useEffect(() => {
    if (isEditMode && formData.model_id && models.length > 0) {
      const selectedModel = models.find((model) => model._id === formData.model_id);
      if (selectedModel) {
        fetchAccessories(formData.model_id);
        fetchModelColors(formData.model_id);
      }
    }
  }, [isEditMode, formData.model_id, models]);

  useEffect(() => {
    if (id) {
      fetchBookingDetails(id);
      setIsEditMode(true);
    }
  }, [id]);

  const fetchBookingDetails = async (bookingId) => {
    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}`);
      const bookingData = response.data.data;

      if (isSalesExecutive && storedUser.branch?._id) {
        await fetchModels(bookingData.customerType, storedUser.branch._id);
      } else {
        await fetchModels(bookingData.customerType, bookingData.branch?._id);
      }

      await fetchModels(bookingData.customerType, bookingData.branch?._id);
      const optionalComponents = bookingData.priceComponents?.filter((pc) => pc.header && pc.header._id)?.map((pc) => pc.header._id) || [];
      setFormData({
        model_id: bookingData.model?.id || '',
        model_color: bookingData.color?.id || '',
        customer_type: bookingData.customerType || 'B2C',
        rto_type: bookingData.rto || 'MH',
        branch: bookingData.branch?._id || '',
        optionalComponents: optionalComponents,
        sales_executive: bookingData.salesExecutive?._id || '',
        gstin: bookingData.gstin || '',
        rto_amount: bookingData.rtoAmount || '',
        salutation: bookingData.customerDetails?.salutation || '',
        name: bookingData.customerDetails?.name || '',
        pan_no: bookingData.customerDetails?.panNo || '',
        dob: bookingData.customerDetails?.dob?.split('T')[0] || '',
        occupation: bookingData.customerDetails?.occupation || '',
        address: bookingData.customerDetails?.address || '',
        taluka: bookingData.customerDetails?.taluka || '',
        district: bookingData.customerDetails?.district || '',
        pincode: bookingData.customerDetails?.pincode || '',
        mobile1: bookingData.customerDetails?.mobile1 || '',
        mobile2: bookingData.customerDetails?.mobile2 || '',
        aadhar_number: bookingData.customerDetails?.aadharNumber || '',
        nomineeName: bookingData.customerDetails?.nomineeName || '',
        nomineeRelation: bookingData.customerDetails?.nomineeRelation || '',
        nomineeAge: bookingData.customerDetails?.nomineeAge || '',
        type: bookingData.payment?.type?.toLowerCase() || 'cash',
        financer_id: bookingData.payment?.financer?._id || '',
        scheme: bookingData.payment?.scheme || '',
        emi_plan: bookingData.payment?.emiPlan || '',
        gc_applicable: bookingData.payment?.gcApplicable || false,
        gc_amount: bookingData.payment?.gcAmount || 0,
        discountType: bookingData.discounts[0]?.type?.toLowerCase() || 'fixed',
        value: bookingData.discounts[0]?.amount || 0,
        // value: bookingData.discounts?.find((d) => d.source === 'SALES_EXECUTIVE')?.amount || 0,

        selected_accessories: bookingData.accessories?.map((a) => a.accessory?._id).filter(Boolean) || [],
        hpa: bookingData.hpa || false,
        is_exchange: bookingData.exchange ? 'true' : 'false',
        broker_id: bookingData.exchangeDetails?.broker?._id || '',
        exchange_price: bookingData.exchangeDetails?.price || '',
        vehicle_number: bookingData.exchangeDetails?.vehicleNumber || '',
        chassis_number: bookingData.exchangeDetails?.chassisNumber || '',
        note: bookingData.note || ''
      });

      setSelectedBranchName(bookingData.branch?.name || '');
      setModelDetails(bookingData.model || null);
      setAccessoriesTotal(bookingData.accessoriesTotal || 0);

      if (bookingData.model?.id) {
        fetchModels(bookingData.customerType, bookingData.branch?._id);
        fetchModelHeaders(bookingData.model.id);
        fetchAccessories(bookingData.model.id);
        fetchModelColors(bookingData.model.id);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      showFormSubmitError('Failed to load booking details');
    }
  };

  const validateGSTIN = (gstin) => {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return regex.test(gstin);
  };

  const validateTab1 = () => {
    const requiredFields = ['customer_type', 'model_id', 'branch'];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    // if (formData.customer_type === 'B2B' && !formData.gstin) {
    //   newErrors.gstin = 'GSTIN is required for B2B customers';
    // }

    if (formData.customer_type === 'B2B') {
      if (!formData.gstin) {
        newErrors.gstin = 'GSTIN is required for B2B customers';
      } else if (!validateGSTIN(formData.gstin)) {
        newErrors.gstin = 'Invalid GSTIN format. Please enter a valid 15-digit GST number';
      }
    }
    if ((formData.rto_type === 'BH' || formData.rto_type === 'CRTM') && !formData.rto_amount) {
      newErrors.rto_amount = 'RTO amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTab2 = () => {
    const requiredFields = ['model_color', 'sales_executive'];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    if (salesExecutives.length === 0 && formData.branch) {
      newErrors.sales_executive = 'No sales executives available for this branch';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTab4 = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = 'Payment type is required';
    }

    if (formData.is_exchange === 'true') {
      const exchangeFields = ['broker_id', 'exchange_price', 'vehicle_number', 'chassis_number'];
      exchangeFields.forEach((field) => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required for exchange';
        }
      });
      if (selectedBroker?.otp_required && !otpVerified) {
        newErrors.otpVerification = 'OTP verification is required for this broker';
      }
      if (brokers.length === 0) {
        newErrors.broker_id = 'No brokers available for this branch';
      }
    }
    if (formData.type === 'finance') {
      const financeFields = ['financer_id'];
      financeFields.forEach((field) => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required for finance';
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTab6 = () => {
    const newErrors = {};
    if (formData.value === '' || formData.value === null || formData.value === undefined) {
      newErrors.value = 'Discount value is required';
    } else if (isNaN(formData.value) || Number(formData.value) < 0) {
      newErrors.value = 'Discount must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMobileNumber = (mobile) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(mobile);
  };

  const validatePAN = (pan) => {
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(pan);
  };

  const validateAadhar = (aadhar) => {
    const regex = /^\d{12}$/;
    return regex.test(aadhar);
  };
  const validatePincode = (pincode) => {
    const regex = /^\d{6}$/;
    return regex.test(pincode);
  };
  const handleNextTab = () => {
    if (activeTab === 1) {
      if (!validateTab1()) {
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
        return;
      }
    } else if (activeTab === 2) {
      if (!validateTab2()) {
        return;
      }
    } else if (activeTab === 3) {
      const newErrors = {};
      const requiredFields = [
        'salutation',
        'name',
        'address',
        'mobile1',
        'aadhar_number',
        'pan_no',
        'dob',
        'occupation',
        'taluka',
        'district',
        'pincode',
        'nomineeName',
        'nomineeRelation',
        'nomineeAge'
      ];

      requiredFields.forEach((field) => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
        }
      });

      if (formData.mobile1 && !validateMobileNumber(formData.mobile1)) {
        newErrors.mobile1 = 'Invalid mobile number';
      }
      if (formData.mobile2 && !validateMobileNumber(formData.mobile2)) {
        newErrors.mobile2 = 'Invalid mobile number';
      }
      if (formData.pan_no && !validatePAN(formData.pan_no)) {
        newErrors.pan_no = 'Invalid PAN number';
      }
      if (formData.aadhar_number && !validateAadhar(formData.aadhar_number)) {
        newErrors.aadhar_number = 'Invalid Aadhar number';
      }
      if (formData.pincode && !validatePincode(formData.pincode)) {
        newErrors.pincode = 'Pincode must be exactly 6 digits';
      }
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        const firstErrorField = Object.keys(newErrors)[0];
        document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        return;
      }
    } else if (activeTab === 4) {
      if (!validateTab4()) {
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
        return;
      }
    } else if (activeTab === 6) {
      if (!validateTab6()) {
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
        return;
      }
    }
    if (activeTab < 6) {
      setActiveTab((prev) => prev + 1);
    }
  };

  useEffect(() => {
    fetchModels('B2C');
  }, []);

  const fetchModels = async (customerType = 'B2C', branchId = null) => {
    try {
      let endpoint = `/models/with-prices?customerType=${customerType}`;

      if (isSalesExecutive && storedUser.branch?._id) {
        endpoint += `&branch_id=${storedUser.branch._id}`;
      } else if (branchId) {
        endpoint += `&branch_id=${branchId}`;
      }

      const response = await axiosInstance.get(endpoint);
      const modelsData = response.data.data.models || [];

      const processedModels = modelsData.map((model) => {
        const mandatoryHeaders = model.prices.filter((price) => price.header && price.header.is_mandatory).map((price) => price.header._id);

        return {
          ...model,
          mandatoryHeaders,
          modelPrices: model.prices.filter((price) => price.header !== null)
        };
      });

      setModels(processedModels);
      setFilteredModels(processedModels);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axiosInstance.get('/branches');
        setBranches(response.data.data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
        showFormSubmitError(error.message);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchSalesExecutive = async () => {
      try {
        const response = await axiosInstance.get('/users');
        const filteredExecutives = formData.branch
          ? response.data.data.filter(
              (user) =>
                user.branch === formData.branch &&
                user.roles.some((role) => role.name === 'SALES_EXECUTIVE') &&
                user.status === 'ACTIVE' &&
                !user.isFrozen
            )
          : [];

        setSalesExecutives(filteredExecutives);

        if (formData.branch && filteredExecutives.length === 0) {
          setErrors((prev) => ({
            ...prev,
            sales_executive: 'No active sales executives available for this branch'
          }));
        }
      } catch (error) {
        console.error('Error fetching sales executive:', error);
        showFormSubmitError(error.message);
      }
    };
    fetchSalesExecutive();
  }, [formData.branch]);

  const fetchModelHeaders = async (modelId) => {
    try {
      const response = await axiosInstance.get(`/models/${modelId}`);
      const prices = response.data.data.model.prices || [];

      const selectedModel = models.find((model) => model._id === modelId);
      const mandatoryHeaders = selectedModel?.mandatoryHeaders || [];

      setFormData((prev) => ({
        ...prev,
        optionalComponents: [...prev.optionalComponents, ...mandatoryHeaders]
      }));

      setSelectedModelHeaders(prices);
      setModelDetails(response.data.data.model);

      const accessoriesTotal = calculateAccessoriesTotal(prices);
      setAccessoriesTotal(accessoriesTotal);
      fetchModelColors(modelId);
    } catch (error) {
      console.error('Failed to fetch model headers:', error);
      setSelectedModelHeaders([]);
      setModelDetails(null);
      setAccessoriesTotal(0);
    }
  };

  const calculateAccessoriesTotal = (prices) => {
    if (!prices || !Array.isArray(prices)) return 0;
    const accessoriesTotalHeader = prices.find((item) => item.header_key === 'ACCESSORIES TOTAL');
    return accessoriesTotalHeader ? accessoriesTotalHeader.value : 0;
  };

  const fetchAccessories = async (modelId) => {
    try {
      const response = await axiosInstance.get(`/accessories/model/${modelId}`);
      setAccessories(response.data.data.accessories || []);
    } catch (error) {
      console.error('Failed to fetch accessories:', error);
      setAccessories([]);
    }
  };

  const fetchModelColors = async (modelId) => {
    try {
      const response = await axiosInstance.get(`colors/model/${modelId}`);
      setColors(response.data.data.colors || []);
    } catch (error) {
      console.error('Failed to fetch model colors:', error);
      setColors([]);
    }
  };

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        if (!formData.branch) {
          setBrokers([]);
          return;
        }

        const response = await axiosInstance.get(`/brokers/branch/${formData.branch}`);
        setBrokers(response.data.data || []);

        if (response.data.data.length === 0) {
          setErrors((prev) => ({
            ...prev,
            broker_id: 'No brokers available for this branch'
          }));
        }
      } catch (error) {
        console.error('Error fetching brokers:', error);
        showFormSubmitError(error.message);
        setBrokers([]);
      }
    };
    if (formData.branch && formData.is_exchange === 'true') {
      fetchBrokers();
    }
  }, [formData.branch, formData.is_exchange]);

  useEffect(() => {
    const fetchFinancer = async () => {
      try {
        const response = await axiosInstance.get('/financers/providers');
        setFinancers(response.data.data || []);
      } catch (error) {
        console.error('Error fetching financers:', error);
        showFormSubmitError(error.message);
      }
    };
    fetchFinancer();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prevData) => ({ ...prevData, [name]: checked }));
    } else {
      if (name === 'hpa') {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value === 'true'
        }));
      } else {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
      }
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

    if (name === 'customer_type') {
      fetchModels(value, formData.branch);
      if (isSalesExecutive && storedUser.branch?._id) {
        fetchModels(value, storedUser.branch._id);
      } else {
        fetchModels(value, formData.branch);
      }
      setFormData((prev) => ({
        ...prev,
        model_id: '',
        model_name: ''
      }));
    } else if (name === 'branch' && !isSalesExecutive) {
      const selectedBranch = branches.find((b) => b._id === value);
      setSelectedBranchName(selectedBranch ? selectedBranch.name : '');
      fetchModels(formData.customer_type, value);
      setFormData((prev) => ({
        ...prev,
        model_id: '',
        model_name: ''
      }));
    } else if (name === 'model_id') {
      const selectedModel = models.find((model) => model._id === value);
      if (selectedModel) {
        setFormData((prev) => ({
          ...prev,
          model_name: selectedModel.model_name,
          model_id: value
        }));
        fetchAccessories(value);
        fetchModelColors(value);
      }
    }
  };

  const handleHeaderSelection = (headerId, isChecked) => {
    setFormData((prev) => {
      if (isChecked) {
        return {
          ...prev,
          optionalComponents: [...prev.optionalComponents, headerId]
        };
      } else {
        return {
          ...prev,
          optionalComponents: prev.optionalComponents.filter((id) => id !== headerId)
        };
      }
    });
  };

  const handleAccessorySelection = (accessoryId, isChecked) => {
    setFormData((prev) => {
      if (isChecked) {
        return {
          ...prev,
          selected_accessories: [...prev.selected_accessories, accessoryId]
        };
      } else {
        return {
          ...prev,
          selected_accessories: prev.selected_accessories.filter((id) => id !== accessoryId)
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiredFields = ['model_id', 'model_color', 'branch', 'customer_type', 'name', 'address', 'mobile1', 'aadhar_number', 'pan_no'];
    let formErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        formErrors[field] = 'This field is required';
      }
    });

    if (formData.customer_type === 'B2B' && !formData.gstin) {
      formErrors.gstin = 'GSTIN is required for B2B customers';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      const firstErrorField = Object.keys(formErrors)[0];
      document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }

    const requestBody = {
      model_id: formData.model_id,
      model_color: formData.model_color,
      customer_type: formData.customer_type,
      rto_type: formData.rto_type,
      branch: formData.branch,
      optionalComponents: formData.optionalComponents,
      sales_executive: formData.sales_executive,
      customer_details: {
        salutation: formData.salutation,
        name: formData.name,
        pan_no: formData.pan_no,
        dob: formData.dob,
        occupation: formData.occupation,
        address: formData.address,
        taluka: formData.taluka,
        district: formData.district,
        pincode: formData.pincode,
        mobile1: formData.mobile1,
        mobile2: formData.mobile2,
        aadhar_number: formData.aadhar_number,
        nomineeName: formData.nomineeName,
        nomineeRelation: formData.nomineeRelation,
        nomineeAge: formData.nomineeAge ? parseInt(formData.nomineeAge) : undefined
      },
      payment: {
        type: formData.type.toUpperCase(),
        ...(formData.type.toLowerCase() === 'finance' && {
          financer_id: formData.financer_id,
          scheme: formData.scheme,
          emi_plan: formData.emi_plan,
          gc_applicable: formData.gc_applicable,
          gc_amount: formData.gc_applicable ? parseFloat(formData.gc_amount) || 0 : 0
        })
      },
      discount: {
        type: formData.discountType,
        value: formData.value ? parseFloat(formData.value) : 0
      },
      accessories: {
        selected: formData.selected_accessories.map((id) => ({ id }))
      },
      hpa: formData.hpa === true,
      exchange: {
        is_exchange: formData.is_exchange === 'true',
        ...(formData.is_exchange === 'true' && {
          broker_id: formData.broker_id,
          exchange_price: formData.exchange_price ? parseFloat(formData.exchange_price) : 0,
          vehicle_number: formData.vehicle_number || '',
          chassis_number: formData.chassis_number || '',
          ...(selectedBroker?.otp_required && otpVerified && { otp })
        })
      },
      note: formData.note
    };

    if (formData.customer_type === 'B2B') {
      requestBody.gstin = formData.gstin;
    }
    if (formData.rto_type === 'BH' || formData.rto_type === 'CRTM') {
      requestBody.rto_amount = formData.rto_amount;
    }

    try {
      let response;
      if (isEditMode) {
        response = await axiosInstance.put(`/bookings/${id}`, requestBody);
      } else {
        response = await axiosInstance.post('/bookings', requestBody);
      }

      if (response.data.success) {
        const successMessage = isEditMode ? 'Booking updated successfully!' : 'Booking created successfully!';
        await showFormSubmitToast(successMessage, () => navigate('/booking-list'));
        navigate('/booking-list');
      } else {
        showFormSubmitError(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response) {
        const errorMsg =
          error.response.data.message ||
          (error.response.data.errors && Object.values(error.response.data.errors).join(', ')) ||
          'Error submitting booking';
        showFormSubmitError(errorMsg);
      } else {
        showFormSubmitError(error.message || 'Network error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedModelHeaders = () => {
    if (!formData.model_id) return [];

    const selectedModel = models.find((model) => model._id === formData.model_id);
    return selectedModel?.modelPrices || [];
  };

  return (
    <div className="form-container">
      <div className="title">{isEditMode ? 'Edit Booking' : 'Create New Booking'}</div>
      <div className="form-card">
        <div className="form-body">
          <form onSubmit={handleSubmit} id="bookingForm">
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>

            {activeTab === 1 && (
              <>
                <div className="user-details">
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Customer Type</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormSelect name="customer_type" value={formData.customer_type} onChange={handleChange}>
                        <option value="">-Select-</option>
                        <option value="B2B">B2B</option>
                        <option value="B2C">B2C</option>
                        <option value="CSD">CSD</option>
                      </CFormSelect>
                    </CInputGroup>
                    {errors.customer_type && <p className="error">{errors.customer_type}</p>}
                  </div>

                  {/* <div className="input-box">
                    <div className="details-container">
                      <span className="details">Branch</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilLocationPin} />
                      </CInputGroupText>
                      <CFormSelect name="branch" value={formData.branch} onChange={handleChange}>
                        <option value="">-Select-</option>
                        {branches.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.name} - {branch.branch_city}
                          </option>
                        ))}
                      </CFormSelect>
                    </CInputGroup>
                    {errors.branch && <p className="error">{errors.branch}</p>}
                  </div> */}

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Branch</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilLocationPin} />
                      </CInputGroupText>
                      {isSalesExecutive ? (
                        <CFormInput value={storedUser.branch?.name || ''} readOnly />
                      ) : (
                        <CFormSelect name="branch" value={formData.branch} onChange={handleChange}>
                          <option value="">-Select-</option>
                          {branches.map((branch) => (
                            <option key={branch._id} value={branch._id}>
                              {branch.name} - {branch.branch_city}
                            </option>
                          ))}
                        </CFormSelect>
                      )}
                    </CInputGroup>
                    {errors.branch && <p className="error">{errors.branch}</p>}
                  </div>
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Model Name</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilBike} />
                      </CInputGroupText>
                      <CFormSelect name="model_id" value={formData.model_id} onChange={handleChange} disabled={!formData.branch}>
                        <option value="">- Select a Model -</option>
                        {models.map((model) => (
                          <option key={model._id} value={model._id}>
                            {model.model_name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CInputGroup>
                    {errors.model_id && <p className="error">{errors.model_id}</p>}
                  </div>

                  {formData.customer_type === 'B2B' && (
                    <div className="input-box">
                      <div className="details-container">
                        <span className="details">GST Number</span>
                        <span className="required">*</span>
                      </div>
                      <CInputGroup>
                        <CInputGroupText className="input-icon">
                          <CIcon icon={cilBarcode} />
                        </CInputGroupText>
                        <CFormInput type="text" name="gstin" value={formData.gstin} onChange={handleChange} />
                      </CInputGroup>
                      {errors.gstin && <p className="error">{errors.gstin}</p>}
                    </div>
                  )}

                  <div className="input-box">
                    <span className="details">RTO</span>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilCarAlt} />
                      </CInputGroupText>
                      <CFormSelect name="rto_type" value={formData.rto_type} onChange={handleChange}>
                        <option value="">-Select-</option>
                        <option value="MH">MH</option>
                        <option value="BH">BH</option>
                        <option value="CRTM">CRTM</option>
                      </CFormSelect>
                    </CInputGroup>
                  </div>

                  {(formData.rto_type === 'BH' || formData.rto_type === 'CRTM') && (
                    <div className="input-box">
                      <div className="details-container">
                        <span className="details">RTO Amount</span>
                        <span className="required">*</span>
                      </div>
                      <CInputGroup>
                        <CInputGroupText className="input-icon">
                          <CIcon icon={cilMoney} />
                        </CInputGroupText>
                        <CFormInput type="text" name="rto_amount" value={formData.rto_amount} onChange={handleChange} />
                      </CInputGroup>
                      {errors.rto_amount && <p className="error">{errors.rto_amount}</p>}
                    </div>
                  )}

                  <div className="input-box">
                    <span className="details">HPA Applicable</span>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilShieldAlt} />
                      </CInputGroupText>
                      <CFormSelect name="hpa" value={formData.hpa} onChange={handleChange}>
                        <option value="">-Select-</option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </CFormSelect>
                    </CInputGroup>
                  </div>
                </div>

                {getSelectedModelHeaders().length > 0 && (
                  <div className="model-headers-section">
                    <h5>Model Options</h5>
                    <div className="headers-list">
                      {getSelectedModelHeaders()
                        .filter((price) => price.header && price.header._id)
                        .map((price) => {
                          const header = price.header;
                          const isMandatory = header.is_mandatory;
                          const isChecked = isMandatory || formData.optionalComponents.includes(header._id);

                          return (
                            <div key={header._id} className="header-item">
                              <CFormCheck
                                id={`header-${header._id}`}
                                label={`${header.header_key} (₹${price.value}) ${isMandatory ? '(Mandatory)' : ''}`}
                                checked={isChecked}
                                onChange={(e) => !isMandatory && handleHeaderSelection(header._id, e.target.checked)}
                                disabled={isMandatory}
                              />
                              {isMandatory && <input type="hidden" name={`mandatory-${header._id}`} value={header._id} />}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div className="booking-button-row">
                  <button type="button" className="btn btn-primary" onClick={handleNextTab}>
                    Next
                  </button>
                </div>
              </>
            )}

            {activeTab === 2 && (
              <>
                <div className="user-details">
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Vehicle Model</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilBike} />
                      </CInputGroupText>
                      <CFormSelect name="model_id" value={formData.model_id} onChange={handleChange} disabled={isEditMode}>
                        <option value="">- Select a Model -</option>
                        {models.map((model) => (
                          <option key={model._id} value={model._id}>
                            {model.model_name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CInputGroup>
                    {errors.model_id && <p className="error">{errors.model_id}</p>}
                  </div>
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Color</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilPaint} />
                      </CInputGroupText>
                      <CFormSelect name="model_color" value={formData.model_color || ''} onChange={handleChange}>
                        <option value="">-Select-</option>
                        {colors.map((color) => (
                          <option key={color._id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CInputGroup>
                    {errors.model_color && <p className="error">{errors.model_color}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Booking Date</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilCalendar} />
                      </CInputGroupText>
                      <CFormInput type="date" value={formData.booking_date || new Date().toISOString().split('T')[0]} />
                    </CInputGroup>
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Sales Executive</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormSelect
                        name="sales_executive"
                        value={formData.sales_executive || ''}
                        onChange={handleChange}
                        disabled={salesExecutives.length === 0}
                      >
                        <option value="">-Select-</option>
                        {salesExecutives.length > 0 ? (
                          salesExecutives.map((sales) => (
                            <option key={sales._id} value={sales._id}>
                              {sales.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No sales executives available for this branch
                          </option>
                        )}
                      </CFormSelect>
                    </CInputGroup>
                    {errors.sales_executive && <p className="error">{errors.sales_executive}</p>}
                  </div>

                  {/* <div className="input-box">
                    <div className="details-container">
                      <span className="details">Sales Executive</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      {isSalesExecutive ? (
                        <CFormInput value={storedUser.name || ''} readOnly />
                      ) : (
                        <CFormSelect
                          name="sales_executive"
                          value={formData.sales_executive || ''}
                          onChange={handleChange}
                          disabled={salesExecutives.length === 0}
                        >
                          <option value="">-Select-</option>
                          {salesExecutives.length > 0 ? (
                            salesExecutives.map((sales) => (
                              <option key={sales._id} value={sales._id}>
                                {sales.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No sales executives available for this branch
                            </option>
                          )}
                        </CFormSelect>
                      )}
                    </CInputGroup>
                    {errors.sales_executive && <p className="error">{errors.sales_executive}</p>}
                  </div> */}
                </div>
                <div className="booking-button-row">
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab(1)}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleNextTab}>
                    Next
                  </button>
                </div>
              </>
            )}

            {activeTab === 3 && (
              <>
                <div
                  className="search-section"
                  style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <h5>Search Existing Customer</h5>
                  <div className="user-details">
                    <div className="input-box">
                      <span className="details">Search by PAN or Aadhar</span>
                      <CInputGroup>
                        <CInputGroupText className="input-icon">
                          <CIcon icon={cilSearch} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Enter PAN or Aadhar number"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <CButton color="primary" onClick={handleCustomerSearch}>
                          Search
                        </CButton>
                      </CInputGroup>
                      {searchError && <p className="error">{searchError}</p>}
                      {searchLoading && <p>Searching...</p>}
                    </div>
                  </div>
                </div>
                <div className="user-details">
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Salutation</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormSelect name="salutation" value={formData.salutation} onChange={handleChange}>
                        <option value="">-Select-</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Miss">Miss</option>
                      </CFormSelect>
                    </CInputGroup>
                    {errors.salutation && <p className="error">{errors.salutation}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Full Name</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput name="name" value={formData.name} onChange={handleChange} />
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
                        <CIcon icon={cilHome} />
                      </CInputGroupText>
                      <CFormInput name="address" value={formData.address} onChange={handleChange} />
                    </CInputGroup>
                    {errors.address && <p className="error">{errors.address}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Taluka</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilMap} />
                      </CInputGroupText>
                      <CFormInput name="taluka" value={formData.taluka} onChange={handleChange} />
                    </CInputGroup>
                    {errors.taluka && <p className="error">{errors.taluka}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">District</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilMap} />
                      </CInputGroupText>
                      <CFormInput name="district" value={formData.district} onChange={handleChange} />
                    </CInputGroup>
                    {errors.district && <p className="error">{errors.district}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Pin Code</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilEnvelopeClosed} />
                      </CInputGroupText>
                      <CFormInput name="pincode" value={formData.pincode} onChange={handleChange} />
                    </CInputGroup>
                    {errors.pincode && <p className="error">{errors.pincode}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Contact Number</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilPhone} />
                      </CInputGroupText>
                      <CFormInput name="mobile1" value={formData.mobile1} onChange={handleChange} />
                    </CInputGroup>
                    {errors.mobile1 && <p className="error">{errors.mobile1}</p>}
                  </div>

                  <div className="input-box">
                    <span className="details">Alternate Contact Number</span>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilPhone} />
                      </CInputGroupText>
                      <CFormInput name="mobile2" value={formData.mobile2} onChange={handleChange} />
                    </CInputGroup>
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Aadhaar Number</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilFingerprint} />
                      </CInputGroupText>
                      <CFormInput name="aadhar_number" value={formData.aadhar_number} onChange={handleChange} />
                    </CInputGroup>
                    {errors.aadhar_number && <p className="error">{errors.aadhar_number}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">PAN Number</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilCreditCard} />
                      </CInputGroupText>
                      <CFormInput name="pan_no" value={formData.pan_no} onChange={handleChange} />
                    </CInputGroup>
                    {errors.pan_no && <p className="error">{errors.pan_no}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Birth Date</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilCalendar} />
                      </CInputGroupText>
                      <CFormInput type="date" name="dob" value={formData.dob} onChange={handleChange} />
                    </CInputGroup>
                    {errors.dob && <p className="error">{errors.dob}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Occupation</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilBriefcase} />
                      </CInputGroupText>
                      <CFormSelect name="occupation" value={formData.occupation} onChange={handleChange}>
                        <option value="">-Select-</option>
                        <option value="Student">Student</option>
                        <option value="Business">Business</option>
                        <option value="Service">Service</option>
                        <option value="Farmer">Farmer</option>
                      </CFormSelect>
                    </CInputGroup>
                    {errors.occupation && <p className="error">{errors.occupation}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Nominee Name</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput name="nomineeName" value={formData.nomineeName} onChange={handleChange} />
                    </CInputGroup>
                    {errors.nomineeName && <p className="error">{errors.nomineeName}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Nominee Relationship</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilPeople} />
                      </CInputGroupText>
                      <CFormInput name="nomineeRelation" value={formData.nomineeRelation} onChange={handleChange} />
                    </CInputGroup>
                    {errors.nomineeRelation && <p className="error">{errors.nomineeRelation}</p>}
                  </div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Nominee Age</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilBirthdayCake} />
                      </CInputGroupText>
                      <CFormInput name="nomineeAge" value={formData.nomineeAge} onChange={handleChange} />
                    </CInputGroup>
                    {errors.nomineeName && <p className="error">{errors.nomineeName}</p>}
                  </div>
                </div>

                <div className="booking-button-row">
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab(2)}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleNextTab}>
                    Next
                  </button>
                </div>
              </>
            )}

            {activeTab === 4 && (
              <>
                <div className="user-details">
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Exchange Mode</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilSwapVertical} />
                      </CInputGroupText>
                      <CFormSelect name="is_exchange" value={formData.is_exchange} onChange={handleChange}>
                        <option value="">-Select-</option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </CFormSelect>
                    </CInputGroup>
                    {errors.is_exchange && <p className="error">{errors.is_exchange}</p>}
                  </div>

                  {formData.is_exchange === 'true' && (
                    <>
                      <div className="input-box">
                        <div className="details-container">
                          <span className="details">Exchange Broker</span>
                          <span className="required">*</span>
                        </div>
                        <CInputGroup>
                          <CInputGroupText className="input-icon">
                            <CIcon icon={cilPeople} />
                          </CInputGroupText>
                          <CFormSelect name="broker_id" value={formData.broker_id} onChange={handleBrokerChange}>
                            <option value="">-Select-</option>
                            {brokers.map((broker) => (
                              <option key={broker._id} value={broker._id}>
                                {broker.name} {broker.otp_required ? '(OTP Required)' : ''}
                              </option>
                            ))}
                          </CFormSelect>
                        </CInputGroup>
                        {errors.broker_id && <p className="error">{errors.broker_id}</p>}
                      </div>

                      {selectedBroker && (
                        <div className="input-box">
                          <div className="details-container">
                            <span className="details">Broker Mobile</span>
                          </div>
                          <CInputGroup>
                            <CInputGroupText className="input-icon">
                              <CIcon icon={cilPhone} />
                            </CInputGroupText>
                            <CFormInput value={selectedBroker.mobile} readOnly />
                          </CInputGroup>
                        </div>
                      )}

                      <div className="input-box">
                        <div className="details-container">
                          <span className="details">Exchange Vehicle Number</span>
                          <span className="required">*</span>
                        </div>
                        <CInputGroup>
                          <CInputGroupText className="input-icon">
                            <CIcon icon={cilBike} />
                          </CInputGroupText>
                          <CFormInput name="vehicle_number" value={formData.vehicle_number} onChange={handleChange} />
                        </CInputGroup>
                        {errors.vehicle_number && <p className="error">{errors.vehicle_number}</p>}
                      </div>

                      <div className="input-box">
                        <div className="details-container">
                          <span className="details">Exchange Price</span>
                          <span className="required">*</span>
                        </div>
                        <CInputGroup>
                          <CInputGroupText className="input-icon">
                            <CIcon icon={cilMoney} />
                          </CInputGroupText>
                          <CFormInput name="exchange_price" value={formData.exchange_price} onChange={handleChange} />
                        </CInputGroup>
                        {errors.exchange_price && <p className="error">{errors.exchange_price}</p>}
                      </div>
                      <div className="input-box">
                        <div className="details-container">
                          <span className="details">Exchange Chassis Number</span>
                          <span className="required">*</span>
                        </div>
                        <CInputGroup>
                          <CInputGroupText className="input-icon">
                            <CIcon icon={cilBarcode} />
                          </CInputGroupText>
                          <CFormInput name="chassis_number" value={formData.chassis_number} onChange={handleChange} />
                        </CInputGroup>
                        {errors.chassis_number && <p className="error">{errors.chassis_number}</p>}
                      </div>
                      {selectedBroker?.otp_required && (
                        <div className="input-box">
                          <div className="details-container">
                            <span className="details">OTP Verification</span>
                            <span className="required">*</span>
                          </div>
                          {!otpSent ? (
                            <CButton color="primary" onClick={handleSendOtp}>
                              Send OTP
                            </CButton>
                          ) : (
                            <>
                              <CInputGroup>
                                <CInputGroupText className="input-icon">
                                  <CIcon icon={cilFingerprint} />
                                </CInputGroupText>
                                <CFormInput placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                                <CButton color="success" onClick={handleVerifyOtp}>
                                  Verify OTP
                                </CButton>
                              </CInputGroup>
                              {otpError && <p className="error">{otpError}</p>}
                            </>
                          )}
                          {otpVerified && <div className="alert alert-success mt-2">OTP verified successfully</div>}
                        </div>
                      )}
                    </>
                  )}

                  <div
                    style={{
                      width: '100%',
                      height: '2px',
                      backgroundColor: '#e0e0e0',
                      margin: '5px 0',
                      borderRadius: '2px'
                    }}
                  ></div>

                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Payment Type</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilBank} />
                      </CInputGroupText>
                      <CFormSelect name="type" value={formData.type} onChange={handleChange}>
                        <option value="">-Select-</option>
                        <option value="cash">Cash</option>
                        <option value="finance">Finance</option>
                      </CFormSelect>
                    </CInputGroup>
                    {errors.type && <p className="error">{errors.type}</p>}
                  </div>

                  {formData.type === 'finance' && (
                    <>
                      <div className="input-box">
                        <div className="details-container">
                          <span className="details">Financer Name</span>
                          <span className="required">*</span>
                        </div>
                        <CInputGroup>
                          <CInputGroupText className="input-icon">
                            <CIcon icon={cilInstitution} />
                          </CInputGroupText>
                          <CFormSelect name="financer_id" value={formData.financer_id} onChange={handleChange}>
                            <option value="">-Select Financer-</option>
                            {financers.map((financer) => (
                              <option key={financer._id} value={financer._id}>
                                {financer.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CInputGroup>
                        {errors.financer_id && <p className="error">{errors.financer_id}</p>}
                      </div>

                      {isEditMode && (
                        <>
                          <div className="input-box">
                            <div className="details-container">
                              <span className="details">GC Applicable</span>
                              <span className="required">*</span>
                            </div>
                            <CInputGroup>
                              <CInputGroupText className="input-icon">
                                <CIcon icon={cilTask} />
                              </CInputGroupText>
                              <CFormSelect name="gc_applicable" value={formData.gc_applicable} onChange={handleChange}>
                                <option value="">-Select-</option>
                                <option value={true}>Yes</option>
                                <option value={false}>No</option>
                              </CFormSelect>
                            </CInputGroup>
                            {errors.gc_applicable && <p className="error">{errors.gc_applicable}</p>}
                          </div>

                          {formData.gc_applicable && (
                            <>
                              <div className="input-box">
                                <div className="details-container">
                                  <span className="details">GC Amount</span>
                                </div>
                                <CInputGroup>
                                  <CInputGroupText className="input-icon">
                                    <CIcon icon={cilMoney} />
                                  </CInputGroupText>
                                  <CFormInput name="gc_amount" value={formData.gc_amount} onChange={handleChange} />
                                </CInputGroup>
                              </div>
                            </>
                          )}
                        </>
                      )}

                      <div className="input-box">
                        <span className="details">Finance Scheme</span>
                        <CInputGroup>
                          <CInputGroupText className="input-icon">
                            <CIcon icon={cilListRich} />
                          </CInputGroupText>
                          <CFormInput name="scheme" value={formData.scheme} onChange={handleChange} />
                        </CInputGroup>
                      </div>

                      <div className="input-box">
                        <span className="details">EMI Scheme</span>
                        <CInputGroup>
                          <CInputGroupText className="input-icon">
                            <CIcon icon={cilChartLine} />
                          </CInputGroupText>
                          <CFormInput name="emi_plan" value={formData.emi_plan} onChange={handleChange} />
                        </CInputGroup>
                      </div>
                    </>
                  )}
                </div>
                <div className="booking-button-row">
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab(3)}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleNextTab}>
                    Next
                  </button>
                </div>
              </>
            )}

            {activeTab === 5 && (
              <>
                <div>
                  <h5>Accessories</h5>
                  {accessories.length > 0 ? (
                    <>
                      <div className="accessories-list">
                        {accessories.map((accessory) => (
                          <div key={accessory._id} className="accessory-item">
                            <CFormCheck
                              id={`accessory-${accessory._id}`}
                              label={`${accessory.name} - ₹${accessory.price}`}
                              checked={formData.selected_accessories.includes(accessory._id)}
                              onChange={(e) => handleAccessorySelection(accessory._id, e.target.checked)}
                            />
                          </div>
                        ))}
                      </div>
                      {/* <div className="accessories-total">
                        <h6>Accessories Total: ₹{accessoriesTotal}</h6>
                      </div> */}
                    </>
                  ) : (
                    <p>No accessories available for this model</p>
                  )}
                </div>
                <div className="booking-button-row">
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab(4)}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleNextTab}>
                    Next
                  </button>
                </div>
              </>
            )}

            {activeTab === 6 && (
              <>
                <div className="user-details">
                  <div className="input-box">
                    <span className="details">Discount Amount</span>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilChartLine} />
                      </CInputGroupText>
                      <CFormInput name="value" value={formData.value} onChange={handleChange} />
                    </CInputGroup>
                  </div>
                  <div className="input-box">
                    <span className="details">Note</span>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilList} />
                      </CInputGroupText>
                      <CFormInput name="note" value={formData.note} onChange={handleChange} />
                    </CInputGroup>
                  </div>
                </div>
                <div>
                  {getSelectedModelHeaders().length > 0 && (
                    <div className="model-headers-section">
                      <h5>Model Options</h5>
                      <div className="headers-list">
                        {getSelectedModelHeaders()
                          .filter((price) => price.header && price.header._id)
                          .map((price) => {
                            const header = price.header;
                            const isMandatory = header.is_mandatory;
                            const isChecked = isMandatory || formData.optionalComponents.includes(header._id);

                            return (
                              <div key={header._id} className="header-item">
                                <CFormCheck
                                  id={`header-${header._id}`}
                                  label={`${header.header_key} (₹${price.value}) ${isMandatory ? '(Mandatory)' : ''}`}
                                  checked={isChecked}
                                  onChange={(e) => !isMandatory && handleHeaderSelection(header._id, e.target.checked)}
                                  disabled={isMandatory}
                                />
                                {isMandatory && <input type="hidden" name={`mandatory-${header._id}`} value={header._id} />}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="booking-button-row">
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveTab(5)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Apply for Approval'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookingForm;
