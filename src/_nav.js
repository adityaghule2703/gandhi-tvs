import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBank,
  cilCarAlt,
  cilCart,
  cilChartLine,
  cilCursor,
  cilDescription,
  cilDollar,
  cilDrop,
  cilFolderOpen,
  cilLibrary,
  cilMoney,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilShieldAlt,
  cilSpeedometer,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Components',
  },
  {
    component: CNavGroup,
    name: 'Purchase',
    to: '/purchase',
    icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
    visible: true,
    items: [
      {
        component: CNavItem,
        name: 'Inward Stock',
        to: '/inward-list',
      },
      {
        component: CNavItem,
        name: 'Stock Verification',
        to: '/stock-verification',
      },
      {
        component: CNavItem,
        name: 'Stock Transfer',
        to: '/stock-transfer',
      },
      {
        component: CNavItem,
        name: 'Upload Challan',
        to: '/upload-challan',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Sales',
    to: '/sales',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'New Booking',
        to: '/new-booking',
      },
      {
        component: CNavItem,
        name: 'All Booking',
        to: '/booking-list',
      },
      {
        component: CNavItem,
        name: 'Delivery Challan',
        to: '/delivery-challan',
      },
      {
        component: CNavItem,
        name: 'GST Invoice',
        to: '/gst-invoice',
      },
      {
        component: CNavItem,
        name: 'Helmet Invoice',
        to: '/helmet-invoice',
      },
      {
        component: CNavItem,
        name: 'Deal Form',
        to: '/deal-form',
      },
      {
        component: CNavItem,
        name: 'Upload Deal Form & Delivery Challan',
        to: '/upload-deal',
      },
      
    ],
  },
  {
    component: CNavGroup,
    name: 'Sales Report',
    to: '/purchase',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
    visible: true,
    items: [
      {
        component: CNavItem,
        name: 'Sales Person Wise',
        to: '/sales-report',
      },
      {
        component: CNavItem,
        name: 'Periodic Report',
        to: '/periodic-report',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Quotation',
    to: '/Quotation-list',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Account',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'PF/NPF Dashboard',
        to: '/account-dashboard',
      },
      {
        component: CNavItem,
        name: 'Receipts',
        to: '/account/receipt',
      },
      {
        component: CNavItem,
        name: 'Debit Note',
        to: '/debit-note',
      },
      {
        component: CNavItem,
        name: 'Refund',
        to: '/refund',
      },
      {
        component: CNavItem,
        name: 'All Receipts',
        to: '/account/all-receipt',
      },
      {
        component: CNavItem,
        name: 'Ledgers',
        to: '/view-ledgers',
      },
      {
        component: CNavItem,
        name: 'Exchange Ledger',
        to: '/exchange-ledgers',
      },
      {
        component: CNavItem,
        name: 'Broker Payment Verification',
        to: '/broker-payment',
      },
      {
        component: CNavItem,
        name: 'Report',
        to: '/receipt-report',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Insurance',
    to: '/purchase',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    visible: true,
    items: [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/sales-report',
      },
      {
        component: CNavItem,
        name: 'Add Insurance',
        to: '/periodic-report',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'RTO',
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/rto-dashboard',
      },
      {
        component: CNavItem,
        name: 'Application',
        to: '/rto/application',
      },
      {
        component: CNavItem,
        name: 'RTO Paper',
        to: '/rto/rto-paper',
      },
      {
        component: CNavItem,
        name: 'RTO Tax',
        to: '/rto/rto-tax',
      },
      {
        component: CNavItem,
        name: 'HSRP Ordering',
        to: '/rto/hsrp-ordering',
      },
      {
        component: CNavItem,
        name: 'HSRP Installation',
        to: '/rto/hsrp-installation',
      },
      {
        component: CNavItem,
        name: 'RC Confirmation',
        to: '/rto/rc-confirmation',
      },
      {
        component: CNavItem,
        name: 'Report',
        to: '/rto/report',
      }
    ],
  },
  {
    component: CNavGroup,
    name: 'Fund Management',
    icon: <CIcon icon={cilBank} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Cash Voucher',
        to: '/cash-voucher',
      },
      {
        component: CNavItem,
        name: 'Contra Voucher',
        to: '/contra-voucher',
      },
      {
        component: CNavItem,
        name: 'Contra Approval',
        to: '/contra-approval',
      },
      {
        component: CNavItem,
        name: 'Workshop Cash Receipt',
        to: '/workshop-receipt',
      },
      {
        component: CNavItem,
        name: 'All Cash Receipt',
        to: '/cash-receipt',
      },
      {
        component: CNavItem,
        name: 'Cash Book',
        to: '/cash-book',
      },
      {
        component: CNavItem,
        name: 'Day Book',
        to: '/day-book',
      },
      {
        component: CNavItem,
        name: 'Report',
        to: '/fund-report',
      }
    ],
  },
  {
    component: CNavGroup,
    name: 'Masters',
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Location',
        to: '/branch/branch-list',
      },
      {
        component: CNavItem,
        name: 'Headers',
        to: '/headers/headers-list',
      },
      {
        component: CNavItem,
        name: 'Vehicles',
        to: '/model/model-list',
      },
      {
        component: CNavItem,
        name: 'Accessories',
        to: '/accessories/accessories-list',
      },
      {
        component: CNavItem,
        name: 'Colour',
        to: '/color/color-list',
      },
      {
        component: CNavItem,
        name: 'Documents',
        to: '/documents/documents-list',
      },
      {
        component: CNavItem,
        name: 'Terms & Conditions',
        to: '/conditions/conditions-list',
      },
      {
        component: CNavItem,
        name: 'Offer',
        to: '/offers/offer-list',
      },
      {
        component: CNavItem,
        name: 'Attachments',
        to: '/attachments/attachments-list',
      },
      {
        component: CNavItem,
        name: 'Declaration',
        to: '/declaration-master',
      },
      {
        component: CNavItem,
        name: 'RTO',
        to: '/rto/rto-list',
      },
      {
        component: CNavItem,
        name: 'Financer',
        to: '/financer/financer-list',
      },
      {
        component: CNavItem,
        name: 'Finance Rates',
        to: '/financer-rates/rates-list',
      },
      {
        component: CNavItem,
        name: 'Insurance Providers',
        to: '/insurance-provider/provider-list',
      },
      {
        component: CNavItem,
        name: 'Brokers',
        to: '/broker/broker-list',
      },
      {
        component: CNavItem,
        name: 'Broker Commission Range',
        to: '/broker/commission-range',
      },
    
    ],
  },
  {
    component: CNavGroup,
    name: 'Fund Master',
    icon: <CIcon icon={cilDollar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Cash Account Master',
        to: '/cash-master',
      },
      {
        component: CNavItem,
        name: 'Bank Account Master',
        to: '/bank-master',
      },
      {
        component: CNavItem,
        name: 'Payment Mode',
        to: '/payment-mode',
      },
      {
        component: CNavItem,
        name: 'Expense Master',
        to: '/expense',
      },
      {
        component: CNavItem,
        name: 'Add Opening Balance',
        to: '/opening-balance',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Accessories Billing',
    to: '/accessories-billing',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Customers',
    to: '/all-customers',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'Incentive',
    to: '/purchase',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    visible: true,
    items: [
      {
        component: CNavItem,
        name: 'Add Incentive',
        to: '/sales-report',
      },
      {
        component: CNavItem,
        name: 'Calculate Incentive',
        to: '/periodic-report',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'SUBDEALER',
  },
  {
    component: CNavGroup,
    name: 'Master',
    to: '/purchase',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    visible: true,
    items: [
      {
        component: CNavItem,
        name: 'Subdealer List',
        to: '/sales-report',
      },
      {
        component: CNavItem,
        name: 'Subdealer Commission',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Calculate Commission',
        to: '/periodic-report',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Account',
    to: '/purchase',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    visible: true,
    items: [
      {
        component: CNavItem,
        name: 'Add Balance',
        to: '/sales-report',
      },
      {
        component: CNavItem,
        name: 'OnAccount Balance',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Payment Verification',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Finance Payment',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Subdealer Ledger',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Customer Ledger',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Summary',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Subdealer Commission',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Payment Summary',
        to: '/periodic-report',
      }
    ],
  },
  {
    component: CNavGroup,
    name: 'Booking',
    to: '/purchase',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    visible: true,
    items: [
      {
        component: CNavItem,
        name: 'New Booking',
        to: '/sales-report',
      },
      {
        component: CNavItem,
        name: 'All Booking',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Delivary Challan',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Invoice',
        to: '/periodic-report',
      },
      {
        component: CNavItem,
        name: 'Deal Form',
        to: '/periodic-report',
      }
    ],
  },
  {
    component: CNavGroup,
    name: 'Account',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Add Balance',
        to: '/branch/branch-list',
      },
      {
        component: CNavItem,
        name: 'OnAccount Balance',
        to: '/headers/headers-list',
      },
      {
        component: CNavItem,
        name: 'Payment Verification',
        to: '/model/model-list',
      },
      {
        component: CNavItem,
        name: 'Finance Payment',
        to: '/accessories/accessories-list',
      },
      {
        component: CNavItem,
        name: 'Subdealer Ledger',
        to: '/color/color-list',
      },
      {
        component: CNavItem,
        name: 'Customer Ledger',
        to: '/documents/documents-list',
      },
      {
        component: CNavItem,
        name: 'Summary',
        to: '/conditions/conditions-list',
      },
      {
        component: CNavItem,
        name: 'Subdealer Commission',
        to: '/offers/offer-list',
      },
      {
        component: CNavItem,
        name: 'Payment Summary',
        to: '/attachments/attachments-list',
      },
    ],
  },

  {
    component: CNavTitle,
    name: 'USER MANAGEMENT',
  },
  {
    component: CNavGroup,
    name: 'Roles',
    to: '/purchase',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    visible: true,
    items: [
      {
        component: CNavItem,
        name: 'Create Role',
        to: '/sales-report',
      },
      {
        component: CNavItem,
        name: 'All Role',
        to: '/periodic-report',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'User',
    to: '/purchase',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    visible: true,
    items: [
      {
        component: CNavItem,
        name: 'Add User',
        to: '/sales-report',
      },
      {
        component: CNavItem,
        name: 'User List',
        to: '/periodic-report',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Buffer Report',
    to: '/theme/typography',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Manager Deviation',
    to: '/theme/typography',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Extras',
  },
  {
    component: CNavGroup,
    name: 'Pages',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Login',
        to: '/login',
      },
    ],
  },
]

export default _nav
