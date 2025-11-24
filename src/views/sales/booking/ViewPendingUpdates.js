import { Modal, Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import { axiosInstance } from '../../../utils/tableImports';

const PendingUpdateDetailsModal = ({ open, onClose, updateData, onApprove, onReject, onUpdateField }) => {
  const [editedUpdates, setEditedUpdates] = useState({});
  const [colors, setColors] = useState([]);
  const [loadingColors, setLoadingColors] = useState(false);

  useEffect(() => {
    if (updateData) {
      const modelId = updateData.model?._id || updateData.model?.id;
      if (modelId) {
        fetchModelColors(modelId);
      }

      setEditedUpdates({
        ...updateData.pendingUpdates,
        color: updateData.pendingUpdates?.color?._id || updateData.pendingUpdates?.color || '',
        note: updateData.updateRequestNote || ''
      });
    }
  }, [updateData]);

  const fetchModelColors = async (modelId) => {
    try {
      setLoadingColors(true);
      const response = await axiosInstance.get(`colors/model/${modelId}`);
      setColors(response.data.data.colors || []);
    } catch (error) {
      console.error('Failed to fetch model colors:', error);
      setColors([]);
    } finally {
      setLoadingColors(false);
    }
  };

  const handleFieldChange = (path, value) => {
    const paths = path.split('.');
    setEditedUpdates((prev) => {
      const newState = { ...prev };
      let current = newState;

      for (let i = 0; i < paths.length - 1; i++) {
        if (!current[paths[i]]) current[paths[i]] = {};
        current = current[paths[i]];
      }

      current[paths[paths.length - 1]] = value;
      return newState;
    });
  };

  const handleSubmit = (action) => {
    const payload = {
      note: editedUpdates.note,
      updates: {
        ...editedUpdates
      }
    };
    delete payload.updates.note;

    if (action === 'approve') {
      onApprove(payload);
    } else {
      onReject(payload);
    }
  };

  if (!updateData) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '800px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Pending Update Details - {updateData.bookingNumber}
        </Typography>

        <div style={{ marginBottom: '20px' }}>
          <Typography variant="subtitle1" gutterBottom>
            Current Information
          </Typography>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <TextField label="Customer Name" value={updateData.customerName} variant="outlined" fullWidth disabled />
            <TextField label="Current Color" value={updateData.color?.name || ''} variant="outlined" fullWidth disabled />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Typography variant="subtitle1" gutterBottom>
            Requested Updates
          </Typography>

          <TextField
            label="Update Note"
            value={editedUpdates.note || ''}
            onChange={(e) => handleFieldChange('note', e.target.value)}
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Customer Details
          </Typography>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <TextField
              label="Salutation"
              value={editedUpdates.customerDetails?.salutation || ''}
              onChange={(e) => handleFieldChange('customerDetails.salutation', e.target.value)}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Name"
              value={editedUpdates.customerDetails?.name || ''}
              onChange={(e) => handleFieldChange('customerDetails.name', e.target.value)}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Mobile 1"
              value={editedUpdates.customerDetails?.mobile1 || ''}
              onChange={(e) => handleFieldChange('customerDetails.mobile1', e.target.value)}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Mobile 2"
              value={editedUpdates.customerDetails?.mobile2 || ''}
              onChange={(e) => handleFieldChange('customerDetails.mobile2', e.target.value)}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Address"
              value={editedUpdates.customerDetails?.address || ''}
              onChange={(e) => handleFieldChange('customerDetails.address', e.target.value)}
              variant="outlined"
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Pincode"
              value={editedUpdates.customerDetails?.pincode || ''}
              onChange={(e) => handleFieldChange('customerDetails.pincode', e.target.value)}
              variant="outlined"
              fullWidth
            />
            <TextField label="Requested Color" value={editedUpdates.color || ''} variant="outlined" fullWidth />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <FormControl fullWidth>
              <InputLabel>Available Color</InputLabel>
              <Select
                value={editedUpdates.color?._id || ''}
                onChange={(e) => handleFieldChange('color', e.target.value)}
                label="Requested Color"
                disabled={loadingColors}
              >
                {loadingColors ? (
                  <MenuItem value="" disabled>
                    Loading colors...
                  </MenuItem>
                ) : colors.length > 0 ? (
                  colors.map((color) => (
                    <MenuItem key={color._id} value={color.name}>
                      {color.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No colors available
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px'
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button
              variant="contained"
              onClick={() => handleSubmit('reject')}
              style={{
                backgroundColor: '#ff5370',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#e53935'
                }
              }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSubmit('approve')}
              style={{
                backgroundColor: '#2ed8b6',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#26c6da'
                }
              }}
            >
              Approve
            </Button>
          </div>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default PendingUpdateDetailsModal;
