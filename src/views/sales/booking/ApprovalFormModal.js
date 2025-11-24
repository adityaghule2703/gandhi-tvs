import React, { useState } from 'react';
import { CModal, CModalHeader, CModalBody, CModalFooter, CFormInput, CFormLabel } from '@coreui/react';

const ApprovalFormModal = ({ show, onClose, onApprove, actionType = '', isLoading }) => {
  const [approvalNote, setApprovalNote] = useState('');

  const getActionText = () => {
    if (!actionType) return '';
    return actionType.charAt(0).toUpperCase() + actionType.slice(1);
  };

  const handleSubmit = () => {
    onApprove(approvalNote);
  };

  return (
    <CModal visible={show} onClose={onClose} alignment="center">
      <CModalHeader>
        <h5 className="modal-title">{actionType === 'approve' ? 'Approve Booking' : `${getActionText()} Booking`}</h5>
      </CModalHeader>
      <CModalBody>
        <div className="mb-3">
          <CFormLabel htmlFor="approvalNote">Approval Note (Optional)</CFormLabel>
          <CFormInput
            id="approvalNote"
            type="text"
            placeholder={`Enter ${actionType || ''} note (optional)`}
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
          />
        </div>
      </CModalBody>
      <CModalFooter>
        <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
        <button
          className={`btn ${actionType === 'approve' ? 'btn-success' : actionType === 'reject' ? 'btn-danger' : 'btn-primary'}`}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Processing...
            </>
          ) : actionType === 'approve' ? (
            'Approve'
          ) : (
            getActionText()
          )}
        </button>
      </CModalFooter>
    </CModal>
  );
};

export default ApprovalFormModal;
