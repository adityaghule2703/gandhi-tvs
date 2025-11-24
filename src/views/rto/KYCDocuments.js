import React, { useState } from 'react';
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
  CButton,
  CSpinner,
  CBadge
} from '@coreui/react';
import PropTypes from 'prop-types';
import config from '../../config';
import { showError, showSuccess } from '../../utils/sweetAlerts';
import axiosInstance from '../../axiosInstance';
import '../../css/kycView.css';
import '../../css/bookingView.css';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload, cilCloudUpload } from '@coreui/icons';
import { Link } from 'react-router-dom';

const KYCDocuments = ({ open, onClose, kycData, refreshData, rtoId }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const documents = kycData?.kycDocuments || kycData;
  const customerInfo = kycData?.bookingDetails || kycData;

  const confirmRtoSubmission = async () => {
    if (!rtoId) {
      showError('No RTO process ID found');
      return;
    }

    try {
      setActionLoading(true);
      await axiosInstance.patch(`/rtoProcess/${rtoId}`, {
        rtoPaperStatus: 'Submitted'
      });

      showSuccess('RTO papers submitted successfully!');
      refreshData();
      onClose();
    } catch (error) {
      console.log(error);
      showError(error.response?.data?.message || 'Failed to submit RTO papers');
    } finally {
      setActionLoading(false);
    }
  };

  const getDocumentUrl = (document) => {
    if (!document) return null;
    if (typeof document === 'string') return `${config.baseURL}${document}`;
    if (document.original) return `${config.baseURL}${document.original}`;
    return null;
  };

  const getDownloadUrl = (document) => {
    if (!document) return null;
    if (typeof document === 'string') return `${config.baseURL}${document}`;
    if (document.pdf) return `${config.baseURL}${document.pdf}`;
    if (document.original) return `${config.baseURL}${document.original}`;
    return null;
  };

  const DocumentCard = ({ title, document }) => {
    const docUrl = getDocumentUrl(document);
    const downloadUrl = getDownloadUrl(document);

    return (
      <CCard className="document-card">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <span>{title}</span>
          {downloadUrl && (
            <a href={downloadUrl} download className="btn btn-sm btn-primary">
              <CIcon icon={cilCloudDownload} /> Download
            </a>
          )}
        </CCardHeader>
        <CCardBody>
          {docUrl ? (
            <img src={docUrl} alt={title} className="document-image" />
          ) : (
            <div className="text-muted text-center py-4">No document uploaded</div>
          )}
        </CCardBody>
      </CCard>
    );
  };

  if (!kycData) {
    return (
      <CModal visible={open} onClose={onClose} size="xl">
        <CModalHeader>
          <CModalTitle>Loading KYC Details...</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="text-center py-4">
            <CSpinner color="primary" />
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

  return (
    <>
      {open && <div className="modal-overlay" onClick={onClose} />}
      <CModal visible={open} onClose={onClose} size="xl" fullscreen="lg">
        <CModalHeader>
          <CModalTitle>Booking Number - {customerInfo?.bookingNumber || 'N/A'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="kyc-documents-container">
            <CRow className="mb-4 d-flex">
              <CCol>
                <div className="customer-info-card">
                  <p>
                    <strong>Name:</strong> {customerInfo?.customerName || 'N/A'}
                  </p>
                  <p>
                    <strong>Chassis Number:</strong> {customerInfo?.chassisNumber || 'N/A'}
                  </p>
                  <p>
                    <strong>Model:</strong> {customerInfo?.model?.model_name || 'N/A'}
                  </p>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6} className="mb-4">
                <DocumentCard title="Aadhar Front" document={documents.aadharFront} />
              </CCol>
              <CCol md={6} className="mb-4">
                <DocumentCard title="Aadhar Back" document={documents.aadharBack} />
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6} className="mb-4">
                <DocumentCard title="PAN Card" document={documents.panCard} />
              </CCol>
              <CCol md={6} className="mb-4">
                <DocumentCard title="Vehicle Photo" document={documents.vPhoto} />
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6} className="mb-4">
                <DocumentCard title="Chassis Number Photo" document={documents.chasisNoPhoto} />
              </CCol>
              <CCol md={6} className="mb-4">
                <DocumentCard title="Address Proof 1" document={documents.addressProof1} />
              </CCol>
            </CRow>

            {(documents.addressProof2 || documents.documentPdf) && (
              <CRow>
                {documents.addressProof2 && (
                  <CCol md={6} className="mb-4">
                    <DocumentCard title="Address Proof 2" document={documents.addressProof2} />
                  </CCol>
                )}
                {documents.documentPdf && (
                  <CCol md={6} className="mb-4">
                    <CCard className="document-card">
                      <CCardHeader>Combined KYC PDF</CCardHeader>
                      <CCardBody>
                        <a
                          href={`${config.baseURL}${documents.documentPdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                        >
                          <CIcon icon={cilCloudDownload} className="me-2" />
                          View PDF
                        </a>
                      </CCardBody>
                    </CCard>
                  </CCol>
                )}
              </CRow>
            )}
          </div>
        </CModalBody>
        <CModalFooter>
          <div className="d-flex justify-content-between w-100 align-items-center">
            <div>
              {kycData.status === 'PENDING' && (
                <CButton color="primary" onClick={confirmRtoSubmission} disabled={actionLoading}>
                  {actionLoading ? <CSpinner size="sm" /> : 'Verify KYC'}
                </CButton>
              )}
              {(kycData.status === 'REJECTED' || kycData.status === 'NOT_UPLOADED') && (
                <>
                  <CBadge color="danger" className="me-2">
                    KYC {kycData.status}
                  </CBadge>
                  <Link
                    to={`/upload-kyc/${rtoId || kycData._id}`}
                    state={{
                      bookingId: rtoId || kycData._id,
                      customerName: customerInfo?.customerName,
                      chassisNumber: customerInfo?.chassisNumber
                    }}
                  >
                    <CButton color="primary">
                      <CIcon icon={cilCloudUpload} className="me-2" />
                      Upload KYC
                    </CButton>
                  </Link>
                </>
              )}
              {kycData.status === 'APPROVED' && <CBadge color="success">KYC APPROVED</CBadge>}
            </div>
            <CButton color="secondary" onClick={onClose}>
              Close
            </CButton>
          </div>
        </CModalFooter>
      </CModal>
    </>
  );
};

KYCDocuments.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  refreshData: PropTypes.func.isRequired,
  rtoId: PropTypes.string,
  kycData: PropTypes.shape({
    _id: PropTypes.string,
    kycDocuments: PropTypes.shape({
      aadharFront: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          original: PropTypes.string,
          pdf: PropTypes.string,
          mimetype: PropTypes.string,
          originalname: PropTypes.string
        })
      ]),
      aadharBack: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          original: PropTypes.string,
          pdf: PropTypes.string,
          mimetype: PropTypes.string,
          originalname: PropTypes.string
        })
      ]),
      panCard: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          original: PropTypes.string,
          pdf: PropTypes.string,
          mimetype: PropTypes.string,
          originalname: PropTypes.string
        })
      ]),
      vPhoto: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          original: PropTypes.string,
          pdf: PropTypes.string,
          mimetype: PropTypes.string,
          originalname: PropTypes.string
        })
      ]),
      chasisNoPhoto: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          original: PropTypes.string,
          pdf: PropTypes.string,
          mimetype: PropTypes.string,
          originalname: PropTypes.string
        })
      ]),
      addressProof1: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          original: PropTypes.string,
          pdf: PropTypes.string,
          mimetype: PropTypes.string,
          originalname: PropTypes.string
        })
      ]),
      addressProof2: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          original: PropTypes.string,
          pdf: PropTypes.string,
          mimetype: PropTypes.string,
          originalname: PropTypes.string
        })
      ]),
      documentPdf: PropTypes.string
    }),
    bookingDetails: PropTypes.shape({
      bookingId: PropTypes.string,
      bookingNumber: PropTypes.string,
      customerName: PropTypes.string,
      chassisNumber: PropTypes.string,
      model: PropTypes.shape({
        model_name: PropTypes.string
      })
    }),
    status: PropTypes.oneOf(['PENDING', 'APPROVED', 'REJECTED', 'NOT_UPLOADED']),
    customerName: PropTypes.string,
    bookingNumber: PropTypes.string,
    chassisNumber: PropTypes.string
  })
};

KYCDocuments.defaultProps = {
  rtoId: null
};

export default KYCDocuments;
