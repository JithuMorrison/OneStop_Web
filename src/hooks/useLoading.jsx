import { useState, useCallback } from 'react';

/**
 * Custom hook for managing loading states
 * Provides loading state and helper functions
 */
const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  /**
   * Start loading
   */
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  /**
   * Stop loading
   */
  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  /**
   * Set error and stop loading
   * @param {Error|string} err - Error object or message
   */
  const setLoadingError = useCallback((err) => {
    setError(err);
    setIsLoading(false);
  }, []);

  /**
   * Reset loading state and error
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  /**
   * Wrap an async function with loading state management
   * @param {Function} asyncFn - Async function to wrap
   * @returns {Function} - Wrapped function
   */
  const withLoading = useCallback((asyncFn) => {
    return async (...args) => {
      try {
        startLoading();
        const result = await asyncFn(...args);
        stopLoading();
        return result;
      } catch (err) {
        setLoadingError(err);
        throw err;
      }
    };
  }, [startLoading, stopLoading, setLoadingError]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setLoadingError,
    reset,
    withLoading,
  };
};

export default useLoading;
