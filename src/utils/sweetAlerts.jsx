import Swal from 'sweetalert2';

export const confirmDelete = () => {
  return Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#243c7c',
    cancelButtonColor: '#dc4226',
    confirmButtonText: 'Yes, delete it!'
  });
};

export const confirmVerify = (options = {}) => {
  return Swal.fire({
    title: options.title || 'Verify HSRP Ordering',
    text: options.text || 'Are you sure you want to verify this HSRP Ordering?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#243c7c',
    cancelButtonColor: '#dc4226',
    confirmButtonText: options.confirmButtonText || 'Yes, verify it!',
    ...options
  });
};

export const showSuccess = (message = 'Deleted successfully') => {
  return Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    confirmButtonColor: '#006cb5'
  });
};

export const showToast = (message, type = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  return Toast.fire({
    icon: type,
    title: message
  });
};

export const showFormSubmitSuccess = (message = 'Data Saved Successfully!', navigateTo = null) => {
  return Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    confirmButtonColor: '#006cb5'
  }).then((result) => {
    if (result.isConfirmed && navigateTo) {
      navigateTo();
    }
  });
};

export const showFormSubmitToast = (message = 'Data Saved Successfully!', navigateTo = null) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  return Toast.fire({
    icon: 'success',
    title: message
  }).then(() => {
    if (navigateTo) {
      navigateTo();
    }
  });
};

export const showAppError = (error, defaultMessage = 'Something went wrong') => {
  let message = defaultMessage;

  if (error?.response?.data?.error) {
    message = error.response.data.error;
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error?.message) {
    message = error.message;
  }

  const statusCode = error?.response?.status;

  if (statusCode === 401) {
    return Swal.fire({
      title: 'Unauthorized',
      text: 'Your session has expired or you are not logged in. Please log in again.',
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'Login'
    }).then(() => {
      window.location.href = '/tvs/auth/signin-1';
    });
  }

  if (statusCode === 403) {
    return Swal.fire({
      title: 'Access Denied',
      text: 'You do not have permission to perform this action.',
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'OK'
    });
  }
  return Swal.fire({
    title: 'Error!',
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#d33'
  });
};
export const showError = (error, defaultMessage) => showAppError(error, defaultMessage);
export const showFormSubmitError = (error) => showAppError(error, 'Something went wrong. Please try again later.');
