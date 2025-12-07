import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

/**
 * Toast notification component for displaying messages
 * Supports success, error, warning, and info types
 */
const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300); // Match animation duration
  };

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: <FiCheckCircle className="w-5 h-5 text-green-500" />,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: <FiAlertCircle className="w-5 h-5 text-red-500" />,
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: <FiAlertTriangle className="w-5 h-5 text-yellow-500" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: <FiInfo className="w-5 h-5 text-blue-500" />,
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md w-full
        ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
      `}
    >
      <div
        className={`
          ${style.bg} ${style.text}
          border rounded-lg shadow-lg p-4
          flex items-start gap-3
        `}
      >
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className={`
            flex-shrink-0 ${style.text} hover:opacity-70
            transition-opacity focus:outline-none focus:ring-2
            focus:ring-offset-2 rounded
          `}
          aria-label="Close notification"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
};

export default Toast;
