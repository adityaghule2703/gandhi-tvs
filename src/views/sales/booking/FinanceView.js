import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, CircularProgress, IconButton, Divider, Chip, TextField } from '@mui/material';
import axiosInstance from '../../../axiosInstance';
import config from '../../../config';
import CloseIcon from '@mui/icons-material/Close';
import { showError, showSuccess } from '../../../utils/sweetAlerts';

const FinanceView = ({ open, onClose, financeData, bookingId, refreshData }) => {
  const [financeDetails, setFinanceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileLoading, setFileLoading] = useState(true);
  const [fileType, setFileType] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const customSuccessColor = 'rgb(46, 216, 182)';
  const customErrorColor = '#ff5370';

  useEffect(() => {
    if (open && bookingId) {
      fetchFinanceDetails();
    } else {
  
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      setVerificationNote('');
      setShowStatusModal(false);
      setCurrentAction(null);
      setFileType(null);
    }
  }, [open, bookingId]);

  const fetchFinanceDetails = async () => {
    try {
      setLoading(true);
      setFileLoading(true);

      const response = await axiosInstance.get(`/finance-letters/${bookingId}`);
      setFinanceDetails(response.data.data);

      if (response.data.data?.financeLetter) {
        const filePath = response.data.data.financeLetter;
        const fileExtension = filePath.split('.').pop().toLowerCase();

        if (fileExtension === 'pdf') {
          setFileType('pdf');
          try {
            const pdfResponse = await axiosInstance.get(`/finance-letters/${bookingId}/download`, {
              responseType: 'blob'
            });
            const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setFileUrl(url);
          } catch (pdfError) {
            console.error('Error fetching PDF:', pdfError);
            setFileUrl(`${config.baseURL}${filePath}`);
          }
        } else {
          setFileType('image');
          setFileUrl(`${config.baseURL}${filePath}`);
        }
      }
    } catch (error) {
      console.error('Error fetching finance details:', error);
      showError('Failed to fetch finance details');
    } finally {
      setLoading(false);
      setFileLoading(false);
    }
  };

  const handleDownload = () => {
    if (!fileUrl) return;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `finance-letter-${bookingId}.${fileType === 'pdf' ? 'pdf' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusActionClick = (action) => {
    setCurrentAction(action);
    setShowStatusModal(true);
  };

  const handleFinanceStatusUpdate = async () => {
    try {
      setActionLoading(true);

      if (!verificationNote.trim()) {
        showError('Verification note is required');
        return;
      }

      await axiosInstance.post(`/finance-letters/${bookingId}/verify`, {
        status: currentAction,
        verificationNote: verificationNote.trim()
      });

      showSuccess(`Finance ${currentAction.toLowerCase()} successfully!`);
      refreshData();
      setShowStatusModal(false);
      onClose();
    } catch (error) {
      console.log(error);
      showError(error.response?.data?.message || `Failed to update Finance status`);
    } finally {
      setActionLoading(false);
    }
  };

  const renderFilePreview = () => {
    if (fileType === 'pdf') {
      return (
        <iframe
          src={`${fileUrl}#toolbar=0`}
          title="Finance Letter"
          width="100%"
          height="500px"
          style={{ border: 'none' }}
          onLoad={() => setFileLoading(false)}
        />
      );
    } else if (fileType === 'image') {
      return (
        <img
          src={fileUrl}
          alt="Finance Letter"
          style={{
            maxWidth: '100%',
            maxHeight: '500px',
            display: 'block',
            margin: '0 auto'
          }}
          onLoad={() => setFileLoading(false)}
        />
      );
    }
    return null;
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '900px',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2">
              Finance Letter Details
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box mb={3}>
                <Typography variant="subtitle1">
                  <strong>Booking ID:</strong> {financeDetails?.bookingId || bookingId}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Customer Name:</strong> {financeDetails?.customerName || financeData?.customerName}
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={financeDetails?.status || financeData?.status}
                    color={financeDetails?.status === 'APPROVED' ? 'success' : financeDetails?.status === 'REJECTED' ? 'error' : 'warning'}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {fileUrl ? (
                <Box>
                  <Box
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      p: 2,
                      mb: 2,
                      minHeight: '500px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {fileLoading ? <CircularProgress /> : renderFilePreview()}
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      {(financeDetails?.status === 'PENDING' || financeData?.status === 'PENDING') && (
                        <>
                          <Button
                            variant="contained"
                            style={{ backgroundColor: '#2ed8b6' }}
                            onClick={() => handleStatusActionClick('APPROVED')}
                            sx={{ mr: 2 }}
                          >
                            Approve Finance
                          </Button>
                          <Button
                            variant="contained"
                            style={{ backgroundColor: '#ff5370' }}
                            onClick={() => handleStatusActionClick('REJECTED')}
                          >
                            Reject Finance
                          </Button>
                        </>
                      )}
                    </Box>
                    <Box>
                      <Button variant="contained" onClick={handleDownload} sx={{ mr: 2 }}>
                        Download {fileType === 'pdf' ? 'PDF' : 'Image'}
                      </Button>
                      <Button variant="outlined" onClick={onClose}>
                        Close
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
                  No finance letter document available
                </Typography>
              )}
            </>
          )}
        </Box>
      </Modal>
      <Modal open={showStatusModal} onClose={() => !actionLoading && setShowStatusModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 3
          }}
        >
          <Typography variant="h6" component="h2" mb={2}>
            {`${currentAction === 'APPROVED' ? 'Approve' : 'Reject'} Finance`}
          </Typography>

          <TextField
            fullWidth
            label="Verification Note"
            variant="outlined"
            value={verificationNote}
            onChange={(e) => setVerificationNote(e.target.value)}
            placeholder={`Enter ${currentAction === 'APPROVED' ? 'approval' : 'rejection'} note`}
            required
            sx={{ mb: 3 }}
          />

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => setShowStatusModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: currentAction === 'APPROVED' ? customSuccessColor : customErrorColor,
                '&:hover': {
                  backgroundColor: currentAction === 'APPROVED' ? 'rgb(36, 196, 162)' : undefined
                }
              }}
              onClick={handleFinanceStatusUpdate}
              disabled={actionLoading || !verificationNote.trim()}
            >
              {actionLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Processing...
                </>
              ) : currentAction === 'APPROVED' ? (
                'Approve'
              ) : (
                'Reject'
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default FinanceView;
