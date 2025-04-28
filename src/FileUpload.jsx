import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { FiUpload, FiArrowLeft, FiFile } from 'react-icons/fi';
import axios from 'axios';

// Initialize Supabase client
const supabaseUrl = 'https://btnbpqgzczkopffydkms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bmJwcWd6Y3prb3BmZnlka21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MDE3MTIsImV4cCI6MjA0OTQ3NzcxMn0.ClI_obLsIuzQ7ks-ysopQ0cX2ZBUSwRanS1mRjQ3qUM';
const supabase = createClient(supabaseUrl, supabaseKey);

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

export default function FileUpload() {
  const [sem, setSem] = useState('');
  const [dept, setDept] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchUploadedFiles();
  }, [currentUser, navigate]);

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/files/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUploadedFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFetchSubjects = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/subjects', {
        params: { sem, dept }
      });
      if (res.data) {
        setSubjects(res.data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !selectedSubject) return;

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${sem}/${dept}/${selectedSubject}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('jithu')
        .upload(fileName, file);

      if (error) throw error;

      // Save file metadata to MongoDB
      const fileData = {
        userId: currentUser.id,
        semester: sem,
        department: dept,
        subject: selectedSubject,
        fileName: file.name,
        fileUrl: data.path,
        fileType: fileExt,
        uploadDate: new Date()
      };

      await axios.post('http://localhost:5000/api/files/upload', fileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh uploaded files list
      fetchUploadedFiles();
      
      // Reset form
      setFile(null);
      setSelectedSubject('');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 text-white p-4">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-full shadow-lg transition-all duration-300 absolute top-6 right-6 backdrop-blur-sm border border-white/20"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto mt-16">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/10">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                File Upload
              </span>
            </h1>
            <p className="text-white/70 text-lg">Upload and manage your academic files</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Semester</label>
              <select
                value={sem}
                onChange={(e) => setSem(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm text-white border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="" className="text-black">Select Semester</option>
                {semesters.map(sem => (
                  <option key={sem.value} value={sem.value} className="text-black">{sem.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Department</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm text-white border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="" className="text-black">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value} className="text-black">{dept.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={handleFetchSubjects}
              disabled={!sem || !dept}
              className={`px-6 py-2 rounded-full font-medium text-white shadow-lg transition-all ${!sem || !dept ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600'}`}
            >
              Load Subjects
            </button>
          </div>

          {subjects.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-white/80 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm text-white border border-white/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="" className="text-black">Select Subject</option>
                {subjects.map(([subject]) => (
                  <option key={subject} value={subject} className="text-black">{subject}</option>
                ))}
              </select>

              <div className="mt-6">
                <label className="block text-sm font-medium text-white/80 mb-1">Upload File (PDF only)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-400 transition-colors"
                >
                  <div className="text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-white/50" />
                    <p className="mt-2 text-sm text-white/70">
                      {file ? file.name : 'Click to select a PDF file'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleFileUpload}
                  disabled={!file || !selectedSubject || uploading}
                  className={`px-8 py-3 rounded-full font-medium text-white shadow-lg transition-all ${!file || !selectedSubject || uploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'}`}
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </div>
          )}

          {/* Uploaded Files Section */}
          {uploadedFiles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6">Your Uploaded Files</h2>
              <div className="space-y-4">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center">
                      <FiFile className="h-6 w-6 text-blue-400 mr-3" />
                      <div>
                        <p className="font-medium">{file.fileName}</p>
                        <p className="text-sm text-white/60">
                          {file.subject} - Semester {file.semester}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-white/60">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}