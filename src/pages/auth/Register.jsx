import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/UserContext.jsx';
import { getEmailErrorMessage } from '../../utils/emailValidation.jsx';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    rollNumber: '',
    digitalId: '',
    department: '',
    joinYear: new Date().getFullYear(),
    section: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.digitalId || !formData.department || !formData.joinYear) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.digitalId.length !== 7) {
      setError('Digital ID must be exactly 7 digits');
      return false;
    }

    if (formData.role === 'student' && !formData.rollNumber) {
      setError('Roll number is required for students');
      return false;
    }

    if (formData.role === 'student' && formData.rollNumber.length !== 13) {
      setError('Roll number must be exactly 13 digits');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        rollNumber: formData.role === 'student' ? formData.rollNumber : undefined,
        digitalId: formData.digitalId,
        department: formData.department,
        joinYear: parseInt(formData.joinYear),
        section: formData.section || undefined,
      };

      const user = await register(userData);

      // Navigate based on role - use replace to avoid back button issues
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-500 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              id="role"
              name="role"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {getEmailErrorMessage(formData.role)}
            </p>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
              placeholder={
                formData.role === 'student'
                  ? 'john123@ssn.edu.in'
                  : formData.role === 'teacher'
                  ? 'john@ssn.edu.in'
                  : 'jithu@ssn.edu.in'
              }
              disabled={loading}
            />
          </div>

          {/* Roll Number (Students only) */}
          {formData.role === 'student' && (
            <div className="mb-4">
              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number * (13 digits)
              </label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="1234567890123"
                maxLength="13"
                disabled={loading}
              />
            </div>
          )}

          {/* Digital ID */}
          <div className="mb-4">
            <label htmlFor="digitalId" className="block text-sm font-medium text-gray-700 mb-2">
              Digital ID * (7 digits)
            </label>
            <input
              type="text"
              id="digitalId"
              name="digitalId"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.digitalId}
              onChange={handleChange}
              placeholder="1234567"
              maxLength="7"
              disabled={loading}
            />
          </div>

          {/* Department */}
          <div className="mb-4">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              id="department"
              name="department"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.department}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select Department</option>
              <option value="CSE">Computer Science and Engineering</option>
              <option value="ECE">Electronics and Communication Engineering</option>
              <option value="EEE">Electrical and Electronics Engineering</option>
              <option value="MECH">Mechanical Engineering</option>
              <option value="CIVIL">Civil Engineering</option>
              <option value="IT">Information Technology</option>
              <option value="BME">Biomedical Engineering</option>
              <option value="CHEM">Chemical Engineering</option>
            </select>
          </div>

          {/* Join Year */}
          <div className="mb-4">
            <label htmlFor="joinYear" className="block text-sm font-medium text-gray-700 mb-2">
              Join Year *
            </label>
            <select
              id="joinYear"
              name="joinYear"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.joinYear}
              onChange={handleChange}
              disabled={loading}
            >
              {[...Array(6)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Section */}
          <div className="mb-4">
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
              Section (Optional)
            </label>
            <input
              type="text"
              id="section"
              name="section"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.section}
              onChange={handleChange}
              placeholder="A"
              maxLength="2"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password * (min 6 characters)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Already have an account? Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
