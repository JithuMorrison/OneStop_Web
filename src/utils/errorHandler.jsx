/**
 * Centralized error handling utility
 * Provides consistent error handling across the application
 */

/**
 * Error types for categorization
 */
export const ErrorTypes = {
  AUTH: 'auth',
  VALIDATION: 'validation',
  AUTHORIZATION: 'authorization',
  DATABASE: 'database',
  NETWORK: 'network',
  FILE_UPLOAD: 'file_upload',
  GENERIC: 'generic',
};

/**
 * Determine error type from error object
 * @param {Error} error - Error object
 * @returns {string} - Error type
 */
const getErrorType = (error) => {
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('auth') || message.includes('login') || message.includes('session')) {
    return ErrorTypes.AUTH;
  }
  if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
    return ErrorTypes.VALIDATION;
  }
  if (message.includes('permission') || message.includes('access denied') || message.includes('unauthorized')) {
    return ErrorTypes.AUTHORIZATION;
  }
  if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
    return ErrorTypes.NETWORK;
  }
  if (message.includes('upload') || message.includes('file') || message.includes('storage')) {
    return ErrorTypes.FILE_UPLOAD;
  }
  if (message.includes('database') || message.includes('query')) {
    return ErrorTypes.DATABASE;
  }
  
  return ErrorTypes.GENERIC;
};

/**
 * Get user-friendly error message based on error type
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyMessage = (error, context = '') => {
  const errorType = getErrorType(error);
  const originalMessage = error.message || 'An error occurred';
  
  // Return original message if it's already user-friendly
  if (!originalMessage.includes('Error:') && originalMessage.length < 100) {
    return originalMessage;
  }
  
  // Map error types to user-friendly messages
  const errorMessages = {
    [ErrorTypes.AUTH]: 'Authentication failed. Please check your credentials and try again.',
    [ErrorTypes.VALIDATION]: 'Please check your input and try again.',
    [ErrorTypes.AUTHORIZATION]: "You don't have permission to perform this action.",
    [ErrorTypes.DATABASE]: 'Something went wrong. Please try again.',
    [ErrorTypes.NETWORK]: 'Unable to connect to server. Please check your internet connection.',
    [ErrorTypes.FILE_UPLOAD]: 'File upload failed. Please try again.',
    [ErrorTypes.GENERIC]: 'Something went wrong. Please try again.',
  };
  
  const baseMessage = errorMessages[errorType] || errorMessages[ErrorTypes.GENERIC];
  
  // Add context if provided
  return context ? `${context}: ${baseMessage}` : baseMessage;
};

/**
 * Handle error and return formatted error object
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {Object} - Formatted error object
 */
export const handleError = (error, context = '') => {
  // Log error for debugging
  console.error(`Error in ${context}:`, error);
  
  const errorType = getErrorType(error);
  const userMessage = getUserFriendlyMessage(error, context);
  
  return {
    type: errorType,
    message: userMessage,
    originalError: error,
    context,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Wrap async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context for error handling
 * @returns {Function} - Wrapped function
 */
export const withErrorHandling = (fn, context) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const handledError = handleError(error, context);
      throw handledError;
    }
  };
};

/**
 * Check if error is a network error
 * @param {Error} error - Error object
 * @returns {boolean} - True if network error
 */
export const isNetworkError = (error) => {
  return getErrorType(error) === ErrorTypes.NETWORK;
};

/**
 * Check if error is an authentication error
 * @param {Error} error - Error object
 * @returns {boolean} - True if auth error
 */
export const isAuthError = (error) => {
  return getErrorType(error) === ErrorTypes.AUTH;
};

/**
 * Retry logic for failed operations
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} - Result of function
 */
export const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation or authorization errors
      const errorType = getErrorType(error);
      if (errorType === ErrorTypes.VALIDATION || errorType === ErrorTypes.AUTHORIZATION) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

export default {
  ErrorTypes,
  handleError,
  getUserFriendlyMessage,
  withErrorHandling,
  isNetworkError,
  isAuthError,
  retryWithBackoff,
};
