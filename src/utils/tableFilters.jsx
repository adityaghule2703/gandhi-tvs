import React, { useState } from 'react';

export const useTableFilter = (initialData) => {
  const [data, setData] = useState(initialData);
  const [filteredData, setFilteredData] = useState(initialData);

  const handleFilter = (searchValue, searchFields) => {
    if (!searchValue) {
      setFilteredData(data);
      return;
    }

    const searchTerm = searchValue.toLowerCase();
    const filtered = data.filter((row) =>
      searchFields.some((field) => {
        const value = field.split('.').reduce((obj, key) => {
          if (!obj) return '';
          if (key.match(/^\d+$/)) return obj[parseInt(key)];
          return obj[key];
        }, row);
        if (value === undefined || value === null) return false;

        if (typeof value === 'boolean') {
          return (value ? 'yes' : 'no').includes(searchTerm);
        }
        if (field === 'createdAt' && value instanceof Date) {
          return value.toLocaleDateString('en-GB').includes(searchTerm);
        }
        if (typeof value === 'number') {
          return String(value).includes(searchTerm);
        }
        return String(value).toLowerCase().includes(searchTerm);
      })
    );

    setFilteredData(filtered);
  };
  return {
    data,
    setData,
    filteredData,
    setFilteredData,
    handleFilter
  };
};

export const getDefaultSearchFields = (tableType) => {
  const fieldMap = {
    branch: ['name', 'address', 'city', 'state', 'pincode', 'email', 'phone', 'gst_number'],
    users: ['name', 'email', 'mobile', 'branchName', 'roles'],
    roles: ['name', 'description', 'permissions.resource', 'permissions.actions'],
    models: ['model_name'],
    headers: ['header_key', 'category_key', 'key', 'type', 'priority', 'page_no', 'hsn_code', 'gst_rate'],
    documents: ['name', 'description'],
    conditions: ['title', 'content', 'order'],
    offers: ['title', 'description', 'applyToAllModels', 'applicableModels'],
    customers: ['name', 'address', 'taluka', 'district', 'mobile1', 'mobile2'],
    attachments: ['title', 'description'],
    financer: ['name'],
    rto: [
      'rto_code',
      'rto_name',
      'bookingId.bookingNumber',
      'bookingId.chassisNumber',
      'bookingId.customerName',
      'bookingId.customerMobile',
      'applicationNumber',
      'bookingId.model.model_name'
    ],
    finance_rates: ['branchDetails.name', 'financeProviderDetails.name', 'gcRate'],
    insurance_provider: ['provider_name'],
    booking: [
      'bookingNumber',
      'model.model_name',
      'model.type',
      'color.name',
      'branch.name',
      'customerType',
      'rto',
      'rtoAmount',
      'hpa',
      'chassisNumber',
      'salesExecutive.name',
      'customerDetails.salutation',
      'customerDetails.name',
      'customerDetails.address',
      'customerDetails.taluka',
      'customerDetails.district',
      'customerDetails.pincode',
      'customerDetails.mobile1',
      'customerDetails.mobile2',
      'exchange',
      'exchangeDetails.broker.name',
      'payment.type',
      'payment.financer.name',
      'createdAt'
    ],
    accessories: ['name', 'description', 'price', 'part_number'],
    inward: [
      'unloadLocation.name',
      'type',
      'modelName',
      'color.name',
      'batteryNumber',
      'keyNumber',
      'chassisNumber',
      'engineNumber',
      'motorNumber',
      'chargerNumber'
    ],
    receipts: [
      'bookingNumber',
      'model.model_name',
      'customerDetails.name',
      'customerDetails.mobile1',
      'chassisNumber',
      'discountedAmount',
      'receivedAmount',
      'balanceAmount'
    ],
    expense: ['expense'],
    subdealerCommission: [
      'model_details.display_name',
      'model_details.type',
      'commission_rates.header_id.header_key',
      'commission_rates.commission_rate'
    ],
    stockTransfer: [
      'fromBranchDetails.name',
      'toBranchDetails?.name',
      'transferDate',
      'items.vehicle.modelName',
      'items.vehicle.model.model_name',
      'items.vehicle.color.name',
      'items.vehicle.chassisNumber'
    ],
    allReceipts: ['voucherId', 'recipientName', 'voucherType', 'paymentMode', 'bankLocation', 'cashLocation'],

    insurance: [
      'bookingNumber',
      'modelDetails.model_name',
      'customerDetails.name',
      'chassisNumber',
      'booking.model.model_name',

      'insuranceProviderDetails.provider_name',
      'booking.customerName',
      'booking.chassisNumber',
      'booking.bookingNumber',
      'insuranceDate'
    ],
    vouchers: [
      'voucherId',
      'recipientName',
      'updatedAt',
      'voucherType',
      'paymentMode',
      'paymentMode',
      'status',
      'bankLocation',
      'cashLocation'
    ],
    accessory_category: ['name', 'description'],
    color: ['model.model_name', 'name'],
    cash_bank_allocation: ['name', 'branchDetails?.name'],
    payment_mode: ['payment_mode'],
    expense: ['name'],
    subdealer: ['name', 'location', 'rateOfInterest', 'type'],
    allCustomers: ['custId', 'name', 'address', 'taluka', 'district', 'mobile1', 'mobile2', 'aadhaar', 'aadhaar']
  };

  return fieldMap[tableType] || Object.keys(fieldMap.branch);
};
