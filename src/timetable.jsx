import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX, FiCalendar } from 'react-icons/fi';

const Timetable = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('view');
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    batch_year: '',
    department: '',
    semester: ''
  });
  
  // Subjects management
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({
    subject_name: '',
    subject_code: '',
    credits: ''
  });
  
  // Exam timetable management
  const [examTimetables, setExamTimetables] = useState([]);
  const [exams, setExams] = useState([]);
  const [newExam, setNewExam] = useState({
    subject_id: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    room: ''
  });

  // Generate batch years (last 5 years)
  const currentYear = new Date().getFullYear();
  const batchYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Auto-fill filters for students based on join year
      if (userData.role === 'student' && userData.join_year) {
        setFilters({
          batch_year: userData.join_year,
          department: userData.dept || userData.department || '',
          semester: ''
        });
      }
    }
  }, []);

  useEffect(() => {
    if (filters.batch_year && filters.department && filters.semester) {
      if (activeTab === 'subjects' || activeTab === 'create') {
        fetchSubjects();
      }
      if (activeTab === 'view') {
        fetchExamTimetables();
      }
    }
  }, [filters, activeTab]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(`http://localhost:5000/api/semester-subjects?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch subjects');
      
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamTimetables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters).toString();
      
      const response = await fetch(`http://localhost:5000/api/exam-timetables?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch exam timetables');
      
      const data = await response.json();
      setExamTimetables(data);
    } catch (error) {
      console.error('Error fetching exam timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    
    if (!newSubject.subject_name || !newSubject.subject_code || !newSubject.credits) {
      alert('Please fill all fields');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/semester-subjects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batch_year: parseInt(filters.batch_year),
          department: filters.department,
          semester: parseInt(filters.semester),
          ...newSubject,
          credits: parseFloat(newSubject.credits)
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      alert('Subject created successfully!');
      setNewSubject({ subject_name: '', subject_code: '', credits: '' });
      fetchSubjects();
    } catch (error) {
      console.error('Error creating subject:', error);
      alert(error.message || 'Failed to create subject');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/semester-subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete subject');
      
      alert('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject');
    }
  };

  const handleAddExam = () => {
    if (!newExam.subject_id || !newExam.exam_date || !newExam.start_time || !newExam.end_time) {
      alert('Please fill all required fields');
      return;
    }
    
    setExams([...exams, { ...newExam }]);
    setNewExam({ subject_id: '', exam_date: '', start_time: '', end_time: '', room: '' });
  };

  const handleRemoveExam = (index) => {
    setExams(exams.filter((_, i) => i !== index));
  };

  const handleSaveExamTimetable = async () => {
    if (exams.length === 0) {
      alert('Please add at least one exam');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/exam-timetables', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batch_year: parseInt(filters.batch_year),
          department: filters.department,
          semester: parseInt(filters.semester),
          exams
        })
      });
      
      if (!response.ok) throw new Error('Failed to save exam timetable');
      
      alert('Exam timetable saved successfully!');
      setExams([]);
      setActiveTab('view');
      fetchExamTimetables();
    } catch (error) {
      console.error('Error saving exam timetable:', error);
      alert('Failed to save exam timetable');
    }
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '2rem' }}>
          Exam Timetable Management
        </h1>

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Select Batch & Semester
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <select
              value={filters.batch_year}
              onChange={(e) => setFilters({ ...filters, batch_year: e.target.value })}
              disabled={user?.role === 'student'}
              style={{
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                backgroundColor: user?.role === 'student' ? '#f7fafc' : 'white'
              }}
            >
              <option value="">Select Batch Year</option>
              {batchYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              disabled={user?.role === 'student'}
              style={{
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                backgroundColor: user?.role === 'student' ? '#f7fafc' : 'white'
              }}
            >
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
            </select>

            <select
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
              style={{
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem'
              }}
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        {isTeacher && (
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0' }}>
            <button
              onClick={() => setActiveTab('view')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: activeTab === 'view' ? '#4A00E0' : '#718096',
                border: 'none',
                borderBottom: activeTab === 'view' ? '2px solid #4A00E0' : 'none',
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '-2px'
              }}
            >
              View Exam Timetable
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: activeTab === 'subjects' ? '#4A00E0' : '#718096',
                border: 'none',
                borderBottom: activeTab === 'subjects' ? '2px solid #4A00E0' : 'none',
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '-2px'
              }}
            >
              Manage Subjects
            </button>
            <button
              onClick={() => setActiveTab('create')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: activeTab === 'create' ? '#4A00E0' : '#718096',
                border: 'none',
                borderBottom: activeTab === 'create' ? '2px solid #4A00E0' : 'none',
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '-2px'
              }}
            >
              Create Exam Timetable
            </button>
          </div>
        )}

        {/* View Exam Timetable Tab */}
        {activeTab === 'view' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : examTimetables.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                textAlign: 'center',
                color: '#718096'
              }}>
                No exam timetable found. {isTeacher && 'Create one to get started!'}
              </div>
            ) : (
              examTimetables.map((tt) => (
                <div
                  key={tt._id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                    {tt.department} - Batch {tt.batch_year} - Semester {tt.semester}
                  </h3>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f7fafc' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Subject</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Date</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Time</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Room</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tt.exams.map((exam, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.75rem' }}>
                              {exam.subject_id?.subject_name} ({exam.subject_id?.subject_code})
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {new Date(exam.exam_date).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '0.75rem' }}>{exam.start_time} - {exam.end_time}</td>
                            <td style={{ padding: '0.75rem' }}>{exam.room || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Manage Subjects Tab */}
        {activeTab === 'subjects' && isTeacher && (
          <div>
            {/* Create Subject Form */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Add New Subject
              </h2>
              <form onSubmit={handleCreateSubject}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Subject Name"
                    value={newSubject.subject_name}
                    onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })}
                    required
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.375rem'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Subject Code"
                    value={newSubject.subject_code}
                    onChange={(e) => setNewSubject({ ...newSubject, subject_code: e.target.value })}
                    required
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.375rem'
                    }}
                  />
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Credits"
                    value={newSubject.credits}
                    onChange={(e) => setNewSubject({ ...newSubject, credits: e.target.value })}
                    required
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#4A00E0',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FiPlus />
                  Add Subject
                </button>
              </form>
            </div>

            {/* Subjects List */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Subjects List ({subjects.length})
              </h2>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
              ) : subjects.length === 0 ? (
                <p style={{ color: '#718096', textAlign: 'center' }}>No subjects found. Add one to get started!</p>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {subjects.map((subject) => (
                    <div
                      key={subject._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        backgroundColor: '#f7fafc',
                        borderRadius: '0.375rem'
                      }}
                    >
                      <div>
                        <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {subject.subject_name}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: '#718096' }}>
                          Code: {subject.subject_code} | Credits: {subject.credits}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSubject(subject._id)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer'
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Exam Timetable Tab */}
        {activeTab === 'create' && isTeacher && (
          <div>
            {/* Add Exam Form */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Add Exam Schedule
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <select
                  value={newExam.subject_id}
                  onChange={(e) => setNewExam({ ...newExam, subject_id: e.target.value })}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={newExam.exam_date}
                  onChange={(e) => setNewExam({ ...newExam, exam_date: e.target.value })}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }}
                />

                <input
                  type="time"
                  value={newExam.start_time}
                  onChange={(e) => setNewExam({ ...newExam, start_time: e.target.value })}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }}
                />

                <input
                  type="time"
                  value={newExam.end_time}
                  onChange={(e) => setNewExam({ ...newExam, end_time: e.target.value })}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }}
                />

                <input
                  type="text"
                  placeholder="Room (optional)"
                  value={newExam.room}
                  onChange={(e) => setNewExam({ ...newExam, room: e.target.value })}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>
              <button
                onClick={handleAddExam}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#4A00E0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiPlus />
                Add Exam
              </button>
            </div>

            {/* Exam Schedule Preview */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                  Exam Schedule Preview ({exams.length} exams)
                </h2>
                {exams.length > 0 && (
                  <button
                    onClick={handleSaveExamTimetable}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FiSave />
                    Save Exam Timetable
                  </button>
                )}
              </div>

              {exams.length === 0 ? (
                <p style={{ color: '#718096', textAlign: 'center', padding: '2rem' }}>
                  No exams added yet. Add exam schedules to create the timetable.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f7fafc' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Subject</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Date</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Time</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Room</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map((exam, idx) => {
                        const subject = subjects.find(s => s._id === exam.subject_id);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '0.75rem' }}>
                              {subject?.subject_name} ({subject?.subject_code})
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {new Date(exam.exam_date).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '0.75rem' }}>{exam.start_time} - {exam.end_time}</td>
                            <td style={{ padding: '0.75rem' }}>{exam.room || '-'}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <button
                                onClick={() => handleRemoveExam(idx)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#e53e3e',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <FiX />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;
