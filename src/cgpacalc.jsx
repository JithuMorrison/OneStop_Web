import React, { useState } from 'react';
import axios from 'axios';

const gradePoints = {
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

const departments = [
  { value: 'CSE', label: 'Computer Science' },
  { value: 'ECE', label: 'Electronics & Communication' },
  { value: 'EEE', label: 'Electrical & Electronics' },
  { value: 'MECH', label: 'Mechanical' },
  { value: 'CIVIL', label: 'Civil' },
];

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

export default function CgpaCalc() {
  const [sem, setSem] = useState('');
  const [dept, setDept] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState({});
  const [cgpa, setCgpa] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/subjects', {
        params: { sem, dept }
      });
      if (res.data) {
        setSubjects(res.data.subjects);
        setGrades({});
        setCgpa(null);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      // You might want to add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeChange = (subject, grade) => {
    setGrades(prev => ({ ...prev, [subject]: grade }));
  };

  const calculateCGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;

    subjects.forEach(([sub, credits]) => {
      const grade = grades[sub];
      if (grade && gradePoints[grade] !== undefined) {
        totalPoints += gradePoints[grade] * parseInt(credits);
        totalCredits += parseInt(credits);
      }
    });

    if (totalCredits > 0) {
      const cgpaValue = totalPoints / totalCredits;
      setCgpa(cgpaValue.toFixed(2));
    }
  };

  // Calculate completion percentage
  const completedSubjects = subjects.filter(([sub]) => grades[sub]).length;
  const completionPercentage = subjects.length > 0 
    ? Math.round((completedSubjects / subjects.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-4xl w-full border border-white/10">
        {/* Header with animated gradient text */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
              CGPA Calculator
            </span>
          </h1>
          <p className="text-white/70 text-lg">Calculate your semester GPA with ease</p>
        </div>

        {/* Selection Section */}
        <div className="bg-white/5 p-6 rounded-xl mb-8 border border-white/10">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Academic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Semester</label>
              <select 
                onChange={e => setSem(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm text-white border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="" className='text-black'>Select your semester</option>
                {semesters.map(sem => (
                  <option key={sem.value} value={sem.value} className='text-black'>{sem.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Department</label>
              <select 
                onChange={e => setDept(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm text-white border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="" className='text-black'>Select your department</option>
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value} className='text-black'>{dept.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleFetch}
              disabled={!sem || !dept || isLoading}
              className={`relative overflow-hidden px-8 py-3 rounded-full font-medium text-white shadow-lg transition-all duration-300 ${!sem || !dept ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 hover:shadow-xl'}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Load Subjects
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Subjects Section */}
        {subjects.length > 0 && (
          <div className="bg-white/5 p-6 rounded-xl mb-8 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Subjects & Grades
              </h2>
              
              <div className="flex items-center">
                <span className="text-sm text-white/70 mr-2">Progress: {completedSubjects}/{subjects.length}</span>
                <div className="w-24 bg-white/10 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-cyan-400 h-2.5 rounded-full" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {subjects.map(([subject, credits]) => (
                <div key={subject} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="mb-2 sm:mb-0">
                    <div className="font-medium text-lg">{subject.toUpperCase()}</div>
                    <div className="text-sm text-white/60">{credits} credit{credits > 1 ? 's' : ''}</div>
                  </div>
                  <select
                    onChange={e => handleGradeChange(subject, e.target.value)}
                    value={grades[subject] || ''}
                    className="bg-white/10 backdrop-blur-sm text-white border border-white/20 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[180px]"
                  >
                    <option value="" className='text-black'>Select Grade</option>
                    {Object.keys(gradePoints).map(grade => (
                      <option key={grade} value={grade} className='text-black'>{grade} ({gradePoints[grade]} points)</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={calculateCGPA}
                disabled={completedSubjects !== subjects.length}
                className={`relative overflow-hidden px-8 py-3 rounded-full font-medium text-white shadow-lg transition-all duration-300 ${completedSubjects !== subjects.length ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 hover:shadow-xl'}`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Calculate CGPA
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {cgpa && (
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 rounded-xl border border-white/10 animate-fade-in">
            <div className="text-center">
              <div className="text-2xl font-medium mb-2">Your Semester GPA</div>
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-4">
                {cgpa}
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-white/70">Subjects</div>
                    <div className="text-xl font-semibold">{subjects.length}</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-white/70">Completed</div>
                    <div className="text-xl font-semibold">{completedSubjects}</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg">
                    <div className="text-sm text-white/70">Total Credits</div>
                    <div className="text-xl font-semibold">
                      {subjects.reduce((sum, [_, credits]) => sum + parseInt(credits), 0)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10">
                <button 
                  onClick={() => {
                    setSubjects([]);
                    setGrades({});
                    setCgpa(null);
                  }}
                  className="text-sm text-white/70 hover:text-white transition-colors flex items-center mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Calculate Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-white/50">
          <p>Made with ❤️ for students | CGPA Calculator v2.0</p>
        </div>
      </div>
    </div>
  );
}