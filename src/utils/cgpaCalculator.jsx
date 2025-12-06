import axios from 'axios';

/**
 * CGPA Calculator Utility
 * Provides functions for calculating CGPA using the standard formula
 * Fetches subjects from MongoDB based on batch year, department, and semester
 */

// Grade points mapping
export const gradePoints = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C+': 5,
  'C': 4,
  'D+': 3,
  'D': 2,
  'W': 1
};

/**
 * Fetch subjects from MongoDB for a specific batch, department, and semester
 * @param {number} batchYear - Batch year (e.g., 2022, 2023)
 * @param {string} department - Department code (e.g., 'CSE', 'ECE')
 * @param {number} semester - Semester number (1-8)
 * @returns {Promise<Array>} - Array of subject objects with name, code, and credits
 */
export const fetchSubjects = async (batchYear, department, semester) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get('http://localhost:5000/api/semester-subjects', {
      params: {
        batch_year: batchYear,
        department: department,
        semester: semester
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Transform to include grade field for user input
    return response.data.map(subject => ({
      id: subject._id,
      name: subject.subject_name,
      code: subject.subject_code,
      credits: subject.credits,
      grade: '' // To be filled by user
    }));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw new Error('Failed to fetch subjects. Please try again.');
  }
};

/**
 * Calculate CGPA using the standard formula: sum(grade_points × credits) / sum(credits)
 * @param {Array} courses - Array of course objects with grade and credits
 * @returns {number} - Calculated CGPA rounded to 2 decimal places
 */
export const calculateCGPA = (courses) => {
  if (!courses || courses.length === 0) {
    return 0;
  }

  let totalCredits = 0;
  let totalPoints = 0;

  courses.forEach(course => {
    const { grade, credits } = course;
    if (grade && gradePoints[grade] !== undefined && credits) {
      const creditValue = parseFloat(credits);
      totalPoints += gradePoints[grade] * creditValue;
      totalCredits += creditValue;
    }
  });

  if (totalCredits === 0) {
    return 0;
  }

  return parseFloat((totalPoints / totalCredits).toFixed(2));
};

/**
 * Validate if a course has all required fields
 * @param {Object} course - Course object
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidCourse = (course) => {
  return course && 
         course.name && 
         course.name.trim() !== '' &&
         course.credits && 
         parseFloat(course.credits) > 0;
};

/**
 * Check if a course has a grade assigned
 * @param {Object} course - Course object
 * @returns {boolean} - True if grade is assigned, false otherwise
 */
export const hasGrade = (course) => {
  return course && course.grade && gradePoints[course.grade] !== undefined;
};

/**
 * Get completion percentage of courses with grades
 * @param {Array} courses - Array of course objects
 * @returns {number} - Percentage of courses with grades (0-100)
 */
export const getCompletionPercentage = (courses) => {
  if (!courses || courses.length === 0) {
    return 0;
  }

  const completedCourses = courses.filter(hasGrade).length;
  return Math.round((completedCourses / courses.length) * 100);
};

/**
 * Get total credits from courses
 * @param {Array} courses - Array of course objects
 * @returns {number} - Total credits
 */
export const getTotalCredits = (courses) => {
  if (!courses || courses.length === 0) {
    return 0;
  }

  return courses.reduce((sum, course) => {
    const credits = parseFloat(course.credits) || 0;
    return sum + credits;
  }, 0);
};

/**
 * Create a new empty course object
 * @returns {Object} - Empty course object
 */
export const createEmptyCourse = () => ({
  id: Date.now() + Math.random(), // Ensure unique ID
  name: '',
  credits: '',
  grade: ''
});
