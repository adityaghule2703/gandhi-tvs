import React from 'react';
import PropTypes from 'prop-types';
import '../css/form.css';

const FormButtons = ({ onSave, onCancel, isSubmitting = false }) => {
  return (
    <div className="form-footer">
      <button
        type="submit"
        className="submit-button"
        disabled={isSubmitting}
        onClick={onSave}
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
      <button
        type="button"
        className="cancel-button"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
};

FormButtons.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default FormButtons;
