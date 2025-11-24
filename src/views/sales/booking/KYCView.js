import React, { useEffect, useState } from 'react';
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CBadge,
  CButton,
  CFormInput,
  CFormLabel,
  CSpinner
} from '@coreui/react';
import PropTypes from 'prop-types';
import config from '../../../config';
import { showError, showSuccess } from '../../../utils/sweetAlerts';
import axiosInstance from '../../../axiosInstance';
import '../../../css/kycView.css';
import { Link } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilCloudUpload, cilCheckCircle, cilXCircle, cilZoom } from '@coreui/icons';

const KYCView = ({ open, onClose, kycData, refreshData, bookingId }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [activeDocument, setActiveDocument] = useState(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  const handleStatusButtonClick = (action) => {
    setCurrentAction(action);
    setShowStatusModal(true);
  };

  useEffect(() => {
    if (bookingId) {
      console.log('KYCView received valid bookingId:', bookingId);
    } else {
      console.warn('KYCView received null bookingId!');
    }
  }, [bookingId]);

  const handleKycStatusUpdate = async () => {
    try {
      setActionLoading(true);
      console.log('Fetching KYC for booking ID:', bookingId);
      if (!bookingId) {
        showError('Booking ID is missing');
        return;
      }
      if (!verificationNote.trim()) {
        alert('Verification note is required');
        return;
      }

      await axiosInstance.post(`/kyc/${bookingId}/verify`, {
        status: currentAction,
        verificationNote: verificationNote
      });

      showSuccess(`KYC ${currentAction.toLowerCase()} successfully!`);
      refreshData();
      setShowStatusModal(false);
      setVerificationNote('');
      onClose();
    } catch (error) {
      console.log(error);
      showError(error.response?.data?.message || `Failed to update KYC status`);
    } finally {
      setActionLoading(false);
    }
  };

  const openDocumentViewer = (document, title) => {
    if (!document?.original) return;

    setActiveDocument({
      url: `${config.baseURL}${document.original}`,
      title: title,
      type: document.mimetype === 'application/pdf' ? 'pdf' : 'image'
    });
    setDocumentViewerOpen(true);
  };

  const renderDocument = (document, altText) => {
    if (!document?.original) {
      return (
        <div className="document-placeholder">
          <CIcon icon={cilXCircle} size="xl" />
          <p>No document uploaded</p>
        </div>
      );
    }

    const isPdf = document.mimetype === 'application/pdf';
    const documentUrl = `${config.baseURL}${document.original}`;
    const thumbnailUrl = document.thumbnail ? `${config.baseURL}${document.thumbnail}` : documentUrl;

    return (
      <div className="document-preview-container">
        <div className="document-thumbnail" onClick={() => openDocumentViewer(document, altText)}>
          {isPdf ? (
            <div className="pdf-thumbnail">
              <div className="pdf-icon">
                <span>PDF</span>
              </div>
              <p>{document.originalname || 'Document'}</p>
            </div>
          ) : (
            <img src={thumbnailUrl} alt={altText} className="thumbnail-image" />
          )}
          <div className="document-overlay">
            <CIcon icon={cilZoom} />
            <span>View</span>
          </div>
        </div>

        <div className="document-actions">
          <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
            Open Full {isPdf ? 'PDF' : 'Image'}
          </a>
        </div>
      </div>
    );
  };

  if (!kycData || !kycData.kycDocuments) {
    return (
      <CModal visible={open} onClose={onClose} size="xl" className="kyc-modal">
        <CModalHeader closeButton>
          <CModalTitle>Loading KYC Details...</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="text-center py-4">
            <CSpinner color="primary" />
            <p className="mt-2">Loading KYC information...</p>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    );
  }

  const { kycDocuments, status, customerName, address } = kycData;
  const statusColors = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    NOT_UPLOADED: 'secondary'
  };

  return (
    <>
      <CModal visible={open} onClose={onClose} size="xl" className="kyc-modal" backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>
            KYC Documents
            <CBadge color={statusColors[status]} className="ms-2 status-badge">
              {status.replace('_', ' ')}
            </CBadge>
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="kyc-modal-body">
          <div className="kyc-info-bar">
            <div className="kyc-info-item">
              <strong>Booking ID:</strong> {bookingId}
            </div>
            {customerName && (
              <div className="kyc-info-item">
                <strong>Customer:</strong> {customerName}
              </div>
            )}
            {address && (
              <div className="kyc-info-item">
                <strong>Address:</strong> {address}
              </div>
            )}
          </div>

          <div className="kyc-documents-container">
            <CRow>
              <CCol lg={6} className="mb-4">
                <CCard className="document-card">
                  <CCardHeader className="document-card-header">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    Aadhar Front
                  </CCardHeader>
                  <CCardBody>{renderDocument(kycDocuments.aadharFront, 'Aadhar Front')}</CCardBody>
                </CCard>
              </CCol>
              <CCol lg={6} className="mb-4">
                <CCard className="document-card">
                  <CCardHeader className="document-card-header">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    Aadhar Back
                  </CCardHeader>
                  <CCardBody>{renderDocument(kycDocuments.aadharBack, 'Aadhar Back')}</CCardBody>
                </CCard>
              </CCol>
            </CRow>

            <CRow>
              <CCol lg={6} className="mb-4">
                <CCard className="document-card">
                  <CCardHeader className="document-card-header">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    PAN Card
                  </CCardHeader>
                  <CCardBody>{renderDocument(kycDocuments.panCard, 'PAN Card')}</CCardBody>
                </CCard>
              </CCol>
              <CCol lg={6} className="mb-4">
                <CCard className="document-card">
                  <CCardHeader className="document-card-header">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    Vehicle Photo
                  </CCardHeader>
                  <CCardBody>{renderDocument(kycDocuments.vPhoto, 'Vehicle Photo')}</CCardBody>
                </CCard>
              </CCol>
            </CRow>

            <CRow>
              <CCol lg={6} className="mb-4">
                <CCard className="document-card">
                  <CCardHeader className="document-card-header">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    Chassis Number Photo
                  </CCardHeader>
                  <CCardBody>{renderDocument(kycDocuments.chasisNoPhoto, 'Chassis Number')}</CCardBody>
                </CCard>
              </CCol>
              <CCol lg={6} className="mb-4">
                <CCard className="document-card">
                  <CCardHeader className="document-card-header">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    Address Proof 1
                  </CCardHeader>
                  <CCardBody>{renderDocument(kycDocuments.addressProof1, 'Address Proof 1')}</CCardBody>
                </CCard>
              </CCol>
            </CRow>

            <CRow>
              <CCol lg={6} className="mb-4">
                <CCard className="document-card">
                  <CCardHeader className="document-card-header">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    Address Proof 2
                  </CCardHeader>
                  <CCardBody>{renderDocument(kycDocuments.addressProof2, 'Address Proof 2')}</CCardBody>
                </CCard>
              </CCol>
              <CCol lg={6} className="mb-4">
                <CCard className="document-card">
                  <CCardHeader className="document-card-header">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    KYC Document PDF
                  </CCardHeader>
                  <CCardBody>
                    {kycDocuments.documentPdf ? (
                      renderDocument(
                        {
                          original: kycDocuments.documentPdf,
                          mimetype: 'application/pdf',
                          originalname: 'KYC Document'
                        },
                        'Combined KYC Document'
                      )
                    ) : (
                      <div className="document-placeholder">
                        <CIcon icon={cilXCircle} size="xl" />
                        <p>No PDF available</p>
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </div>
        </CModalBody>
        <CModalFooter>
          <div className="d-flex justify-content-between w-100 flex-wrap">
            <div className="action-buttons">
              {status === 'PENDING' && (
                <>
                  <CButton
                    color="success"
                    onClick={() => handleStatusButtonClick('APPROVED')}
                    disabled={actionLoading}
                    className="me-2 mb-2"
                  >
                    {actionLoading ? <CSpinner size="sm" /> : 'Approve KYC'}
                  </CButton>
                  <CButton color="danger" onClick={() => handleStatusButtonClick('REJECTED')} disabled={actionLoading} className="mb-2">
                    {actionLoading ? <CSpinner size="sm" /> : 'Reject KYC'}
                  </CButton>
                </>
              )}
              {(status === 'REJECTED' || status === 'NOT_UPLOADED') && (
                <>
                  <Link
                    to={`/upload-kyc/${bookingId}`}
                    state={{
                      bookingId: bookingId,
                      customerName: customerName,
                      address: address
                    }}
                  >
                    <CButton color="primary" className="upload-kyc-btn mb-2">
                      <CIcon icon={cilCloudUpload} className="me-2" />
                      Upload KYC Documents
                    </CButton>
                  </Link>
                </>
              )}
            </div>
            <CButton color="secondary" onClick={onClose}>
              Close
            </CButton>
          </div>
        </CModalFooter>
      </CModal>

      {/* KYC Status Update Modal */}
      <CModal visible={showStatusModal} onClose={() => !actionLoading && setShowStatusModal(false)} alignment="center">
        <CModalHeader closeButton={!actionLoading}>
          <CModalTitle>{`${currentAction === 'APPROVED' ? 'Approve' : 'Reject'} KYC`}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel htmlFor="verificationNote">
              Verification Note <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              id="verificationNote"
              type="text"
              placeholder={`Enter ${currentAction === 'APPROVED' ? 'approval' : 'rejection'} note`}
              value={verificationNote}
              onChange={(e) => setVerificationNote(e.target.value)}
              required
              disabled={actionLoading}
            />
            <div className="form-text">This note will be recorded with the verification action.</div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowStatusModal(false)} disabled={actionLoading}>
            Cancel
          </CButton>
          <CButton
            color={currentAction === 'APPROVED' ? 'success' : 'danger'}
            onClick={handleKycStatusUpdate}
            disabled={actionLoading || !verificationNote.trim()}
          >
            {actionLoading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Processing...
              </>
            ) : currentAction === 'APPROVED' ? (
              'Approve'
            ) : (
              'Reject'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Document Viewer Modal */}
      <CModal
        visible={documentViewerOpen}
        onClose={() => setDocumentViewerOpen(false)}
        size="xl"
        className="document-viewer-modal"
        fullscreen
      >
        <CModalHeader closeButton>
          <CModalTitle>{activeDocument?.title}</CModalTitle>
        </CModalHeader>
        <CModalBody className="document-viewer-body">
          {activeDocument?.type === 'pdf' ? (
            <iframe src={activeDocument.url} title={activeDocument.title} className="document-iframe" frameBorder="0" />
          ) : (
            <img src={activeDocument?.url} alt={activeDocument?.title} className="document-full-image" />
          )}
        </CModalBody>
        <CModalFooter>
          <a href={activeDocument?.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary me-2">
            Open in New Tab
          </a>
          <CButton color="secondary" onClick={() => setDocumentViewerOpen(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

KYCView.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  bookingId: PropTypes.string.isRequired,
  kycData: PropTypes.shape({
    kycDocuments: PropTypes.shape({
      aadharFront: PropTypes.shape({
        original: PropTypes.string,
        thumbnail: PropTypes.string,
        mimetype: PropTypes.string,
        originalname: PropTypes.string
      }),
      aadharBack: PropTypes.shape({
        original: PropTypes.string,
        thumbnail: PropTypes.string,
        mimetype: PropTypes.string,
        originalname: PropTypes.string
      }),
      panCard: PropTypes.shape({
        original: PropTypes.string,
        thumbnail: PropTypes.string,
        mimetype: PropTypes.string,
        originalname: PropTypes.string
      }),
      vPhoto: PropTypes.shape({
        original: PropTypes.string,
        thumbnail: PropTypes.string,
        mimetype: PropTypes.string,
        originalname: PropTypes.string
      }),
      chasisNoPhoto: PropTypes.shape({
        original: PropTypes.string,
        thumbnail: PropTypes.string,
        mimetype: PropTypes.string,
        originalname: PropTypes.string
      }),
      addressProof1: PropTypes.shape({
        original: PropTypes.string,
        thumbnail: PropTypes.string,
        mimetype: PropTypes.string,
        originalname: PropTypes.string
      }),
      addressProof2: PropTypes.shape({
        original: PropTypes.string,
        thumbnail: PropTypes.string,
        mimetype: PropTypes.string,
        originalname: PropTypes.string
      }),
      documentPdf: PropTypes.string
    }),
    status: PropTypes.oneOf(['PENDING', 'APPROVED', 'REJECTED', 'NOT_UPLOADED']),
    customerName: PropTypes.string,
    address: PropTypes.string,
    id: PropTypes.string
  })
};

export default KYCView;
