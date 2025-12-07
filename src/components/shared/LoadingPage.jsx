import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Full-page loading component
 * Displays a centered loading spinner with optional message
 */
const LoadingPage = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

LoadingPage.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};

export default LoadingPage;
