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

export default function CgpaCalc() {
  const [sem, setSem] = useState('');
  const [dept, setDept] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState({});
  const [cgpa, setCgpa] = useState(null);

  const handleFetch = async () => {
    const res = await axios.get('http://localhost:5000/api/subjects', {
      params: { sem, dept }
    });
    if (res.data) {
      setSubjects(res.data.subjects);
      setGrades({});
      setCgpa(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-700 text-white flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-3xl w-full">
        <h1 className="text-4xl font-extrabold text-center mb-8 tracking-wide text-white drop-shadow-lg">
          🎓 CGPA Calculator
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <select onChange={e => setSem(e.target.value)} className="bg-white/20 backdrop-blur-md text-white border border-white/30 p-3 rounded-lg focus:outline-none">
            <option value="">Select Semester</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>

          <select onChange={e => setDept(e.target.value)} className="bg-white/20 backdrop-blur-md text-white border border-white/30 p-3 rounded-lg focus:outline-none">
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
          </select>

          <button
            onClick={handleFetch}
            className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold py-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Load Subjects
          </button>
        </div>

        {subjects.length > 0 && (
          <div className="space-y-4 mb-6">
            {subjects.map(([subject, credits]) => (
              <div key={subject} className="flex justify-between items-center border-b border-white/20 pb-2">
                <div className="text-lg font-medium">
                  {subject.toUpperCase()} <span className="text-white/60">({credits} credits)</span>
                </div>
                <select
                  onChange={e => handleGradeChange(subject, e.target.value)}
                  className="bg-white/20 backdrop-blur-md text-white border border-white/30 p-2 rounded-lg focus:outline-none"
                >
                  <option value="">Select Grade</option>
                  {Object.keys(gradePoints).map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {subjects.length > 0 && (
          <div className="text-center">
            <button
              onClick={calculateCGPA}
              className="bg-gradient-to-r from-green-400 to-lime-500 hover:from-green-500 hover:to-lime-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-transform transform hover:scale-105"
            >
              🚀 Calculate CGPA
            </button>
          </div>
        )}

        {cgpa && (
          <div className="mt-8 text-center text-3xl font-bold text-white bg-white/20 px-6 py-4 rounded-xl shadow-inner">
            Your CGPA is: <span className="text-yellow-300">{cgpa}</span>
          </div>
        )}
      </div>
    </div>
  );
}
