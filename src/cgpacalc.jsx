import React, { useState, useEffect } from 'react';
import axios from 'axios';

const gradePoints = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C+': 5,
  'C' : 4,
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
        totalPoints += gradePoints[grade] * credits;
        totalCredits += parseInt(credits);
      }
    });
  
    if (totalCredits > 0) {
      const cgpaValue = totalPoints / totalCredits;
      setCgpa(cgpaValue.toFixed(2));
    }
  };  

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">CGPA Calculator</h1>

      <div className="flex gap-4 mb-4">
        <select onChange={e => setSem(e.target.value)} className="border p-2">
          <option value="">Select Semester</option>
          <option value="5">5</option>
          <option value="6">6</option>
          {/* Add more */}
        </select>

        <select onChange={e => setDept(e.target.value)} className="border p-2">
          <option value="">Select Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          {/* Add more */}
        </select>

        <button onClick={handleFetch} className="bg-blue-500 text-white px-4 py-2 rounded">
          Load Subjects
        </button>
      </div>

      {subjects.length > 0 && (
        <div className="mb-4">
          {subjects.map(([subject, credits]) => (
            <div key={subject} className="flex justify-between items-center mb-2">
              <div>
                {subject.toUpperCase()} ({credits} credits)
              </div>
              <select
                onChange={e => handleGradeChange(subject, e.target.value)}
                className="border p-2"
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

      <button
        onClick={calculateCGPA}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Calculate CGPA
      </button>

      {cgpa && (
        <div className="mt-4 text-xl">
          Your CGPA is: <strong>{cgpa}</strong>
        </div>
      )}
    </div>
  );
}
