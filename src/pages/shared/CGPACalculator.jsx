import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBook, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { MdCalculate } from 'react-icons/md';
import { fetchSubjects, calculateCGPA, gradePoints, getCompletionPercentage, getTotalCredits } from '../../utils/cgpaCalculator.jsx';

const semesters = [
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
];

export default function CGPACalculator() {
  const [user, setUser] = useState(null);
  const [semester, setSemester] = useState('');
  const [courses, setCourses] = useState([]);
  const [cgpa, setCgpa] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleFetch = async () => {
    if (!user || !semester) {
      alert('Please select a semester');
      return;
    }

    setIsLoading(true);
    try {
      const batchYear = user.join_year || parseInt(user.year);
      const department = user.dept || user.department;
      
      const fetchedCourses = await fetchSubjects(batchYear, department, parseInt(semester));
      
      if (fetchedCourses.length === 0) {
        alert('No subjects found for this semester. Please contact your teacher.');
      }
      
      setCourses(fetchedCourses);
      setCgpa(null);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      alert(error.message || 'Failed to fetch subjects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeChange = (courseId, grade) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === courseId ? { ...course, grade } : course
      )
    );
  };

  const handleCalculateCGPA = () => {
    const calculatedCGPA = calculateCGPA(courses);
    setCgpa(calculatedCGPA);
  };

  // Calculate completion percentage
  const completionPercentage = getCompletionPercentage(courses);
  const totalCredits = getTotalCredits(courses);
  const completedCourses = courses.filter(c => c.grade).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <MdCalculate className="mr-3 text-indigo-600" />
              CGPA Calculator
            </h1>
            <p className="text-gray-600 mt-2">Calculate your semester GPA with ease</p>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <FiArrowLeft size={18} />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Academic Information Card */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FiBook className="mr-2 text-indigo-600" />
          Academic Information
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Details
            </label>
            <p className="text-gray-900">
              <span className="font-medium">Batch:</span> {user?.join_year || user?.year} | 
              <span className="font-medium ml-2">Department:</span> {user?.dept || user?.department}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
            <select 
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="">Select your semester</option>
              {semesters.map(sem => (
                <option key={sem.value} value={sem.value}>{sem.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleFetch}
            disabled={!semester || isLoading}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              !semester || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <FiTrendingUp className="mr-2" size={18} />
                Load Subjects
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subjects & Grades Section */}
      {courses.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4 sm:mb-0">
              <FiBook className="mr-2 text-indigo-600" />
              Subjects & Grades
            </h2>
            
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600 mr-3">Progress: {completedCourses}/{courses.length}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                <div className="mb-3 lg:mb-0 flex-1">
                  <div className="font-medium text-gray-900 text-lg">{course.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="bg-gray-200 px-2 py-1 rounded text-xs mr-2">{course.code}</span>
                    {course.credits} credit{course.credits > 1 ? 's' : ''}
                  </div>
                </div>
                <select
                  onChange={e => handleGradeChange(course.id, e.target.value)}
                  value={course.grade || ''}
                  className="w-full lg:w-48 bg-white border border-gray-300 text-gray-900 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Grade</option>
                  {Object.keys(gradePoints).map(grade => (
                    <option key={grade} value={grade}>{grade} ({gradePoints[grade]} points)</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleCalculateCGPA}
              disabled={completedCourses !== courses.length}
              className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                completedCourses !== courses.length
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <MdCalculate className="mr-2" size={18} />
              Calculate CGPA
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {cgpa && (
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FiCheckCircle className="text-green-500 mr-2" size={32} />
              <h2 className="text-2xl font-semibold text-gray-900">Your Semester GPA</h2>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8 mb-6">
              <div className="text-6xl font-bold mb-2">{cgpa}</div>
              <div className="text-lg opacity-90">Grade Point Average</div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Subjects</div>
                <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Completed</div>
                <div className="text-2xl font-bold text-gray-900">{completedCourses}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Credits</div>
                <div className="text-2xl font-bold text-gray-900">{totalCredits}</div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <button 
                onClick={() => {
                  setCourses([]);
                  setCgpa(null);
                  setSemester('');
                }}
                className="flex items-center justify-center mx-auto px-4 py-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <FiTrendingUp className="mr-2" size={16} />
                Calculate Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}