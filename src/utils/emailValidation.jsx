/**
 * Email validation utilities for role-based authentication
 * Validates email formats for student, teacher, and admin roles
 */

/**
 * Validates student email format: {name}{number}@ssn.edu.in
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid student email
 */
export const validateStudentEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Pattern: name followed by at least one digit, then @ssn.edu.in
  const studentPattern = /^[a-zA-Z]+\d+@ssn\.edu\.in$/;
  return studentPattern.test(email);
};

/**
 * Validates teacher email format: {name}@ssn.edu.in (no numbers)
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid teacher email
 */
export const validateTeacherEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Pattern: only letters (no numbers), then @ssn.edu.in
  const teacherPattern = /^[a-zA-Z]+@ssn\.edu\.in$/;
  return teacherPattern.test(email);
};

/**
 * Validates admin email: must be exactly jithu@ssn.edu.in
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid admin email
 */
export const validateAdminEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  return email === 'jithu@ssn.edu.in';
};

/**
 * Validates email based on role
 * @param {string} email - Email to validate
 * @param {string} role - User role ('student', 'teacher', or 'admin')
 * @returns {boolean} - True if email is valid for the given role
 */
export const validateEmail = (email, role) => {
  if (!email || !role) {
    return false;
  }
  
  switch (role.toLowerCase()) {
    case 'student':
      return validateStudentEmail(email);
    case 'teacher':
      return validateTeacherEmail(email);
    case 'admin':
      return validateAdminEmail(email);
    default:
      return false;
  }
};

/**
 * Gets user-friendly error message for invalid email
 * @param {string} role - User role
 * @returns {string} - Error message
 */
export const getEmailErrorMessage = (role) => {
  switch (role?.toLowerCase()) {
    case 'student':
      return 'Student email must match format: name123@ssn.edu.in';
    case 'teacher':
      return 'Teacher email must match format: name@ssn.edu.in';
    case 'admin':
      return 'Admin email must be: jithu@ssn.edu.in';
    default:
      return 'Invalid email format';
  }
};
