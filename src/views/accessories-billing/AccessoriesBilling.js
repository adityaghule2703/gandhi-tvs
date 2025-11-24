import React, { useState, useEffect} from 'react';
import '../../css/form.css';
import { CInputGroup, CInputGroupText, CFormSelect } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBank, cilLocationPin, cilUser } from '@coreui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { showFormSubmitError, showFormSubmitToast } from '../../utils/sweetAlerts';
import axiosInstance from '../../axiosInstance';
import FormButtons from '../../utils/FormButtons';
import '../../css/offer.css';
import '../../css/accessoriesBilling.css';
import tvsLogo from '../../assets/images/logo.png';

function AccessoriesBilling() {
  const [formData, setFormData] = useState({
    billing_type: '',
    branch_id: '',
    booking_id: '',
    subdealer_id: '',
    payment_mode: '',
    bankLocation: '',
    subPaymentMode: '',
    cashLocation: '',
    items: [],
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [accessories, setAccessories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [subdealers, setSubdealers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedSubdealer, setSelectedSubdealer] = useState(null);
  const [banks, setBanks] = useState([]);
  const [cashLocations, setCashLocations] = useState([]);
  const [submodes, setSubModes] = useState([]);
  const [savedInvoiceId, setSavedInvoiceId] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const response = await axiosInstance.get('/accessories');
        setAccessories(response.data.data.accessories);
      } catch (error) {
        console.error('Failed to fetch accessories:', error);
      }
    };

    fetchAccessories();
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchBranches();
    fetchPaymentSubmodes();
    fetchCashLocation();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/bookings');
      const branchBookings = response.data.data.bookings.filter((booking) => booking.bookingType === 'BRANCH');
      setCustomers(branchBookings);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showFormSubmitError(error.message);
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

  const fetchPaymentSubmodes = async () => {
    try {
      const response = await axiosInstance.get('/banksubpaymentmodes');
      setSubModes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payment submodes:', error);
      showError(error);
    }
  };

  const fetchCashLocation = async () => {
    try {
      const response = await axiosInstance.get('/cash-locations');
      setCashLocations(response.data.data?.cashLocations || response.data.cashLocations || []);
    } catch (error) {
      console.error('Error fetching cash locations:', error);
      showError(error);
    }
  };

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axiosInstance.get('/banks');
        setBanks(response.data.data.banks || []);
      } catch (error) {
        console.error('Error fetching banks:', error);
        showError(error);
      }
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchSubdealers = async () => {
      try {
        const response = await axiosInstance.get('/subdealers');
        setSubdealers(response.data.data.subdealers || []);
      } catch (error) {
        console.error('Error fetching subdealers:', error);
        showFormSubmitError(error.message);
      }
    };
    fetchSubdealers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));

    if (name === 'booking_id') {
      const customer = customers.find((c) => c._id === value);
      setSelectedCustomer(customer || null);
    } else if (name === 'subdealer_id') {
      const subdealer = subdealers.find((s) => s._id === value);
      setSelectedSubdealer(subdealer || null);
    }
  };

  const handleAccessorySelect = (accessoryId) => {
    setFormData((prevData) => {
      const isSelected = prevData.items.some((a) => a.accessory_id === accessoryId);
      if (isSelected) {
        return {
          ...prevData,
          items: prevData.items.filter((a) => a.accessory_id !== accessoryId)
        };
      } else {
        const accessory = accessories.find((a) => a._id === accessoryId || a.id === accessoryId);
        return {
          ...prevData,
          items: [
            ...prevData.items,
            {
              accessory_id: accessoryId,
              quantity: 1,
              price: accessory.price,
              gst_rate: accessory.gst_rate,
              name: accessory.name,
              part_number: accessory.part_number
            }
          ]
        };
      }
    });
  };

  const handleQuantityChange = (accessoryId, quantity) => {
    if (quantity < 1) return;

    setFormData((prevData) => {
      const updatedItems = prevData.items.map((item) => {
        if (item.accessory_id === accessoryId) {
          return {
            ...item,
            quantity: parseInt(quantity)
          };
        }
        return item;
      });

      return { ...prevData, items: updatedItems };
    });
  };

  const calculateItemTotalWithGst = (item) => {
    const basePrice = item.price * item.quantity;
    const gstAmount = basePrice * (item.gst_rate / 100);
    return basePrice + gstAmount;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotalGst = () => {
    return formData.items.reduce((sum, item) => {
      const basePrice = item.price * item.quantity;
      return sum + basePrice * (item.gst_rate / 100);
    }, 0);
  };

  const calculateTotalWithGst = () => {
    return calculateSubtotal() + calculateTotalGst();
  };

  const generateInvoiceContent = () => {
    return `
      <div class="invoice">
        <div class="invoice-header">
          <div class="company-info">
            <img src="${tvsLogo}" alt="Company Logo" class="company-logo" />
            <p>
              Authorized Main Dealer: TVS Motor Company Ltd.<br>
              Registered office: 'JOGPREET' Asher Estate, Near Ichhamani Lawns,<br> Upnagar, Nashik Road, Nashik, 7498993672<br>
              <strong>GSTIN:</strong>27AAAAP0267H2ZN
            </p>
          </div>
          <div class="invoice-info">
            <h5>INVOICE</h5>
            <p>Invoice #: ${formData.invoiceNumber}</p>
            <p>Date: ${new Date(formData.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div class="invoice-body">
          <div class="billing-details">
            <div class="billed-to">
              <h5>Billed To:</h5>
              ${
                formData.billing_type === 'B2C' && selectedCustomer
                  ? `
                <p>${selectedCustomer.customerDetails.name}</p>
                <p>${selectedCustomer.customerDetails.address}</p>
                <p>${selectedCustomer.customerDetails.phone}</p>
              `
                  : formData.billing_type === 'B2B' && selectedSubdealer
                    ? `
                <p>${selectedSubdealer.name}</p>
                <p>${selectedSubdealer.address}</p>
                <p>${selectedSubdealer.contactNumber}</p>
                <p>GSTIN: ${selectedSubdealer.gstin}</p>
              `
                    : ''
              }
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Part Number</th>
                <th>Price</th>
                <th>GST Rate</th>
                <th>Quantity</th>
                <th>Total (incl. GST)</th>
              </tr>
            </thead>
            <tbody>
              ${formData.items
                .map(
                  (item, index) => `
                <tr key="${item.accessory_id}">
                  <td>${index + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.part_number}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>${item.gst_rate}%</td>
                  <td>${item.quantity}</td>
                  <td>₹${calculateItemTotalWithGst(item).toFixed(2)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">
                  Subtotal:
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td style="font-weight: bold;">₹${calculateSubtotal().toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">
                  GST Total:
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td style="font-weight: bold;">₹${calculateTotalGst().toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">
                  Grand Total:
                </td>
                <td style="font-weight: bold;"></td>
                <td></td>
                <td></td>
                <td style="font-weight: bold;">₹${calculateTotalWithGst().toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="terms">
            <h5>Terms & Conditions:</h5>
            <p>1. Goods once sold will not be taken back.</p>
            <p>2. Warranty as per company policy.</p>
            <p>3. Subject to Gandhi TVS.</p>
          </div>

          <div class="signature">
            <p>Authorized Signature</p>
          </div>
        </div>
      </div>
    `;
  };

  const openInvoiceInNewTab = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    const invoiceContent = generateInvoiceContent();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${formData.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            background-color: #f5f5f5;
          }
          .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .invoice {
            border: 1px solid #ddd;
            padding: 20px;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #ddd;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .company-info {
            flex: 2;
          }
          .company-logo {
            max-width: 120px;
            margin-bottom: 10px;
          }
          .invoice-info {
            flex: 1;
            text-align: right;
          }
          .invoice-info h5 {
            margin: 0 0 10px 0;
            font-size: 24px;
            color: #333;
          }
          .billing-details {
            margin-bottom: 20px;
          }
        
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .invoice-table th, .invoice-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          .invoice-table th {
            background-color: #f5f5f5;
          }
          .terms {
            margin-bottom: 30px;
          }
          .terms h5 {
            margin-bottom: 10px;
          }
          .signature {
            margin-top: 60px;
            text-align: right;
          }
          .print-instructions {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .print-buttons {
            text-align: center;
            margin: 20px 0;
          }
          .print-buttons button {
            margin: 0 10px;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
          .btn-print {
            background-color: #007bff;
            color: white;
          }
          .btn-close {
            background-color: #6c757d;
            color: white;
          }
          @media print {
            body {
              padding: 0;
              background-color: white;
            }
            .invoice-container {
              box-shadow: none;
              padding: 0;
            }
            .invoice {
              border: none;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          ${invoiceContent}
          
          <div class="print-instructions no-print">
            <h3>Invoice Ready</h3>
            <p>Your invoice has been generated successfully. You can:</p>
            <ul style="text-align: left; display: inline-block;">
              <li>Press <strong>Ctrl+P</strong> (Windows) or <strong>Cmd+P</strong> (Mac) to print</li>
              <li>Use the print button below</li>
              <li>Right-click and select "Print" from the menu</li>
            </ul>
          </div>
          
          <div class="print-buttons no-print">
            <button class="btn-print" onclick="window.print()">Print Invoice</button>
            <button class="btn-close" onclick="window.close()">Close Window</button>
          </div>
        </div>
        
        <script>
          // Auto-focus on the new window and attempt to print
          window.focus();
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};

    if (!formData.billing_type) formErrors.billing_type = 'Type is required';
    if (formData.billing_type === 'B2C' && !formData.booking_id) formErrors.booking_id = 'Customer is required';
    if (formData.billing_type === 'B2B' && !formData.subdealer_id) formErrors.subdealer_id = 'Subdealer is required';
    if (formData.items.length === 0) formErrors.items = 'Please select at least one accessory';

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Save the invoice and open in new tab
    await handleSave();
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    try {
      const payload = {
        billing_type: formData.billing_type,
        branch_id: formData.branch_id,
        booking_id: formData.booking_id,
        subdealer_id: formData.subdealer_id,
        items: formData.items.map((item) => ({
          accessory_id: item.accessory_id,
          quantity: item.quantity
        })),
        payment_mode: formData.payment_mode,
        bankLocation: formData.bankLocation,
        subPaymentMode: formData.subPaymentMode,
        cashLocation: formData.cashLocation
      };

      const response = await axiosInstance.post('/accessory-billing', payload);

      setSavedInvoiceId(response.data.data._id);
      showFormSubmitToast('Invoice saved successfully!');

      // Open the invoice in a new tab
      openInvoiceInNewTab();
    } catch (error) {
      console.error('Error saving invoice:', error);
      showFormSubmitError(error);
    }
  };

  return (
    <div>
      <h4>Accessories Billing</h4>
      <div className="form-container">
        <div className="page-header">
          <form onSubmit={handleSubmit}>
            <div className="form-note">
              <span className="required">*</span> Field is mandatory
            </div>
            <div className="user-details">
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Type</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect name="billing_type" value={formData.billing_type} onChange={handleChange}>
                    <option value="">-Select-</option>
                    <option value="B2B">B2B</option>
                    <option value="B2C">B2C</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.billing_type && <p className="error">{errors.billing_type}</p>}
              </div>
              {formData.billing_type === 'B2C' && (
                <>
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Branch</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilLocationPin} />
                      </CInputGroupText>
                      <CFormSelect name="branch_id" value={formData.branch_id} onChange={handleChange}>
                        <option value="">-Select-</option>
                        {branches.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CInputGroup>
                    {errors.branch_id && <p className="error">{errors.branch_id}</p>}
                  </div>
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Customer</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilLocationPin} />
                      </CInputGroupText>
                      <CFormSelect name="booking_id" value={formData.booking_id} onChange={handleChange}>
                        <option value="">-Select-</option>
                        {customers.map((customer) => (
                          <option key={customer._id} value={customer._id}>
                            {customer.customerDetails.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CInputGroup>
                    {errors.booking_id && <p className="error">{errors.booking_id}</p>}
                  </div>
                </>
              )}
              {formData.billing_type === 'B2B' && (
                <div className="input-box">
                  <div className="details-container">
                    <span className="details">Subdealer</span>
                    <span className="required">*</span>
                  </div>
                  <CInputGroup>
                    <CInputGroupText className="input-icon">
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormSelect name="subdealer_id" value={formData.subdealer_id} onChange={handleChange}>
                      <option value="">-Select-</option>
                      {subdealers.map((subdealer) => (
                        <option key={subdealer._id} value={subdealer._id}>
                          {subdealer.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>
                  {errors.subdealer_id && <p className="error">{errors.subdealer_id}</p>}
                </div>
              )}
              <div className="input-box">
                <div className="details-container">
                  <span className="details">Payment Mode</span>
                  <span className="required">*</span>
                </div>
                <CInputGroup>
                  <CInputGroupText className="input-icon">
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormSelect name="payment_mode" value={formData.payment_mode} onChange={handleChange}>
                    <option value="">-Select-</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                  </CFormSelect>
                </CInputGroup>
                {errors.payment_mode && <p className="error">{errors.payment_mode}</p>}
              </div>
              {formData.payment_mode === 'Bank' && (
                <>
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Submode</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilBank} />
                      </CInputGroupText>
                      <CFormSelect name="subPaymentMode" value={formData.subPaymentMode} onChange={handleChange}>
                        <option value="">-Select-</option>
                        {submodes.map((submode) => (
                          <option key={submode._id} value={submode._id}>
                            {submode.payment_mode}
                          </option>
                        ))}
                      </CFormSelect>
                    </CInputGroup>
                    {errors.subPaymentMode && <p className="error">{errors.subPaymentMode}</p>}
                  </div>
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Bank Location</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilBank} />
                      </CInputGroupText>
                      <CFormSelect
                        name="bankLocation"
                        value={formData.bankLocation}
                        onChange={handleChange}
                        invalid={!!errors.bankLocation}
                      >
                        <option value="">-Select-</option>
                        {banks.map((bank) => (
                          <option key={bank._id} value={bank._id}>
                            {bank.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CInputGroup>
                    {errors.bankLocation && <p className="error">{errors.bankLocation}</p>}
                  </div>
                </>
              )}
              {formData.payment_mode === 'Cash' && (
                <>
                  <div className="input-box">
                    <div className="details-container">
                      <span className="details">Cash Location</span>
                      <span className="required">*</span>
                    </div>
                    <CInputGroup>
                      <CInputGroupText className="input-icon">
                        <CIcon icon={cilBank} />
                      </CInputGroupText>
                      <CFormSelect name="cashLocation" value={formData.cashLocation} onChange={handleChange} invalid={!!errors.cash}>
                        <option value="">-Select-</option>
                        {cashLocations.map((cash) => (
                          <option key={cash._id} value={cash._id}>
                            {cash.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CInputGroup>
                    {errors.cashLocation && <p className="error">{errors.cashLocation}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="offer-container">
              <div className="permissions-form">
                <h4>
                  Select Accessories <span className="required">*</span>
                </h4>
                <div className="permissions-grid">
                  {accessories.map((accessory) => {
                    const accessoryId = accessory._id || accessory.id;
                    const isSelected = formData.items.some((a) => a.accessory_id === accessoryId);
                    const priceWithGst = accessory.price * (1 + accessory.gst_rate / 100);

                    return (
                      <div key={accessoryId} className="permission-item accessory-item">
                        <label>
                          <input type="checkbox" checked={isSelected} onChange={() => handleAccessorySelect(accessoryId)} />
                          {accessory.name} - ₹{priceWithGst.toFixed(2)} (incl. {accessory.gst_rate}% GST)
                        </label>
                        {isSelected && (
                          <div className="quantity-control">
                            <span>Qty: </span>
                            <input
                              type="number"
                              min="1"
                              value={formData.items.find((a) => a.accessory_id === accessoryId)?.quantity || 1}
                              onChange={(e) => handleQuantityChange(accessoryId, e.target.value)}
                              className="quantity-input"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {errors.items && <p className="error">{errors.items}</p>}
                </div>
              </div>
            </div>

            <div className="selected-items">
              <h4>Selected Accessories</h4>
              {formData.items.length > 0 ? (
                <ul>
                  {formData.items.map((item) => (
                    <li key={item.accessory_id}>
                      {item.name} - ₹{item.price} x {item.quantity} + {item.gst_rate}% GST = ₹{calculateItemTotalWithGst(item).toFixed(2)}
                    </li>
                  ))}
                  <li className="total">Subtotal: ₹{calculateSubtotal().toFixed(2)}</li>
                  <li className="total">GST Total: ₹{calculateTotalGst().toFixed(2)}</li>
                  <li className="total">Grand Total: ₹{calculateTotalWithGst().toFixed(2)}</li>
                </ul>
              ) : (
                <p>No accessories selected</p>
              )}
            </div>

            <FormButtons onCancel={handleCancel} submitText="Save Invoice" />
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccessoriesBilling;
