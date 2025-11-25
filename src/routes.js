
// import { AddCardSharp } from '@mui/icons-material'
// import { element } from 'prop-types'
// import React from 'react'

// const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// // Purchase
// const InwardStock = React.lazy(() => import('./views/purchase/InwardStock'))
// const StockList = React.lazy(() => import('./views/purchase/StockList'))
// const StockVerification = React.lazy(() => import('./views/purchase/StockVerification'))
// const StockTransfer = React.lazy(() => import('./views/purchase/StockTransfer'))
// const UploadChallan = React.lazy(() => import('./views/purchase/UploadChallan'))

// //Masters
// const AddBranch = React.lazy(() => import('./views/masters/branch/AddBranch'))
// const BranchList = React.lazy(() => import('./views/masters/branch/BranchList'))
// const AddHeader = React.lazy(() => import('./views/masters/headers/AddHeader'))
// const HeadersList = React.lazy(() => import('./views/masters/headers/HeaderList'))
// const AddModel = React.lazy(() => import('./views/masters/model/AddModel'))
// const ModelList = React.lazy(() => import('./views/masters/model/ModelList'))
// const UpdateModel = React.lazy(() => import('./views/masters/model/UpdateModel'))
// const AddAccessories = React.lazy(() => import('./views/masters/accessories/AddAccessories'))
// const AccessoriesList = React.lazy(() => import('./views/masters/accessories/AccessoriesList'))
// const ColorList = React.lazy(() => import('./views/masters/color/ColorList'))
// const AddColor = React.lazy(() => import('./views/masters/color/AddColor'))
// const AddDocuments = React.lazy(() => import('./views/masters/documents/AddDocument'))
// const DocumentsList = React.lazy(() => import('./views/masters/documents/DocumentsList'))
// const AddCondition = React.lazy(() => import('./views/masters/terms&conditions/AddCondition'))
// const ConditionList = React.lazy(() => import('./views/masters/terms&conditions/ConditionList'))

// const AddOffers = React.lazy(() => import('./views/masters/offer/AddOffers'))
// const OffersList = React.lazy(() => import('./views/masters/offer/OffersList'))
// const AddAttachments = React.lazy(() => import('./views/masters/attachments/AddAttachments'))
// const AttachmentsList = React.lazy(() => import('./views/masters/attachments/AttachmentsList'))
// const AddDeclaration = React.lazy(() => import('./views/masters/declaration/AddDeclaration'))
// const DeclarationList = React.lazy(() => import('./views/masters/declaration/DeclarationList'))

// const AddRto = React.lazy(() => import('./views/masters/rto/AddRto'))
// const RtoList = React.lazy(() => import('./views/masters/rto/RtoList'))

// const AddFinancer = React.lazy(() => import('./views/masters/financer/AddFinancer'))
// const FinancerList = React.lazy(() => import('./views/masters/financer/FinancerList'))
// const AddFinanceRates = React.lazy(() => import('./views/masters/financeRates/AddRates'))
// const FinanceRatesList = React.lazy(() => import('./views/masters/financeRates/RatesList'))
// const AddInsuranceProviders = React.lazy(() => import('./views/masters/insuranceProviders/AddProvider'))
// const InsuranceProvidersList = React.lazy(() => import('./views/masters/insuranceProviders/ProvidersList'))
// const AddBroker = React.lazy(() => import('./views/masters/broker/AddBroker'))
// const BrokerList = React.lazy(() => import('./views/masters/broker/BrokerList'))

// const BrokerCommissionRange = React.lazy(() => import('./views/masters/commission-range/BrokerRange'))
// const CommissionRangeList = React.lazy(() => import('./views/masters/commission-range/RangeList')) 

// //Sales
// const NewBooking = React.lazy(() => import('./views/sales/booking/NewBooking'))
// const BookingList = React.lazy(() => import('./views/sales/booking/BookingList'))
// const DeliveryChallan = React.lazy(() => import('./views/sales/delivery-challan/DeliveryChallan'))
// const GSTInvoice = React.lazy(() => import('./views/sales/Invoice'))
// const HelmetInvoice = React.lazy(() => import('./views/sales/HelmetInvoice'))
// const DealForm = React.lazy(() => import('./views/sales/DealForm'))
// const UploadDealForm = React.lazy(() => import('./views/sales/UploadDealForm'))

// //Sales Report
// const SalesReport = React.lazy(() => import('./views/sales-report/SalesReport'))
// const PeriodicReport = React.lazy(() => import('./views/sales-report/PeriodicReport'))
// //Account
// const AccountDashboard = React.lazy(() => import('./views/account/AccountDashboard'))
// const Receipts = React.lazy(() => import('./views/account/Receipt'))
// const DebitNote = React.lazy(() => import('./views/account/debit-note/DebitNote'))
// const CustomerRefund = React.lazy(() => import('./views/account/Refund'))
// const AllReceipts = React.lazy(() => import('./views/account/AllReceipt'))
// const CustomerLedger = React.lazy(() => import('./views/account/ViewLedger'))
// const ExchangeLedger = React.lazy(() => import('./views/account/ExchangeLedger'))
// const BrokerPayment = React.lazy(() => import('./views/account/broker-payment/PaymentVerification'))
// const VoucherReport = React.lazy(() => import('./views/account/ReceiptReport'))

// //RTO
// const RTODashboard = React.lazy(() => import('./views/rto/RTODashboard'))
// const Application = React.lazy(() => import('./views/rto/Application'))
// const RTOPaper = React.lazy(() => import('./views/rto/RTOPaper'))
// const RTOTax = React.lazy(() => import('./views/rto/RTOTax'))
// const HSRPOrdering = React.lazy(() => import('./views/rto/HSRPOrdering'))
// const HSRPInstallation = React.lazy(() => import('./views/rto/HSRPInstallation'))
// const RCConfirmation = React.lazy(() => import('./views/rto/RCConfirmation'))
// const RTOReport = React.lazy(() => import('./views/rto/RTOReport'))
// const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

// //Fund Management

// const CashVoucher = React.lazy(() => import('./views/fund-management/CashVoucher'))
// const ContraVoucher = React.lazy(() => import('./views/fund-management/ContraVoucher'))
// const ContraApproval = React.lazy(() => import('./views/fund-management/ContraApproval'))
// const WorkshopReceipt = React.lazy(() => import('./views/fund-management/WorkshopReceipt'))
// const CashReceipt = React.lazy(() => import('./views/fund-management/CashReceipt'))
// const CashBook = React.lazy(() => import('./views/fund-management/CashBook'))
// const DayBook = React.lazy(() => import('./views/fund-management/DayBook'))
// const FundReport = React.lazy(() => import('./views/fund-management/FundReport'))

// //Fund Master

// const AddCash = React.lazy(() => import('./views/fund-master/AddCash'))
// const CashList = React.lazy(() => import('./views/fund-master/CashList'))
// const AddBank = React.lazy(() => import('./views/fund-master/AddBank'))
// const BankList = React.lazy(() => import('./views/fund-master/BankList'))
// const AddExpense = React.lazy(() => import('./views/fund-master/AddExpense'))
// const ExpenseList = React.lazy(() => import('./views/fund-master/ExpenseList'))
// const AddOpeningBalance = React.lazy(() => import('./views/fund-master/AddOpeningBalance'))
// const OpeningBalanceList = React.lazy(() => import('./views/fund-master/OpeningBalanceList'))

// const AccessoriesBilling = React.lazy(() => import('./views/accessories-billing/AccessoriesBilling'))
// const AllCustomersLedger = React.lazy(() => import('./views/all-customers/AllCustomers'))
// const AddPaymentMode = React.lazy(() => import('./views/fund-master/payment-mode/PaymentMode'))
// const PaymentModeList = React.lazy(() => import('./views/fund-master/payment-mode/PaymentModeList'))

// //Quotation

// const AddQuotation = React.lazy(() => import('./views/quotation/AddQuotation'))
// const QuotationList = React.lazy(() => import('./views/quotation/QuotationList'))

// const routes = [
//   { path: '/', exact: true, name: 'Home' },
//   { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  
//   //purchase
//   { path: '/inward-stock', name: 'Inward Stock', element: InwardStock},
//   { path: '/inward-list', name: 'Stock List', element: StockList},
//   { path: '/inward-stock', name: 'Inward Stock', element: InwardStock},
//   { path: '/inward-list', name: 'Stock List', element: StockList},
//   { path:'/stock-verification',name: 'Stock Verification', element: StockVerification},
//   { path:'/stock-transfer',name: 'Stock Transfer', element: StockTransfer},
//   { path:'/upload-challan',name: 'Upload Challan', element: UploadChallan},
  
   
//   //Masters
//   { path:'/branch/branch-list',name: 'Branch List', element: BranchList},
//   { path:'/branch/add-branch',name: 'Add Branch', element: AddBranch},
  
//   { path:'/headers/headers-list', name:'Headers List', element:HeadersList},
//   { path:'/headers/add-header', name:'Add Headers', element:AddHeader},
//   { path:'/model/model-list', name:"model List", element:ModelList},
//   { path:'/model/add-model', name:"Add Model", element:AddModel},
//   { path:'/model/update-model/:id', name:'Update Model', element:UpdateModel},

//   { path:'/accessories/add-accessories', name:"Add Accessories", element:AddAccessories},
//   { path:'/accessories/update-accessories/:id', name:"Add Accessories", element:AddAccessories},
//   { path:'/accessories/accessories-list', name:"Accessories List", element:AccessoriesList},
//   { path:'/color/color-list',name:"Color List", element:ColorList},
//   { path:'/color/add-color',name:"Add Color", element:AddColor},
//   { path:'/color/update-color/:id',name:"Update Color", element:AddColor},
//   { path:'/documents/add-document', name:"Add Document", element:AddDocuments},
//   { path:'/documents/update-document/:id', name:"Add Accessories", element:AddDocuments},
//   { path:'/documents/documents-list', name:"documents List", element:DocumentsList},

//   { path:'/conditions/conditions-list',name:"Color List", element:ConditionList},
//   { path:'/conditions/add-condition',name:"Add Color", element:AddCondition},
//   { path:'/conditions/update-condition/:id',name:"Update Color", element:AddCondition},

//   { path:'/offers/offer-list', name:'Offers List', element:OffersList},
//   { path:'/offers/add-offer', name:'Add Offers', element:AddOffers},
//   { path:'/offers/update-offer/:id', name:'Update Offers', element:AddOffers},

//   { path:'/attachments/attachments-list', name:'Attachments List', element:AttachmentsList},
//   { path:'/attachments/add-attachments', name:'Add Attachments', element:AddAttachments},
//   { path:'/attachments/update-attachments/:id', name:'Update Attachments', element:AddAttachments},
  
//   { path:'/add-declaration', name:'Add Declaration', element:AddDeclaration},
//   { path:'/update-declaration/:id', name:'Edit Declaration', element:AddDeclaration},
//   { path:'/declaration-master', name:'Declaration List', element:DeclarationList},

//   { path:'/rto/rto-list', name:'Rto List', element:RtoList},
//   { path:'/rto/add-rto', name:'Add RTO', element:AddRto},
//   { path:'/rto/update-rto/:id', name:'Edit RTO', element:AddRto},

//   { path:'/financer/financer-list', name:'Financer List', element:FinancerList},
//   { path:'/financer/add-financer', name:'Add Financer', element:AddFinancer},
//   { path:'/financer/update-financer/:id', name:'Edit Financer', element:AddFinancer},

//   { path:'/financer-rates/rates-list', name:'Financer Rates', element:FinanceRatesList},
//   { path:'/financer-rates/add-rates', name:'Add Finance Rates', element:AddFinanceRates},
//   { path:'/financer-rates/update-rates/:id', name:'Edit Finance Rates', element:AddFinanceRates},

//   { path:'/insurance-provider/provider-list', name:'Insurance Providers List', element:InsuranceProvidersList},
//   { path:'/insurance-provider/add-provider', name:'Add Insurance Provider', element:AddInsuranceProviders},
//   { path:'/insurance-provider/update-provider/:id', name:'Edit Insurance Provider', element:AddInsuranceProviders},
 
//   { path:'/broker/broker-list', name:'Brokers', element:BrokerList},
//   { path:'/broker/add-broker', name:'Add Broker', element:AddBroker},
//   { path:'/broker/update-broker/:id', name:'Edit Broker', element:AddBroker},

//   { path:'/broker/commission-range', name:'Broker Commission', element:CommissionRangeList},
//   { path:'/broker/add-range', name:'Add Commission Range', element:BrokerCommissionRange},

//   //Sales
//   { path:'/new-booking', name:'New Booking', element:NewBooking},
//   { path:'/booking-list', name:'Booking List', element:BookingList},
//   { path:'/update-booking/:id', name:'Edit Booking', element:NewBooking},

//   { path:'/delivery-challan', name:'Delivery Challan', element:DeliveryChallan},
//   { path:'/gst-invoice', name:'GST Invoice', element:GSTInvoice},
//   { path:'/helmet-invoice', name:'Helmet Invoice', element:HelmetInvoice},
//   { path:'/deal-form', name:'Deal Form', element:DealForm},
//   { path:'/upload-deal', name:'Upload Deal', element:UploadDealForm},
  
//   { path:'/sales-report', name:'Sales Report', element:SalesReport},
//   { path:'/periodic-report', name:'Periodic Report', element:PeriodicReport},
//   { path:'/account-dashboard', name:'Account Dashboard', element:AccountDashboard},
//   { path:'/account/receipt', name:'Account Receipt', element:Receipts},
//   { path:'/debit-note', name:'Debit Note', element:DebitNote},
//   { path:'/refund', name:'Customer Refund', element:CustomerRefund},
//   { path:'/account/all-receipt', name:'All Receipt', element:AllReceipts},
//   { path:'/view-ledgers', name:'View Ledger', element:CustomerLedger},
//   { path:'/exchange-ledgers', name:'Exchange Ledger', element:ExchangeLedger},
//   { path:'/broker-payment', name:'Broker Payment', element:BrokerPayment},
//   { path:'/receipt-report', name:'Receipt Report', element:VoucherReport},

//   //RTO
//   { path:'/rto-dashboard', name:'RTO Dashboard', element:RTODashboard},
//   { path:'/rto/application', name:'RTO Application', element:Application},
//   { path:'/rto/rto-paper', name:'RTO Paper', element:RTOPaper},
//   { path:'/rto/rto-tax', name:'RTO Tax', element:RTOTax},
//   { path:'/rto/hsrp-ordering', name:'HSRP Ordering', element:HSRPOrdering},
//   { path:'/rto/hsrp-installation', name:'HSRP Installation', element:HSRPInstallation},
//   { path:'/rto/rc-confirmation', name:'RC Confirmation', element:RCConfirmation},
//   { path:'/rto/rto-report', name:'RTO Report', element:RTOReport},
 
//   //Fund Management
//   { path:'/cash-voucher', name:'Cash Voucher', element:CashVoucher},
//   { path:'/contra-voucher', name:'Contra Voucher', element:ContraVoucher},
//   { path:'/contra-approval', name:'Contra Approval', element:ContraApproval},
//   { path:'/workshop-receipt', name:'Workshop Receipt', element:WorkshopReceipt},
//   { path:'/cash-receipt', name:'Cash Receipt', element:CashReceipt},
//   { path:'/cash-book', name:'Cash Book', element:CashBook},
//   { path:'/day-book', name:'Day Book', element:DayBook},
//   { path:'/fund-report', name:'Fund Reportk', element:FundReport},
   
//   //Fund-Master
//   { path:'/add-cash', name:'Add Cash Location', element:AddCash},
//   { path:'/cash-master', name:'Workshop Receipt', element:CashList},
//   { path:'/add-bank', name:'Add Bank Location', element:AddBank},
//   { path:'/bank-master', name:'Cash Receipt', element:BankList},
//   { path:'/payment-mode', name:'Cash Book', element:AddPaymentMode},
//   { path:'/expense', name:'Expense List', element:AddExpense},
//   { path:'/opening-balance', name:'Add Opening Balance', element:OpeningBalanceList},
//   { path:'/add-balance', name:'Add Balance', element:AddOpeningBalance},
//   { path:'/payment-mode', name:'Payment Mode', element:PaymentModeList},
//   { path:'/accessories-billing', name:'Accessories Billing', element:AccessoriesBilling},
//   { path:'/all-customers', name:'All Customers', element:AllCustomersLedger},

//   //Quotation
//   { path:'/add-quotation', name:'Add Quotation', element:AddQuotation},
//   { path:'/quotation-list', name:'Quotation List', element:QuotationList},

//   { path: '/widgets', name: 'Widgets', element: Widgets },
// ]

// export default routes





import { AddCardSharp } from '@mui/icons-material'
import { element } from 'prop-types'
import React from 'react'



const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Purchase
const InwardStock = React.lazy(() => import('./views/purchase/InwardStock'))
const StockList = React.lazy(() => import('./views/purchase/StockList'))
const StockVerification = React.lazy(() => import('./views/purchase/StockVerification'))
const StockTransfer = React.lazy(() => import('./views/purchase/StockTransfer'))
const UploadChallan = React.lazy(() => import('./views/purchase/UploadChallan'))

//Masters
const AddBranch = React.lazy(() => import('./views/masters/branch/AddBranch'))
const BranchList = React.lazy(() => import('./views/masters/branch/BranchList'))
const AddHeader = React.lazy(() => import('./views/masters/headers/AddHeader'))
const HeadersList = React.lazy(() => import('./views/masters/headers/HeaderList'))
const AddModel = React.lazy(() => import('./views/masters/model/AddModel'))
const ModelList = React.lazy(() => import('./views/masters/model/ModelList'))
const UpdateModel = React.lazy(() => import('./views/masters/model/UpdateModel'))
const AddAccessories = React.lazy(() => import('./views/masters/accessories/AddAccessories'))
const AccessoriesList = React.lazy(() => import('./views/masters/accessories/AccessoriesList'))
const ColorList = React.lazy(() => import('./views/masters/color/ColorList'))
const AddColor = React.lazy(() => import('./views/masters/color/AddColor'))
const AddDocuments = React.lazy(() => import('./views/masters/documents/AddDocument'))
const DocumentsList = React.lazy(() => import('./views/masters/documents/DocumentsList'))
const AddCondition = React.lazy(() => import('./views/masters/terms&conditions/AddCondition'))
const ConditionList = React.lazy(() => import('./views/masters/terms&conditions/ConditionList'))

const AddOffers = React.lazy(() => import('./views/masters/offer/AddOffers'))
const OffersList = React.lazy(() => import('./views/masters/offer/OffersList'))
const AddAttachments = React.lazy(() => import('./views/masters/attachments/AddAttachments'))
const AttachmentsList = React.lazy(() => import('./views/masters/attachments/AttachmentsList'))
const AddDeclaration = React.lazy(() => import('./views/masters/declaration/AddDeclaration'))
const DeclarationList = React.lazy(() => import('./views/masters/declaration/DeclarationList'))

const AddRto = React.lazy(() => import('./views/masters/rto/AddRto'))
const RtoList = React.lazy(() => import('./views/masters/rto/RtoList'))

const AddFinancer = React.lazy(() => import('./views/masters/financer/AddFinancer'))
const FinancerList = React.lazy(() => import('./views/masters/financer/FinancerList'))
const AddFinanceRates = React.lazy(() => import('./views/masters/financeRates/AddRates'))
const FinanceRatesList = React.lazy(() => import('./views/masters/financeRates/RatesList'))
const AddInsuranceProviders = React.lazy(() => import('./views/masters/insuranceProviders/AddProvider'))
const InsuranceProvidersList = React.lazy(() => import('./views/masters/insuranceProviders/ProvidersList'))
const AddBroker = React.lazy(() => import('./views/masters/broker/AddBroker'))
const BrokerList = React.lazy(() => import('./views/masters/broker/BrokerList'))

const BrokerCommissionRange = React.lazy(() => import('./views/masters/commission-range/BrokerRange'))
const CommissionRangeList = React.lazy(() => import('./views/masters/commission-range/RangeList')) 

//Sales
const NewBooking = React.lazy(() => import('./views/sales/booking/NewBooking'))
const BookingList = React.lazy(() => import('./views/sales/booking/BookingList'))
const DeliveryChallan = React.lazy(() => import('./views/sales/delivery-challan/DeliveryChallan'))
const GSTInvoice = React.lazy(() => import('./views/sales/Invoice'))
const HelmetInvoice = React.lazy(() => import('./views/sales/HelmetInvoice'))
const DealForm = React.lazy(() => import('./views/sales/DealForm'))
const UploadDealForm = React.lazy(() => import('./views/sales/UploadDealForm'))

//Sales Report
const SalesReport = React.lazy(() => import('./views/sales-report/SalesReport'))
const PeriodicReport = React.lazy(() => import('./views/sales-report/PeriodicReport'))
//Account
const AccountDashboard = React.lazy(() => import('./views/account/AccountDashboard'))
const Receipts = React.lazy(() => import('./views/account/Receipt'))
const DebitNote = React.lazy(() => import('./views/account/debit-note/DebitNote'))
const CustomerRefund = React.lazy(() => import('./views/account/Refund'))
const AllReceipts = React.lazy(() => import('./views/account/AllReceipt'))
const CustomerLedger = React.lazy(() => import('./views/account/ViewLedger'))
const ExchangeLedger = React.lazy(() => import('./views/account/ExchangeLedger'))
const BrokerPayment = React.lazy(() => import('./views/account/broker-payment/PaymentVerification'))
const VoucherReport = React.lazy(() => import('./views/account/ReceiptReport'))

//RTO
const RTODashboard = React.lazy(() => import('./views/rto/RTODashboard'))
const Application = React.lazy(() => import('./views/rto/Application'))
const RTOPaper = React.lazy(() => import('./views/rto/RTOPaper'))
const RTOTax = React.lazy(() => import('./views/rto/RTOTax'))
const HSRPOrdering = React.lazy(() => import('./views/rto/HSRPOrdering'))
const HSRPInstallation = React.lazy(() => import('./views/rto/HSRPInstallation'))
const RCConfirmation = React.lazy(() => import('./views/rto/RCConfirmation'))
const RTOReport = React.lazy(() => import('./views/rto/RTOReport'))
const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

//Fund Management

const CashVoucher = React.lazy(() => import('./views/fund-management/CashVoucher'))
const ContraVoucher = React.lazy(() => import('./views/fund-management/ContraVoucher'))
const ContraApproval = React.lazy(() => import('./views/fund-management/ContraApproval'))
const WorkshopReceipt = React.lazy(() => import('./views/fund-management/WorkshopReceipt'))
const CashReceipt = React.lazy(() => import('./views/fund-management/CashReceipt'))
const CashBook = React.lazy(() => import('./views/fund-management/CashBook'))
const DayBook = React.lazy(() => import('./views/fund-management/DayBook'))
const FundReport = React.lazy(() => import('./views/fund-management/FundReport'))

//Fund Master

const AddCash = React.lazy(() => import('./views/fund-master/AddCash'))
const CashList = React.lazy(() => import('./views/fund-master/CashList'))
const AddBank = React.lazy(() => import('./views/fund-master/AddBank'))
const BankList = React.lazy(() => import('./views/fund-master/BankList'))
const AddExpense = React.lazy(() => import('./views/fund-master/AddExpense'))
const ExpenseList = React.lazy(() => import('./views/fund-master/ExpenseList'))
const AddOpeningBalance = React.lazy(() => import('./views/fund-master/AddOpeningBalance'))
const OpeningBalanceList = React.lazy(() => import('./views/fund-master/OpeningBalanceList'))

const AccessoriesBilling = React.lazy(() => import('./views/accessories-billing/AccessoriesBilling'))
const AllCustomersLedger = React.lazy(() => import('./views/all-customers/AllCustomers'))
const AddPaymentMode = React.lazy(() => import('./views/fund-master/payment-mode/PaymentMode'))
const PaymentModeList = React.lazy(() => import('./views/fund-master/payment-mode/PaymentModeList'))

//Quotation

const AddQuotation = React.lazy(() => import('./views/quotation/AddQuotation'))
const QuotationList = React.lazy(() => import('./views/quotation/QuotationList'))

//Subdealer

const SubdealerList = React.lazy(() => import('./views/subdealer/SubdealerList'))
const AddSubdealer = React.lazy(() => import('./views/subdealer/AddSubdealer'))
const AddAmount = React.lazy(() => import('./views/subdealer/accounts/AddAmount'))
const AddBalance = React.lazy(() => import('./views/subdealer/accounts/AddBalance'))
const SubdealerCustomerLedger = React.lazy(() => import('./views/subdealer/accounts/CustomerLedger'))
const OnAccountBalance = React.lazy(() => import('./views/subdealer/accounts/OnAccountBalance'))
const SubdealerReceipts = React.lazy(() => import('./views/subdealer/accounts/SubdealerReceipts'))
const SubdealerLedger = React.lazy(() => import('./views/subdealer/accounts/SubdealerLedger'))
const SubdealerSummary = React.lazy(() => import('./views/subdealer/accounts/Summary'))
const SubdealerPayment = React.lazy(() => import('./views/subdealer/accounts/SubdealerPayment'))
const SubdealerPaymentList = React.lazy(() => import('./views/subdealer/accounts/SubdealerPaymentList'))
const PaymentVerification = React.lazy(() => import('./views/subdealer/accounts/PaymentVerification'))
const CommissionList = React.lazy(() => import('./views/subdealer/commission/CommissionList'))
const AddCommission = React.lazy(() => import('./views/subdealer/commission/AddCommission'))
const CalculateCommission = React.lazy(() => import('./views/subdealer/commission/CalculateCommission'))
const SubdealerDeliveryChallan = React.lazy(() => import('./views/subdealer/booking/DeliveryChallan'))
const AllBooking = React.lazy(() => import('./views/subdealer/booking/AllBooking'))
const SubdealerNewBooking = React.lazy(() => import('./views/subdealer/booking/SubdealerNewBooking'))

//User Management
const AllRoles = React.lazy(()=>import('./views/roles/AllRoles'))
const CreateRole = React.lazy(()=>import('./views/roles/CreateRole'))
const AddUser = React.lazy(()=>import('./views/users/AddUser'))
const UsersList = React.lazy(()=>import('./views/users/UsersList'))
const BufferList = React.lazy(()=>import('./views/buffer/BufferList'))
const ManagerDeviation = React.lazy(()=>import('./views/users/ManagerDeviation'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  
  //purchase
  { path: '/inward-stock', name: 'Inward Stock', element: InwardStock},
  { path: '/inward-list', name: 'Stock List', element: StockList},
  { path: '/inward-stock', name: 'Inward Stock', element: InwardStock},
  { path: '/inward-list', name: 'Stock List', element: StockList},
  { path:'/stock-verification',name: 'Stock Verification', element: StockVerification},
  { path:'/stock-transfer',name: 'Stock Transfer', element: StockTransfer},
  { path:'/upload-challan',name: 'Upload Challan', element: UploadChallan},
  
   
  //Masters
  { path:'/branch/branch-list',name: 'Branch List', element: BranchList},
  { path:'/branch/add-branch',name: 'Add Branch', element: AddBranch},
  
  { path:'/headers/headers-list', name:'Headers List', element:HeadersList},
  { path:'/headers/add-header', name:'Add Headers', element:AddHeader},
  { path:'/model/model-list', name:"model List", element:ModelList},
  { path:'/model/add-model', name:"Add Model", element:AddModel},
  { path:'/model/update-model/:id', name:'Update Model', element:UpdateModel},

  { path:'/accessories/add-accessories', name:"Add Accessories", element:AddAccessories},
  { path:'/accessories/update-accessories/:id', name:"Add Accessories", element:AddAccessories},
  { path:'/accessories/accessories-list', name:"Accessories List", element:AccessoriesList},
  { path:'/color/color-list',name:"Color List", element:ColorList},
  { path:'/color/add-color',name:"Add Color", element:AddColor},
  { path:'/color/update-color/:id',name:"Update Color", element:AddColor},
  { path:'/documents/add-document', name:"Add Document", element:AddDocuments},
  { path:'/documents/update-document/:id', name:"Add Accessories", element:AddDocuments},
  { path:'/documents/documents-list', name:"documents List", element:DocumentsList},

  { path:'/conditions/conditions-list',name:"Color List", element:ConditionList},
  { path:'/conditions/add-condition',name:"Add Color", element:AddCondition},
  { path:'/conditions/update-condition/:id',name:"Update Color", element:AddCondition},

  { path:'/offers/offer-list', name:'Offers List', element:OffersList},
  { path:'/offers/add-offer', name:'Add Offers', element:AddOffers},
  { path:'/offers/update-offer/:id', name:'Update Offers', element:AddOffers},

  { path:'/attachments/attachments-list', name:'Attachments List', element:AttachmentsList},
  { path:'/attachments/add-attachments', name:'Add Attachments', element:AddAttachments},
  { path:'/attachments/update-attachments/:id', name:'Update Attachments', element:AddAttachments},
  
  { path:'/add-declaration', name:'Add Declaration', element:AddDeclaration},
  { path:'/update-declaration/:id', name:'Edit Declaration', element:AddDeclaration},
  { path:'/declaration-master', name:'Declaration List', element:DeclarationList},

  { path:'/rto/rto-list', name:'Rto List', element:RtoList},
  { path:'/rto/add-rto', name:'Add RTO', element:AddRto},
  { path:'/rto/update-rto/:id', name:'Edit RTO', element:AddRto},

  { path:'/financer/financer-list', name:'Financer List', element:FinancerList},
  { path:'/financer/add-financer', name:'Add Financer', element:AddFinancer},
  { path:'/financer/update-financer/:id', name:'Edit Financer', element:AddFinancer},

  { path:'/financer-rates/rates-list', name:'Financer Rates', element:FinanceRatesList},
  { path:'/financer-rates/add-rates', name:'Add Finance Rates', element:AddFinanceRates},
  { path:'/financer-rates/update-rates/:id', name:'Edit Finance Rates', element:AddFinanceRates},

  { path:'/insurance-provider/provider-list', name:'Insurance Providers List', element:InsuranceProvidersList},
  { path:'/insurance-provider/add-provider', name:'Add Insurance Provider', element:AddInsuranceProviders},
  { path:'/insurance-provider/update-provider/:id', name:'Edit Insurance Provider', element:AddInsuranceProviders},
 
  { path:'/broker/broker-list', name:'Brokers', element:BrokerList},
  { path:'/broker/add-broker', name:'Add Broker', element:AddBroker},
  { path:'/broker/update-broker/:id', name:'Edit Broker', element:AddBroker},

  { path:'/broker/commission-range', name:'Broker Commission', element:CommissionRangeList},
  { path:'/broker/add-range', name:'Add Commission Range', element:BrokerCommissionRange},

  //Sales
  { path:'/new-booking', name:'New Booking', element:NewBooking},
  { path:'/booking-list', name:'Booking List', element:BookingList},
  { path:'/update-booking/:id', name:'Edit Booking', element:NewBooking},

  { path:'/delivery-challan', name:'Delivery Challan', element:DeliveryChallan},
  { path:'/gst-invoice', name:'GST Invoice', element:GSTInvoice},
  { path:'/helmet-invoice', name:'Helmet Invoice', element:HelmetInvoice},
  { path:'/deal-form', name:'Deal Form', element:DealForm},
  { path:'/upload-deal', name:'Upload Deal', element:UploadDealForm},
  
  { path:'/sales-report', name:'Sales Report', element:SalesReport},
  { path:'/periodic-report', name:'Periodic Report', element:PeriodicReport},
  { path:'/account-dashboard', name:'Account Dashboard', element:AccountDashboard},
  { path:'/account/receipt', name:'Account Receipt', element:Receipts},
  { path:'/debit-note', name:'Debit Note', element:DebitNote},
  { path:'/refund', name:'Customer Refund', element:CustomerRefund},
  { path:'/account/all-receipt', name:'All Receipt', element:AllReceipts},
  { path:'/view-ledgers', name:'View Ledger', element:CustomerLedger},
  { path:'/exchange-ledgers', name:'Exchange Ledger', element:ExchangeLedger},
  { path:'/broker-payment', name:'Broker Payment', element:BrokerPayment},
  { path:'/receipt-report', name:'Receipt Report', element:VoucherReport},

  //RTO
  { path:'/rto-dashboard', name:'RTO Dashboard', element:RTODashboard},
  { path:'/rto/application', name:'RTO Application', element:Application},
  { path:'/rto/rto-paper', name:'RTO Paper', element:RTOPaper},
  { path:'/rto/rto-tax', name:'RTO Tax', element:RTOTax},
  { path:'/rto/hsrp-ordering', name:'HSRP Ordering', element:HSRPOrdering},
  { path:'/rto/hsrp-installation', name:'HSRP Installation', element:HSRPInstallation},
  { path:'/rto/rc-confirmation', name:'RC Confirmation', element:RCConfirmation},
  { path:'/rto/rto-report', name:'RTO Report', element:RTOReport},
 
  //Fund Management
  { path:'/cash-voucher', name:'Cash Voucher', element:CashVoucher},
  { path:'/contra-voucher', name:'Contra Voucher', element:ContraVoucher},
  { path:'/contra-approval', name:'Contra Approval', element:ContraApproval},
  { path:'/workshop-receipt', name:'Workshop Receipt', element:WorkshopReceipt},
  { path:'/cash-receipt', name:'Cash Receipt', element:CashReceipt},
  { path:'/cash-book', name:'Cash Book', element:CashBook},
  { path:'/day-book', name:'Day Book', element:DayBook},
  { path:'/fund-report', name:'Fund Reportk', element:FundReport},
   
  //Fund-Master
  { path:'/add-cash', name:'Add Cash Location', element:AddCash},
  { path:'/cash-master', name:'Workshop Receipt', element:CashList},
  { path:'/add-bank', name:'Add Bank Location', element:AddBank},
  { path:'/bank-master', name:'Cash Receipt', element:BankList},
  { path:'/payment-mode', name:'Cash Book', element:AddPaymentMode},
  { path:'/expense', name:'Expense List', element:AddExpense},
  { path:'/opening-balance', name:'Add Opening Balance', element:OpeningBalanceList},
  { path:'/add-balance', name:'Add Balance', element:AddOpeningBalance},
  { path:'/payment-mode', name:'Payment Mode', element:PaymentModeList},
  { path:'/accessories-billing', name:'Accessories Billing', element:AccessoriesBilling},
  { path:'/all-customers', name:'All Customers', element:AllCustomersLedger},

  //Quotation
  { path:'/add-quotation', name:'Add Quotation', element:AddQuotation},
  { path:'/quotation-list', name:'Quotation List', element:QuotationList},

  { path: '/widgets', name: 'Widgets', element: Widgets },


  // Subdealer
  { path:'/subdealer-list', name:'Subdealer List', element:SubdealerList},
  { path:'/add-subdealer', name:'Add Subdealer', element:AddSubdealer},
  { path:'/update-subdealer/:id', name:'Update Subdealer', element:AddSubdealer},
  { path:'/subdealer-booking', name:'Subdealer Booking', element:SubdealerNewBooking},
  { path:'/update-subdealer-booking/:id', name:'Update Subdealer Booking', element:SubdealerNewBooking},
  { path:'/subdealer-all-bookings', name:'Subdealer All Bookings', element:AllBooking},
  { path:'/subdealer-account/receipt', name:'Subdealer Receipt', element:SubdealerReceipts},
  { path:'/subdealer-account/add-balance', name:'Add Balance', element:AddBalance},
  { path:'/subdealer-account/onaccount-balance', name:'On Account Balance', element:OnAccountBalance},
  { path:'/subdealer-account/add-amount', name:'Add Amount', element:AddAmount},
  { path:'/subdealer-ledger', name:'Subdealer Ledger', element:SubdealerLedger},
  { path:'/subdealer-commission', name:'Subdealer Commission', element:CommissionList},
  { path:'/subdealer/add-commission', name:'Add Commission', element:AddCommission},
  { path:'/subdealer/customer-ledger', name:'Customer Ledger', element:SubdealerCustomerLedger},
  { path:'/subdealer/summary', name:'Subdealer Summary', element:SubdealerSummary},
  { path:'/subdealer/calculate-commission', name:'Calculate Commission', element:CalculateCommission},
  { path:'/subdealer/payment', name:'Subdealer Payment', element:SubdealerPayment},
  { path:'/subdealer/payment-summary', name:'Payment Summary', element:SubdealerPaymentList},
  { path:'/subdealer/payment-verification', name:'Payment Verification', element:PaymentVerification},
  { path:'/subdealer/delivery-challan', name:'Delivery Challan', element:SubdealerDeliveryChallan},

  //User Management
  { path:'/roles/all-role', name:'All Roles', element:AllRoles},
  { path:'/roles/update-role/:id', name:'Update Role', element:CreateRole},
  { path:'/roles/create-role', name:'Create Role', element:CreateRole},
  { path:'/users/add-user', name:'Add User', element:AddUser},
  { path:'/users/update-user/:id', name:'Update User', element:AddUser},
  { path:'/users/users-list', name:'Users List', element:UsersList},
  { path:'/buffer/buffer-list', name:'Buffer List', element:BufferList},
  { path:'/users/manager-deviation', name:'Manager Deviation', element:ManagerDeviation},
  

]

export default routes
