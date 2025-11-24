import '../../../css/table.css'
import {
  React,
  useState,
  useEffect,
  SearchOutlinedIcon,
  getDefaultSearchFields,
  useTableFilter,
  usePagination,
  axiosInstance,
} from '../../../utils/tableImports'
import AddDebitNote from './AddDebitNote'
import { 
  CButton, 
  CCard, 
  CCardBody, 
  CCardHeader, 
  CFormInput, 
  CFormLabel, 
  CTable, 
  CTableBody, 
  CTableHead, 
  CTableHeaderCell, 
  CTableRow,
  CTableDataCell,
  CSpinner,
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus } from '@coreui/icons';

const DebitNote = () => {
  const { data, setData, filteredData, setFilteredData, handleFilter } = useTableFilter([])
  const { currentRecords, PaginationOptions } = usePagination(filteredData || [])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/bookings`)
      const branchBookings = response.data.data.bookings.filter(
        (booking) => booking.bookingType === 'BRANCH',
      )
      setData(branchBookings)
      setFilteredData(branchBookings)
    } catch (error) {
      console.log('Error fetching data', error)
      setError('Failed to fetch bookings data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = (booking) => {
    console.log('Selected booking:', booking)
    setSelectedBooking(booking)
    setShowModal(true)
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    handleFilter(value, getDefaultSearchFields('booking'))
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <div>
      <div className='title'>Debit Note</div>
    
      <CCard className='table-container mt-4'>
        <CCardHeader className='card-header d-flex justify-content-between align-items-center'>
          <div></div>
          <div className='d-flex'>
            <CFormLabel className='mt-1 m-1'>Search:</CFormLabel>
            <CFormInput
              type="text"
              className="d-inline-block square-search"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </CCardHeader>
        
        <CCardBody>
          {error && (
            <CAlert color="danger" className="mb-3">
              {error}
            </CAlert>
          )}
          
          <div className="responsive-table-wrapper">
            <CTable striped bordered hover className='responsive-table'>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Sr.no</CTableHeaderCell>
                  <CTableHeaderCell>Booking ID</CTableHeaderCell>
                  <CTableHeaderCell>Model Name</CTableHeaderCell>
                  <CTableHeaderCell>Booking Date</CTableHeaderCell>
                  <CTableHeaderCell>Customer Name</CTableHeaderCell>
                  <CTableHeaderCell>Chassis Number</CTableHeaderCell>
                  <CTableHeaderCell>Total</CTableHeaderCell>
                  <CTableHeaderCell>Received</CTableHeaderCell>
                  <CTableHeaderCell>Balance</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentRecords.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="10" className="text-center">
                      No ledger details available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentRecords.map((booking, index) => (
                    <CTableRow key={booking._id || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{booking.bookingNumber}</CTableDataCell>
                      <CTableDataCell>{booking.model?.model_name || ''}</CTableDataCell>
                      <CTableDataCell>
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleDateString('en-GB')
                          : ''}
                      </CTableDataCell>
                      <CTableDataCell>{booking.customerDetails?.name || ''}</CTableDataCell>
                      <CTableDataCell>{booking.chassisNumber || ''}</CTableDataCell>
                      <CTableDataCell>₹{booking.discountedAmount?.toLocaleString('en-IN') || '0'}</CTableDataCell>
                      <CTableDataCell>₹{booking.receivedAmount?.toLocaleString('en-IN') || '0'}</CTableDataCell>
                      <CTableDataCell>₹{booking.balanceAmount?.toLocaleString('en-IN') || '0'}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="primary"
                          className="action-btn"
                          onClick={() => handleAddClick(booking)}
                        >
                          {/* <CIcon icon={cilPlus} className="me-1" /> */}
                          Add
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>
      <AddDebitNote
        show={showModal}
        onClose={() => setShowModal(false)}
        bookingData={selectedBooking}
      />
    </div>
  )
}

export default DebitNote