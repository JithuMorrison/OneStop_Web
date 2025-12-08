const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// File Schema
const fileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  semester: { type: String, required: true },
  department: { type: String, required: true },
  subject: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());



// ------------------------------------------------------------- Connect to MongoDB -----------------------------------------------------


mongoose.connect(process.env.MONGOURL, {}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));



// ---------------------------------------------------------------  Schemas  -----------------------------------------------------------


const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String },
  role: { type: String, default: 'student', enum: ['student', 'teacher', 'admin'] },
  dob: { type: String, default: '' },
  credit: { type: Number, default: 1000 },
  events: { type: Array, default: [] },
  dept: { type: String },
  section: { type: String },
  year: { type: String },
  favblog: { type: Array, default: [] },
  favmat: { type: Array, default: [] },
  titles: { type: Array, default: [] },
  // SSN Connect fields
  roll_number: { type: String }, // 13 digits, required for students
  digital_id: { type: String }, // 7 digits
  department: { type: String },
  join_year: { type: Number },
  followers: { type: Array, default: [] }, // Changed from Number to Array of user IDs
  following: { type: Array, default: [] },
  liked: { type: Array, default: [] }, // IDs of liked content
  registered_events: { type: Array, default: [] }, // event IDs
  badges: { type: Array, default: [] },
  streak: { type: Number, default: 0 },
  achievements: { type: Array, default: [] },
  posts: { type: Array, default: [] }, // post IDs
  announcements: { type: Array, default: [] }, // announcement IDs
  materials: { type: Array, default: [] }, // material IDs
  chats: { type: Array, default: [] }, // chat thread IDs
  contacts: { type: Array, default: [] }, // user IDs
  ods: { type: Array, default: [] }, // OD claim IDs
  last_login: { type: Date },
  cgpa_data: { type: Object, default: null }, // CGPA calculator data
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetPasswordOTP: String,
  resetPasswordExpires: Date
});

const User = mongoose.model('User', UserSchema);

// Club Schema
const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true }, // Supabase Storage URL
  description: { type: String, required: true },
  subdomains: { type: Array, default: [] },
  members: { type: Array, default: [] }, // Array of { userId, name, role, subdomain }
  moderators: { type: Array, default: [] }, // Array of { userId, name, type: 'teacher' | 'student' }
  works_done: { type: Array, default: [] },
  links: { type: Array, default: [] }, // Array of { name, url }
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Club = mongoose.model('Club', ClubSchema);

// Announcement Schema
const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true }, // Supabase Storage URL or external URL
  additional_images: { type: Array, default: [] }, // Array of URLs
  hashtag: { type: String, required: true }, // #type_eventName_startDate_endDate
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0 },
  liked_by: { type: Array, default: [] }, // user IDs
  comments: { type: Array, default: [] }, // Array of { id, content, userId, userName, createdAt }
  registration_enabled: { type: Boolean, default: false },
  registration_fields: { type: Array, default: [] },
  registration_role_restriction: { type: String, enum: ['all', 'students', 'teachers'], default: 'all' }, // Who can register
  registrations: { type: Array, default: [] }, // Array of registration IDs
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model('Announcement', AnnouncementSchema);

// Post Schema
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // Supabase Storage URL
  visibility: { type: String, required: true, enum: ['students', 'teachers', 'everyone'] },
  hashtags: { type: Array, default: [] },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0 },
  liked_by: { type: Array, default: [] }, // user IDs
  comments: { type: Array, default: [] }, // Array of { id, content, userId, userName, createdAt }
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);

// Material Schema
const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  file_url: { type: String }, // Supabase Storage URL
  external_link: { type: String },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0 },
  liked_by: { type: Array, default: [] }, // user IDs
  comments: { type: Array, default: [] }, // Array of { id, content, userId, userName, createdAt }
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Material = mongoose.model('Material', MaterialSchema);

// OD Claim Schema
const ODClaimSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event_id: { type: mongoose.Schema.Types.ObjectId },
  event_name: { type: String, required: true },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  dates: { type: Array, default: [] }, // Array of date strings
  proof_url: { type: String }, // Supabase Storage URL for proof document
  status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'rejected'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ODClaim = mongoose.model('ODClaim', ODClaimSchema);

// Event Schema
const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  source_type: { type: String, required: true, enum: ['announcement', 'exam_schedule'] },
  source_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', EventSchema);

// Exam Schedule Schema
const ExamScheduleSchema = new mongoose.Schema({
  exam_name: { type: String, required: true },
  date: { type: Date, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  number_of_exams: { type: Number, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const ExamSchedule = mongoose.model('ExamSchedule', ExamScheduleSchema);

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['like', 'comment', 'announcement', 'od_status', 'event_reminder', 'message', 'query_response'] },
  content: { type: String, required: true },
  related_id: { type: mongoose.Schema.Types.ObjectId },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', NotificationSchema);

// Query Schema
const QuerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submitter_role: { type: String, required: true, enum: ['student', 'teacher'] },
  status: { type: String, default: 'pending', enum: ['pending', 'responded'] },
  response: { type: String },
  responded_at: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Query = mongoose.model('Query', QuerySchema);

// Portal Schema
const PortalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  external_link: { type: String, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Portal = mongoose.model('Portal', PortalSchema);

// Tool Schema
const ToolSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  external_link: { type: String, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Tool = mongoose.model('Tool', ToolSchema);

// Registration Schema
const RegistrationSchema = new mongoose.Schema({
  announcement_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: Object, required: true }, // Custom registration fields
  badge_issued: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', RegistrationSchema);

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now, index: { expires: '10h' } } // Auto-delete after 10 hours
  }]
});

const Chat = mongoose.model('Chat', ChatSchema);

// Group Chat Schema
const GroupChatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['world', 'custom', 'club'], required: true },
  club_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const GroupChat = mongoose.model('GroupChat', GroupChatSchema);

// Group Message Schema
const GroupMessageSchema = new mongoose.Schema({
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupChat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const GroupMessage = mongoose.model('GroupMessage', GroupMessageSchema);

const Schema = new mongoose.Schema({
  sem: String,
  dept: String,
  subjects: [[String, Number]]
}, { collection: 'cgpa' }); // specify the collection name

// Define model
const CgpaModel = mongoose.model('Cgpa', Schema);

// Semester Subject Schema (for teachers to define subjects)
const SemesterSubjectSchema = new mongoose.Schema({
  batch_year: { type: Number, required: true }, // 2022, 2023, 2024, etc.
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  subject_name: { type: String, required: true },
  subject_code: { type: String, required: true },
  credits: { type: Number, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SemesterSubject = mongoose.model('SemesterSubject', SemesterSubjectSchema);

// Exam Timetable Schema (teachers add exam dates for subjects)
const ExamTimetableSchema = new mongoose.Schema({
  batch_year: { type: Number, required: true }, // 2022, 2023, 2024, etc.
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  exams: [{ // Array of exam schedules
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SemesterSubject', required: true },
    exam_date: { type: Date, required: true },
    start_time: { type: String, required: true }, // HH:MM format
    end_time: { type: String, required: true }, // HH:MM format
    room: { type: String }
  }],
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ExamTimetable = mongoose.model('ExamTimetable', ExamTimetableSchema);



// -------------------------------------------------------- API Codes ---------------------------------------------------------------

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get first 10 files (legacy endpoint for old Materials page)
app.get('/api/files/materials', authenticateToken, async (req, res) => {
  try {
    const files = await File.find({}).sort({ uploadDate: -1 }).limit(10);
    res.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// -------------------------------------------------------- CGPA -------------------------------------------------------------------
// API to get subjects by sem and dept
app.get('/api/subjects', async (req, res) => {
  try {
    const { sem, dept } = req.query;
    const data = await CgpaModel.findOne({ sem, dept });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// File Upload Routes
app.post('/api/files/upload', authenticateToken, async (req, res) => {
  try {
    const fileData = new File({
      userId: req.body.userId,
      semester: req.body.semester,
      department: req.body.department,
      subject: req.body.subject,
      fileName: req.body.fileName,
      fileUrl: req.body.fileUrl,
      fileType: req.body.fileType
    });

    await fileData.save();
    res.status(201).json({ message: 'File metadata saved successfully' });
  } catch (error) {
    console.error('Error saving file metadata:', error);
    res.status(500).json({ error: 'Failed to save file metadata' });
  }
});

// Get User's Files
app.get('/api/files/:userId', authenticateToken, async (req, res) => {
  try {
    const files = await File.find({ userId: req.params.userId })
      .sort({ uploadDate: -1 });
    res.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get Files by Semester and Subject
app.get('/api/files/:userId/:semester/:subject', authenticateToken, async (req, res) => {
  try {
    const files = await File.find({
      userId: req.params.userId,
      semester: req.params.semester,
      subject: req.params.subject
    }).sort({ uploadDate: -1 });
    res.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});


// ------------------------------------------------------------- Login ---------------------------------------------------------------------

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

const adminOnlyMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Admin routes
app.get('/admin/users',  async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    
    res.json({
      users,
      counts: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create teacher account (admin only)
app.post('/api/admin/teachers', async (req, res) => {
  try {
    const { username, name, email, password, phone_number, dept, section, year } = req.body;
    
    // Validate required fields
    if (!username || !name || !email || !password || !dept) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create teacher
    const teacher = new User({
      username,
      name,
      email,
      password: hashedPassword,
      phone_number,
      dept,
      section,
      year,
      role: 'teacher',
      credit: 0
    });
    
    await teacher.save();
    
    res.status(201).json({
      message: 'Teacher account created successfully',
      teacher: {
        id: teacher._id,
        username: teacher.username,
        name: teacher.name,
        email: teacher.email,
        dept: teacher.dept,
        role: teacher.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create teacher account' });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Clean up any related data (chats, etc.)
    await Chat.deleteMany({ participants: user._id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * Helper function to check if two dates are consecutive days
 * Takes timezone into account by comparing dates in user's local timezone
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if dates are consecutive days
 */
const areConsecutiveDays = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  // Convert to date strings (YYYY-MM-DD) to ignore time component
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Reset time to midnight for comparison
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
};

/**
 * Helper function to check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if dates are the same day
 */
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * Update user's login streak based on last login timestamp
 * Awards "Consistency Badge" at 50-day streak
 * @param {Object} user - User document from MongoDB
 */
const updateUserStreak = async (user) => {
  const now = new Date();
  
  // If no previous login, start streak at 1
  if (!user.last_login) {
    user.streak = 1;
    return;
  }
  
  // If logging in on the same day, don't change streak
  if (isSameDay(user.last_login, now)) {
    return;
  }
  
  // If consecutive day, increment streak
  if (areConsecutiveDays(user.last_login, now)) {
    user.streak += 1;
    
    // Award "Consistency Badge" at 50-day streak
    if (user.streak === 50 && !user.badges.includes('Consistency Badge')) {
      user.badges.push('Consistency Badge');
    }
  } else {
    // Missed a day, reset streak to 1
    user.streak = 1;
  }
};

// API endpoint to manually update streak (can be called on login or separately)
app.post('/api/user/streak', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update streak
    await updateUserStreak(user);
    
    // Update last login
    user.last_login = new Date();
    await user.save();
    
    res.json({
      streak: user.streak,
      badges: user.badges,
      last_login: user.last_login,
    });
  } catch (err) {
    console.error('Streak update error:', err);
    res.status(500).json({ error: 'Failed to update streak' });
  }
});

// API endpoint to save CGPA data to user profile
app.post('/api/user/cgpa', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { courses, cgpa, savedAt } = req.body;
    
    // Store CGPA data in user profile
    user.cgpa_data = {
      courses,
      cgpa,
      savedAt: savedAt || new Date()
    };
    
    user.updatedAt = new Date();
    await user.save();
    
    res.json({
      message: 'CGPA data saved successfully',
      cgpa_data: user.cgpa_data
    });
  } catch (err) {
    console.error('CGPA save error:', err);
    res.status(500).json({ error: 'Failed to save CGPA data' });
  }
});

// API endpoint to get CGPA data from user profile
app.get('/api/user/cgpa', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      cgpa_data: user.cgpa_data || null
    });
  } catch (err) {
    console.error('CGPA fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch CGPA data' });
  }
});

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { 
      username, 
      name, 
      email, 
      password, 
      phone_number, 
      dept, 
      section, 
      year, 
      role = 'student',
      roll_number,
      digital_id,
      department,
      join_year
    } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // // Only admin can create teacher accounts
    // if (role === 'teacher' && req.user?.role !== 'admin') {
    //   return res.status(403).json({ error: 'Unauthorized to create teacher account' });
    // }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all SSN Connect fields
    const user = new User({
      username,
      name,
      email,
      password: hashedPassword,
      phone_number,
      dept: dept || department,
      section,
      year: year || (join_year ? join_year.toString() : undefined),
      role,
      credit: role === 'student' ? 1000 : 0,
      // SSN Connect fields
      roll_number: role === 'student' ? roll_number : null,
      digital_id,
      department: department || dept,
      join_year: join_year || (year ? parseInt(year) : undefined),
      followers: [],
      following: [],
      liked: [],
      registered_events: [],
      badges: [],
      streak: 0,
      achievements: [], // Will be awarded on first login
      posts: [],
      announcements: [],
      materials: [],
      chats: [],
      contacts: [],
      ods: [],
      last_login: null, // Not set until first login
    });

    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ 
      token, 
      user: { 
        _id: user._id,
        id: user._id, 
        username, 
        name,
        email,
        phone_number,
        dept: user.dept,
        section,
        year: user.year,
        role: user.role,
        credit: user.credit,
        roll_number: user.roll_number,
        digital_id: user.digital_id,
        department: user.department,
        join_year: user.join_year,
        streak: user.streak,
        badges: user.badges,
        achievements: user.achievements,
        followers: user.followers,
        following: user.following
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if this is the first login
    const isFirstLogin = !user.last_login;

    // Award "Welcome Achievement" on first login if not already awarded
    if (isFirstLogin && !user.achievements.includes('Welcome Achievement')) {
      user.achievements.push('Welcome Achievement');
    }

    // Update streak before updating last_login
    await updateUserStreak(user);

    // Update last login timestamp
    user.last_login = new Date();
    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        _id: user._id,
        id: user._id, 
        username: user.username, 
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        dept: user.dept,
        section: user.section,
        year: user.year,
        role: user.role,
        credit: user.credit,
        roll_number: user.roll_number,
        digital_id: user.digital_id,
        department: user.department,
        join_year: user.join_year,
        streak: user.streak,
        badges: user.badges,
        achievements: user.achievements,
        last_login: user.last_login,
        followers: user.followers,
        following: user.following
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ------------------------------------------------------------ Profile  ----------------------------------------------------------------

// Get user profile
app.get('/api/user/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
app.put('/api/user/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.userId;

    // Users can only update their own profile
    if (userId !== currentUserId) {
      return res.status(403).json({ error: 'Cannot update another user\'s profile' });
    }

    // Prevent updating sensitive fields
    const { password, email, role, _id, ...updates } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ----------------------------------------------------- Connect - Follow -----------------------------------------------------------------

app.get('/api/user/:userId/following', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('following')
      .populate('following', 'username name');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch following list' });
  }
});

// Follow user
app.post('/api/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if already following
    const currentUser = await User.findById(currentUserId);
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to following list
    await User.findByIdAndUpdate(currentUserId, {
      $push: { following: targetUserId }
    });

    // Add to target user's followers array
    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: currentUserId }
    });

    res.json({ message: 'Followed successfully' });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
app.post('/api/unfollow/:userId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'Cannot unfollow yourself' });
    }

    // Check if not following
    const currentUser = await User.findById(currentUserId);
    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    // Remove from following list
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId }
    });

    // Remove from target user's followers array
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId }
    });

    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error('Unfollow error:', err);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get user's followers and following data
app.get('/api/users/:userId/follows', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('followers following')
      .populate('following', 'username name');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      followers: user.followers,
      following: user.following
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch follow data' });
  }
});

// ----------------------------------------------------- Search Users -----------------------------------------------------------------

// Search users
app.get('/api/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').limit(10);
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ----------------------------------------------------- Chat Users ----------------------------------------------------------------------

app.get('/api/chat/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    // Find existing chat
    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] }
    }).populate('participants', 'username');

    // Create new chat if doesn't exist
    if (!chat) {
      chat = new Chat({
        participants: [currentUserId, userId]
      });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get chat' });
  }
});

// Send message
app.post('/api/chat/:chatId/message', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    const chat = await Chat.findByIdAndUpdate(chatId, {
      $push: {
        messages: {
          sender: req.userId,
          content
        }
      }
    }, { new: true });

    // Create notification for recipient(s)
    try {
      const sender = await User.findById(req.userId).select('name username');
      const recipients = chat.participants.filter(p => p.toString() !== req.userId);
      
      const notifications = recipients.map(recipientId => ({
        user_id: recipientId,
        type: 'message',
        content: `New message from ${sender.name || sender.username}`,
        related_id: chatId,
        read: false
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.error('Notification creation error:', notifErr);
      // Don't fail the message send if notification creation fails
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get chat messages
app.get('/api/chat/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId)
      .populate('messages.sender', 'username')
      .populate('participants', 'username');

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get all chats for current user
app.get('/api/chats', authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.userId
    })
    .populate('participants', 'username email')
    .populate('messages.sender', 'username')
    .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// ----------------------------------------------------- Forgot Password -----------------------------------------------------------------

const sendEmail = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail(mailOptions);
};

// Add this route after other API routes
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = Date.now() + 600000; // 10 minutes

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = resetTokenExpiry;
    
    await user.save({ validateBeforeSave: false });

    const mailOptions = {
      to: user.email,
      from: 'no-reply@yourdomain.com',
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}\n\nThis OTP is valid for 10 minutes.`
    };

    await sendEmail(mailOptions);

    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ 
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid OTP or OTP expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ----------------------------------------------------- Club Management -----------------------------------------------------------------

// Create club (admin only)
app.post('/api/clubs', authenticateToken, adminOnlyMiddleware, async (req, res) => {
  try {
    const {
      name,
      logo, // Supabase Storage URL
      description,
      subdomains,
      moderators // Array of { email, type: 'teacher' | 'student' }
    } = req.body;

    // Validate required fields
    if (!name || !logo || !description) {
      return res.status(400).json({ error: 'Name, logo, and description are required' });
    }

    // Validate moderators
    if (!moderators || !Array.isArray(moderators)) {
      return res.status(400).json({ error: 'Moderators array is required' });
    }

    // Check moderator limits: exactly 1 teacher, max 3 students
    const teacherModerators = moderators.filter(m => m.type === 'teacher');
    const studentModerators = moderators.filter(m => m.type === 'student');

    if (teacherModerators.length !== 1) {
      return res.status(400).json({ error: 'Exactly one teacher moderator is required' });
    }

    if (studentModerators.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 student moderators allowed' });
    }

    // Verify all moderator emails exist in database
    const moderatorEmails = moderators.map(m => m.email);
    const existingUsers = await User.find({ email: { $in: moderatorEmails } });
    
    if (existingUsers.length !== moderatorEmails.length) {
      return res.status(400).json({ error: 'One or more moderator emails do not exist' });
    }

    // Create moderators array with user IDs
    const moderatorsWithIds = moderators.map(mod => {
      const user = existingUsers.find(u => u.email === mod.email);
      return {
        userId: user._id,
        type: mod.type
      };
    });

    // Create club
    const club = new Club({
      name,
      logo,
      description,
      subdomains: subdomains || [],
      members: [], // Will be populated later
      moderators: moderatorsWithIds,
      works_done: [],
      created_by: req.userId,
    });

    await club.save();

    res.status(201).json({
      message: 'Club created successfully',
      club
    });
  } catch (err) {
    console.error('Club creation error:', err);
    res.status(500).json({ error: 'Failed to create club' });
  }
});

// Update club (moderators and admin)
app.put('/api/clubs/:id', authenticateToken, async (req, res) => {
  try {
    const clubId = req.params.id;
    const {
      name,
      description,
      subdomains,
      members,
      works_done
    } = req.body;

    // Find club
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Get user to check role
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is admin or a moderator
    const isAdmin = user.role === 'admin';
    const isModerator = club.moderators.some(
      mod => mod.userId.toString() === req.userId
    );

    if (!isAdmin && !isModerator) {
      return res.status(403).json({ error: 'Only club moderators and admins can edit this club' });
    }

    // Update allowed fields
    if (name) club.name = name;
    if (description) club.description = description;
    if (subdomains) club.subdomains = subdomains;
    if (members) club.members = members;
    if (works_done) club.works_done = works_done;

    club.updatedAt = new Date();
    await club.save();

    res.json({
      message: 'Club updated successfully',
      club
    });
  } catch (err) {
    console.error('Club update error:', err);
    res.status(500).json({ error: 'Failed to update club' });
  }
});

// Delete club (admin only)
app.delete('/api/clubs/:id', authenticateToken, adminOnlyMiddleware, async (req, res) => {
  try {
    const clubId = req.params.id;
    
    const club = await Club.findByIdAndDelete(clubId);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    res.json({ message: 'Club deleted successfully' });
  } catch (err) {
    console.error('Club delete error:', err);
    res.status(500).json({ error: 'Failed to delete club' });
  }
});

// Get all clubs
app.get('/api/clubs', authenticateToken, async (req, res) => {
  try {
    const clubs = await Club.find({})
      .populate('created_by', 'name email')
      .populate('moderators.userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(clubs);
  } catch (err) {
    console.error('Fetch clubs error:', err);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// Get single club by ID
app.get('/api/clubs/:id', authenticateToken, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('created_by', 'name email')
      .populate('moderators.userId', 'name email role');

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    res.json(club);
  } catch (err) {
    console.error('Fetch club error:', err);
    res.status(500).json({ error: 'Failed to fetch club' });
  }
});

// Check if user can edit club
app.get('/api/clubs/:id/can-edit', authenticateToken, async (req, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.userId;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Check if user is a moderator
    const canEdit = club.moderators.some(
      mod => mod.userId.toString() === userId
    );

    res.json({ canEdit });
  } catch (err) {
    console.error('Check edit permission error:', err);
    res.status(500).json({ error: 'Failed to check edit permission' });
  }
});

// ============================================ ANNOUNCEMENT ROUTES ============================================

// Create announcement
app.post('/api/announcements', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      image, // Supabase Storage URL or external URL
      additional_images,
      hashtag,
      start_date,
      end_date,
      registration_enabled,
      registration_fields,
      registration_role_restriction
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !image || !hashtag || !start_date || !end_date) {
      return res.status(400).json({ error: 'Title, description, category, image, hashtag, start_date, and end_date are required' });
    }

    // Create announcement
    const announcement = new Announcement({
      title,
      description,
      category,
      image,
      additional_images: additional_images || [],
      hashtag,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      created_by: req.userId,
      registration_enabled: registration_enabled || false,
      registration_fields: registration_fields || [],
      registration_role_restriction: registration_role_restriction || 'all',
      registrations: []
    });

    await announcement.save();

    // Add announcement ID to user's announcements array
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { announcements: announcement._id } }
    );

    // Check if event with same hashtag already exists
    const existingEvent = await Event.findOne({
      source_type: 'announcement',
      name: title,
      type: category,
      start_date: new Date(start_date),
      end_date: new Date(end_date)
    });

    // Create event only if it doesn't exist
    if (!existingEvent) {
      try {
        const event = new Event({
          name: title,
          type: category,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          source_type: 'announcement',
          source_id: announcement._id
        });

        await event.save();
      } catch (eventErr) {
        console.error('Event creation error:', eventErr);
        // Don't fail the announcement creation if event creation fails
      }
    }

    // Create notifications for all users (announcement broadcast)
    try {
      const allUsers = await User.find({}, '_id');
      const notifications = allUsers.map(user => ({
        user_id: user._id,
        type: 'announcement',
        content: `New announcement: ${title}`,
        related_id: announcement._id,
        read: false
      }));

      await Notification.insertMany(notifications);
    } catch (notifErr) {
      console.error('Notification creation error:', notifErr);
      // Don't fail the announcement creation if notification creation fails
    }

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (err) {
    console.error('Announcement creation error:', err);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Get announcements with optional category filter
app.get('/api/announcements', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {};
    if (category) {
      filter.category = category;
    }

    const announcements = await Announcement.find(filter)
      .populate('created_by', 'name email role')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    console.error('Fetch announcements error:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Get announcements by user (for teacher dashboard)
app.get('/api/announcements/user/:userId', authenticateToken, async (req, res) => {
  try {
    const announcements = await Announcement.find({ created_by: req.params.userId })
      .populate('created_by', 'name email role')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    console.error('Fetch user announcements error:', err);
    res.status(500).json({ error: 'Failed to fetch user announcements' });
  }
});

// Get liked announcements (for student dashboard)
app.get('/api/announcements/liked', authenticateToken, async (req, res) => {
  try {
    // Get current user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get announcements that user has liked
    const announcements = await Announcement.find({ 
      liked_by: req.userId
    })
      .populate('created_by', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(announcements);
  } catch (err) {
    console.error('Fetch liked announcements error:', err);
    res.status(500).json({ error: 'Failed to fetch liked announcements' });
  }
});

// Register for announcement
app.post('/api/announcements/:id/register', authenticateToken, async (req, res) => {
  try {
    const announcementId = req.params.id;
    const userId = req.userId;
    const registrationData = req.body;

    // Find announcement
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Check if registration is enabled
    if (!announcement.registration_enabled) {
      return res.status(400).json({ error: 'Registration is not enabled for this announcement' });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check role restrictions
    const roleRestriction = announcement.registration_role_restriction || 'all';
    if (roleRestriction !== 'all') {
      if (roleRestriction === 'students' && user.role !== 'student') {
        return res.status(403).json({ error: 'Only students can register for this event' });
      }
      if (roleRestriction === 'teachers' && user.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can register for this event' });
      }
    }

    // Check if user already registered
    const existingRegistration = await Registration.findOne({
      announcement_id: announcementId,
      user_id: userId
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'You have already registered for this announcement' });
    }

    // Auto-populate user data (name, email, role) and merge with custom fields
    const completeRegistrationData = {
      name: user.name,
      email: user.email,
      role: user.role,
      ...registrationData // Custom fields from the form
    };

    // Create registration
    const registration = new Registration({
      announcement_id: announcementId,
      user_id: userId,
      data: completeRegistrationData,
      badge_issued: false
    });

    await registration.save();

    // Add registration info to announcement (with user details)
    await Announcement.findByIdAndUpdate(
      announcementId,
      { $push: { 
        registrations: {
          _id: registration._id,
          user_id: userId,
          user_name: user.name,
          user_email: user.email,
          data: completeRegistrationData,
          createdAt: registration.createdAt
        }
      }}
    );

    // Add announcement ID to user's registered_events
    await User.findByIdAndUpdate(
      userId,
      { $push: { registered_events: announcementId } }
    );

    res.status(201).json({
      message: 'Registration successful',
      registration
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register for announcement' });
  }
});

// Get registrations for announcement (creator only)
app.get('/api/announcements/:id/registrations', authenticateToken, async (req, res) => {
  try {
    const announcementId = req.params.id;

    // Find announcement
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Check if user is the creator
    if (announcement.created_by.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the announcement creator can view registrations' });
    }

    // Get all registrations
    const registrations = await Registration.find({ announcement_id: announcementId })
      .populate('user_id', 'name email roll_number department');

    res.json(registrations);
  } catch (err) {
    console.error('Fetch registrations error:', err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Issue badges to participants
app.post('/api/announcements/:id/badges', authenticateToken, async (req, res) => {
  try {
    const announcementId = req.params.id;
    const { userIds, badge } = req.body;

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }

    if (!badge || typeof badge !== 'string') {
      return res.status(400).json({ error: 'Badge name is required' });
    }

    // Find announcement
    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Check if user is the creator
    if (announcement.created_by.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the announcement creator can issue badges' });
    }

    // Issue badges to all specified users
    await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { badges: badge } }
    );

    // Mark badges as issued in registrations
    await Registration.updateMany(
      { 
        announcement_id: announcementId,
        user_id: { $in: userIds }
      },
      { badge_issued: true }
    );

    res.json({
      message: 'Badges issued successfully',
      count: userIds.length
    });
  } catch (err) {
    console.error('Badge issuance error:', err);
    res.status(500).json({ error: 'Failed to issue badges' });
  }
});

// ============================================ POST ROUTES ============================================

// Create post
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      image, // Supabase Storage URL (optional)
      visibility,
      hashtags
    } = req.body;

    // Validate required fields
    if (!title || !description || !visibility) {
      return res.status(400).json({ error: 'Title, description, and visibility are required' });
    }

    // Validate visibility value
    if (!['students', 'teachers', 'everyone'].includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility value' });
    }

    // Create post
    const post = new Post({
      title,
      description,
      image: image || null,
      visibility,
      hashtags: hashtags || [],
      created_by: req.userId,
      likes: 0,
      liked_by: [],
      comments: []
    });

    await post.save();

    // Add post ID to user's posts array
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { posts: post._id } }
    );

    // Populate creator info before sending response
    await post.populate('created_by', 'name email role username');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (err) {
    console.error('Post creation error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get posts with role-based filtering
app.get('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { hashtags } = req.query;

    // Get current user to determine role
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build filter based on user role
    let visibilityFilter;
    if (user.role === 'student') {
      // Students see 'students' and 'everyone' posts
      visibilityFilter = { visibility: { $in: ['students', 'everyone'] } };
    } else if (user.role === 'teacher') {
      // Teachers see 'teachers' and 'everyone' posts
      visibilityFilter = { visibility: { $in: ['teachers', 'everyone'] } };
    } else {
      // Admin sees all posts
      visibilityFilter = {};
    }

    // Add hashtag filter if provided
    const filter = { ...visibilityFilter };
    if (hashtags) {
      const hashtagArray = Array.isArray(hashtags) ? hashtags : [hashtags];
      filter.hashtags = { $in: hashtagArray };
    }

    const posts = await Post.find(filter)
      .populate('created_by', 'name email role username')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get posts by user (for profile page)
app.get('/api/posts/user/:userId', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find({ created_by: req.params.userId })
      .populate('created_by', 'name email role username')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('Fetch user posts error:', err);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get followed posts (for student dashboard)
// Get liked posts (for student dashboard)
app.get('/api/posts/liked', authenticateToken, async (req, res) => {
  try {
    // Get current user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get posts that user has liked
    const posts = await Post.find({ 
      liked_by: req.userId
    })
      .populate('created_by', 'name email role username')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(posts);
  } catch (err) {
    console.error('Fetch liked posts error:', err);
    res.status(500).json({ error: 'Failed to fetch followed posts' });
  }
});

// Share post with contacts
app.post('/api/posts/:id/share', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { contactIds } = req.body;

    // Validate input
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ error: 'Contact IDs array is required' });
    }

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create notifications for each contact
    const notifications = contactIds.map(contactId => ({
      user_id: contactId,
      type: 'message',
      content: `${req.userId} shared a post with you: ${post.title}`,
      related_id: postId,
      read: false
    }));

    await Notification.insertMany(notifications);

    // Add contacts to sender's contacts array if not already present
    await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { contacts: { $each: contactIds } } }
    );

    res.json({
      message: 'Post shared successfully',
      sharedWith: contactIds.length
    });
  } catch (err) {
    console.error('Share post error:', err);
    res.status(500).json({ error: 'Failed to share post' });
  }
});

// Get single post by ID
app.get('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('created_by', 'name email role username');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check visibility permissions
    const user = await User.findById(req.userId);
    if (user.role === 'student' && !['students', 'everyone'].includes(post.visibility)) {
      return res.status(403).json({ error: 'You do not have permission to view this post' });
    }
    if (user.role === 'teacher' && !['teachers', 'everyone'].includes(post.visibility)) {
      return res.status(403).json({ error: 'You do not have permission to view this post' });
    }

    res.json(post);
  } catch (err) {
    console.error('Fetch post error:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// ============================================ MATERIAL ROUTES ============================================

// Create/upload material
app.post('/api/materials', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      file_url, // Supabase Storage URL (optional)
      external_link // External link (optional)
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // At least one of file_url or external_link must be provided
    if (!file_url && !external_link) {
      return res.status(400).json({ error: 'Either file URL or external link is required' });
    }

    // Create material
    const material = new Material({
      title,
      description,
      file_url: file_url || null,
      external_link: external_link || null,
      uploaded_by: req.userId,
      likes: 0,
      liked_by: [],
      comments: []
    });

    await material.save();

    // Add material ID to user's materials array
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { materials: material._id } }
    );

    // Populate uploader info before sending response
    await material.populate('uploaded_by', 'name email role username');

    res.status(201).json({
      message: 'Material uploaded successfully',
      material
    });
  } catch (err) {
    console.error('Material upload error:', err);
    res.status(500).json({ error: 'Failed to upload material' });
  }
});

// Get all materials
app.get('/api/materials', authenticateToken, async (req, res) => {
  try {
    const materials = await Material.find({})
      .populate('uploaded_by', 'name email role username')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (err) {
    console.error('Fetch materials error:', err);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// Get materials by user (for profile page)
app.get('/api/materials/user/:userId', authenticateToken, async (req, res) => {
  try {
    const materials = await Material.find({ uploaded_by: req.params.userId })
      .populate('uploaded_by', 'name email role username')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (err) {
    console.error('Fetch user materials error:', err);
    res.status(500).json({ error: 'Failed to fetch user materials' });
  }
});

// Share material with contacts
app.post('/api/materials/:id/share', authenticateToken, async (req, res) => {
  try {
    const materialId = req.params.id;
    const { contactIds } = req.body;

    // Validate input
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ error: 'Contact IDs array is required' });
    }

    // Find material
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Create notifications for each contact
    const notifications = contactIds.map(contactId => ({
      user_id: contactId,
      type: 'message',
      content: `${req.userId} shared a material with you: ${material.title}`,
      related_id: materialId,
      read: false
    }));

    await Notification.insertMany(notifications);

    // Add contacts to sender's contacts array if not already present
    await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { contacts: { $each: contactIds } } }
    );

    res.json({
      message: 'Material shared successfully',
      sharedWith: contactIds.length
    });
  } catch (err) {
    console.error('Share material error:', err);
    res.status(500).json({ error: 'Failed to share material' });
  }
});

// Get single material by ID
app.get('/api/materials/:id', authenticateToken, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploaded_by', 'name email role username');

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (err) {
    console.error('Fetch material error:', err);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

// ----------------------------------------------------- Like and Comment Interactions -----------------------------------------------------------------

// Like content (works for announcements, posts, materials)
app.post('/api/:contentType/:id/like', authenticateToken, async (req, res) => {
  try {
    const { contentType, id } = req.params;
    const userId = req.userId;

    // Determine the model based on content type
    let Model;
    if (contentType === 'announcements') {
      Model = Announcement;
    } else if (contentType === 'posts') {
      Model = Post;
    } else if (contentType === 'materials') {
      Model = Material;
    } else {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Find the content
    const content = await Model.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Check if user already liked
    const alreadyLiked = content.liked_by.includes(userId);

    if (alreadyLiked) {
      // Unlike: remove from liked_by and decrement likes
      content.liked_by = content.liked_by.filter(id => id.toString() !== userId.toString());
      content.likes = Math.max(0, content.likes - 1);
    } else {
      // Like: add to liked_by and increment likes
      content.liked_by.push(userId);
      content.likes += 1;
    }

    content.updatedAt = Date.now();
    await content.save();

    // Update user's liked array
    const user = await User.findById(userId);
    if (user) {
      if (alreadyLiked) {
        user.liked = user.liked.filter(contentId => contentId.toString() !== id.toString());
      } else {
        if (!user.liked.includes(id)) {
          user.liked.push(id);
        }
      }
      await user.save();
    }

    // Create notification for content creator (only when liking, not unliking)
    if (!alreadyLiked && content.created_by && content.created_by.toString() !== userId) {
      try {
        const notification = new Notification({
          user_id: content.created_by,
          type: 'like',
          content: `${user.name || user.username} liked your ${contentType.slice(0, -1)}`,
          related_id: id,
          read: false
        });
        await notification.save();
      } catch (notifErr) {
        console.error('Notification creation error:', notifErr);
        // Don't fail the like action if notification creation fails
      }
    }

    res.json({
      success: true,
      liked: !alreadyLiked,
      likes: content.likes,
      message: alreadyLiked ? 'Content unliked' : 'Content liked'
    });
  } catch (err) {
    console.error('Like content error:', err);
    res.status(500).json({ error: 'Failed to like content' });
  }
});

// Add comment to content (works for announcements, posts, materials)
app.post('/api/:contentType/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { contentType, id } = req.params;
    const { content: commentContent } = req.body;
    const userId = req.userId;

    if (!commentContent || !commentContent.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Determine the model based on content type
    let Model;
    if (contentType === 'announcements') {
      Model = Announcement;
    } else if (contentType === 'posts') {
      Model = Post;
    } else if (contentType === 'materials') {
      Model = Material;
    } else {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Find the content
    const content = await Model.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Get user info for comment
    const user = await User.findById(userId).select('name username');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create comment object
    const comment = {
      id: new mongoose.Types.ObjectId().toString(),
      content: commentContent.trim(),
      userId: userId,
      userName: user.name || user.username,
      createdAt: new Date()
    };

    // Add comment to content
    content.comments.push(comment);
    content.updatedAt = Date.now();
    await content.save();

    // Create notification for content creator (if not commenting on own content)
    if (content.created_by && content.created_by.toString() !== userId) {
      try {
        const notification = new Notification({
          user_id: content.created_by,
          type: 'comment',
          content: `${user.name || user.username} commented on your ${contentType.slice(0, -1)}`,
          related_id: id,
          read: false
        });
        await notification.save();
      } catch (notifErr) {
        console.error('Notification creation error:', notifErr);
        // Don't fail the comment action if notification creation fails
      }
    }

    res.json({
      success: true,
      comment: comment,
      message: 'Comment added successfully'
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ============================================ OD CLAIM ROUTES ============================================

// Create OD claim (students only)
app.post('/api/od-claims', authenticateToken, async (req, res) => {
  try {
    const {
      event_id,
      event_name,
      teacher_id,
      description,
      dates,
      proof_url
    } = req.body;

    // Validate required fields
    if (!event_name || !teacher_id || !description) {
      return res.status(400).json({ error: 'Event name, teacher ID, and description are required' });
    }

    // Validate dates
    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: 'At least one date is required' });
    }

    // Get current user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only students can create OD claims
    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can create OD claims' });
    }

    // Verify teacher exists
    const teacher = await User.findById(teacher_id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ error: 'Invalid teacher ID' });
    }

    // Create OD claim
    const odClaim = new ODClaim({
      student_id: req.userId,
      event_id: event_id || null,
      event_name,
      teacher_id,
      description,
      dates: dates,
      proof_url: proof_url || null,
      status: 'pending'
    });

    await odClaim.save();

    // Add OD claim ID to student's ods array
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { ods: odClaim._id } }
    );

    // Populate student and teacher info before sending response
    await odClaim.populate('student_id', 'name email roll_number');
    await odClaim.populate('teacher_id', 'name email');

    res.status(201).json({
      message: 'OD claim created successfully',
      odClaim
    });
  } catch (err) {
    console.error('OD claim creation error:', err);
    res.status(500).json({ error: 'Failed to create OD claim' });
  }
});

// Get student's OD claims
app.get('/api/od-claims/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Users can only view their own OD claims (unless admin)
    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && req.userId !== studentId) {
      return res.status(403).json({ error: 'You can only view your own OD claims' });
    }

    const odClaims = await ODClaim.find({ student_id: studentId })
      .populate('student_id', 'name email roll_number')
      .populate('teacher_id', 'name email')
      .sort({ createdAt: -1 });

    res.json(odClaims);
  } catch (err) {
    console.error('Fetch student OD claims error:', err);
    res.status(500).json({ error: 'Failed to fetch student OD claims' });
  }
});

// Get teacher's OD claims with optional status filter
app.get('/api/od-claims/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { status } = req.query;

    // Teachers can only view their own OD claims (unless admin)
    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && req.userId !== teacherId) {
      return res.status(403).json({ error: 'You can only view your own OD claims' });
    }

    // Build filter
    const filter = { teacher_id: teacherId };
    if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const odClaims = await ODClaim.find(filter)
      .populate('student_id', 'name email roll_number')
      .populate('teacher_id', 'name email')
      .sort({ createdAt: -1 });

    res.json(odClaims);
  } catch (err) {
    console.error('Fetch teacher OD claims error:', err);
    res.status(500).json({ error: 'Failed to fetch teacher OD claims' });
  }
});

// Update OD claim status (teachers only)
app.put('/api/od-claims/:id/status', authenticateToken, async (req, res) => {
  try {
    const odClaimId = req.params.id;
    const { status } = req.body;

    // Validate status
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "accepted" or "rejected"' });
    }

    // Find OD claim
    const odClaim = await ODClaim.findById(odClaimId);
    if (!odClaim) {
      return res.status(404).json({ error: 'OD claim not found' });
    }

    // Get current user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only the tagged teacher can update the status
    if (user.role !== 'teacher' || odClaim.teacher_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the tagged teacher can update OD claim status' });
    }

    // Update status
    odClaim.status = status;
    odClaim.updatedAt = new Date();
    await odClaim.save();

    // Create notification for student
    const notification = new Notification({
      user_id: odClaim.student_id,
      type: 'od_status',
      content: `Your OD claim for "${odClaim.event_name}" has been ${status}`,
      related_id: odClaimId,
      read: false
    });

    await notification.save();

    // Populate student and teacher info before sending response
    await odClaim.populate('student_id', 'name email roll_number');
    await odClaim.populate('teacher_id', 'name email');

    res.json({
      message: `OD claim ${status} successfully`,
      odClaim
    });
  } catch (err) {
    console.error('Update OD claim status error:', err);
    res.status(500).json({ error: 'Failed to update OD claim status' });
  }
});

// ============================================ EVENT AND EXAM SCHEDULE ROUTES ============================================

// Create exam schedule (teachers only)
app.post('/api/exam-schedules', authenticateToken, async (req, res) => {
  try {
    const {
      exam_name,
      date,
      year,
      semester,
      number_of_exams
    } = req.body;

    // Validate required fields
    if (!exam_name || !date || !year || !semester || !number_of_exams) {
      return res.status(400).json({ error: 'All fields are required: exam_name, date, year, semester, number_of_exams' });
    }

    // Get current user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only teachers can create exam schedules
    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create exam schedules' });
    }

    // Create exam schedule
    const examSchedule = new ExamSchedule({
      exam_name,
      date: new Date(date),
      year,
      semester,
      number_of_exams,
      created_by: req.userId
    });

    await examSchedule.save();

    // Create corresponding event
    const event = new Event({
      name: exam_name,
      type: 'exam',
      start_date: new Date(date),
      end_date: new Date(date), // Exams are single-day events
      source_type: 'exam_schedule',
      source_id: examSchedule._id
    });

    await event.save();

    // Populate creator info before sending response
    await examSchedule.populate('created_by', 'name email role');

    res.status(201).json({
      message: 'Exam schedule created successfully',
      examSchedule,
      event
    });
  } catch (err) {
    console.error('Exam schedule creation error:', err);
    res.status(500).json({ error: 'Failed to create exam schedule' });
  }
});

// Get all events with optional date range filtering
app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {};

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.$or = [];
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Find events that overlap with the date range
        filter.$or = [
          // Event starts within range
          { start_date: { $gte: start, $lte: end } },
          // Event ends within range
          { end_date: { $gte: start, $lte: end } },
          // Event spans the entire range
          { start_date: { $lte: start }, end_date: { $gte: end } }
        ];
      } else if (startDate) {
        const start = new Date(startDate);
        filter.end_date = { $gte: start };
      } else if (endDate) {
        const end = new Date(endDate);
        filter.start_date = { $lte: end };
      }
    }

    const events = await Event.find(filter)
      .sort({ start_date: 1 });

    res.json(events);
  } catch (err) {
    console.error('Fetch events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get events for a specific date
app.get('/api/events/date/:date', authenticateToken, async (req, res) => {
  try {
    const dateParam = req.params.date;
    const targetDate = new Date(dateParam);

    // Set to start of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Set to end of day
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find events that occur on this date
    const events = await Event.find({
      $or: [
        // Event starts on this date
        { start_date: { $gte: startOfDay, $lte: endOfDay } },
        // Event ends on this date
        { end_date: { $gte: startOfDay, $lte: endOfDay } },
        // Event spans this date
        { start_date: { $lte: startOfDay }, end_date: { $gte: endOfDay } }
      ]
    }).sort({ start_date: 1 });

    res.json(events);
  } catch (err) {
    console.error('Fetch events for date error:', err);
    res.status(500).json({ error: 'Failed to fetch events for date' });
  }
});

// Get upcoming events (for dashboards) - events within 1 month from now
app.get('/api/events/upcoming', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    const events = await Event.find({
      start_date: { 
        $gte: now,
        $lte: oneMonthFromNow
      }
    })
    .sort({ start_date: 1 })
    .limit(10);

    res.json(events);
  } catch (err) {
    console.error('Fetch upcoming events error:', err);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// Get events created by a specific teacher (for teacher dashboard)
app.get('/api/events/teacher/:teacherId', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    // Find all exam schedules created by this teacher
    const examSchedules = await ExamSchedule.find({ created_by: teacherId });
    const examScheduleIds = examSchedules.map(es => es._id);

    // Find all announcements created by this teacher
    const announcements = await Announcement.find({ created_by: teacherId });
    const announcementIds = announcements.map(a => a._id);

    // Find events from both sources
    const events = await Event.find({
      $or: [
        { source_type: 'exam_schedule', source_id: { $in: examScheduleIds } },
        { source_type: 'announcement', source_id: { $in: announcementIds } }
      ]
    }).sort({ start_date: 1 });

    res.json(events);
  } catch (err) {
    console.error('Fetch teacher events error:', err);
    res.status(500).json({ error: 'Failed to fetch teacher events' });
  }
});

// Get all exam schedules
app.get('/api/exam-schedules', authenticateToken, async (req, res) => {
  try {
    const examSchedules = await ExamSchedule.find({})
      .populate('created_by', 'name email role')
      .sort({ date: 1 });

    res.json(examSchedules);
  } catch (err) {
    console.error('Fetch exam schedules error:', err);
    res.status(500).json({ error: 'Failed to fetch exam schedules' });
  }
});

// ----------------------------------------------------- Portal and Tool Management -----------------------------------------------------------------

// Create portal (admin only)
app.post('/api/portals', authenticateToken, adminOnlyMiddleware, async (req, res) => {
  try {
    const { title, description, external_link } = req.body;

    // Validate required fields
    if (!title || !description || !external_link) {
      return res.status(400).json({ error: 'Title, description, and external link are required' });
    }

    const portal = new Portal({
      title,
      description,
      external_link,
      created_by: req.userId
    });

    await portal.save();
    res.status(201).json(portal);
  } catch (err) {
    console.error('Create portal error:', err);
    res.status(500).json({ error: 'Failed to create portal' });
  }
});

// Get all portals
app.get('/api/portals', authenticateToken, async (req, res) => {
  try {
    const portals = await Portal.find({})
      .populate('created_by', 'name email role')
      .sort({ createdAt: -1 });

    res.json(portals);
  } catch (err) {
    console.error('Fetch portals error:', err);
    res.status(500).json({ error: 'Failed to fetch portals' });
  }
});

// Create tool (admin only)
app.post('/api/tools', authenticateToken, adminOnlyMiddleware, async (req, res) => {
  try {
    const { title, description, external_link } = req.body;

    // Validate required fields
    if (!title || !description || !external_link) {
      return res.status(400).json({ error: 'Title, description, and external link are required' });
    }

    const tool = new Tool({
      title,
      description,
      external_link,
      created_by: req.userId
    });

    await tool.save();
    res.status(201).json(tool);
  } catch (err) {
    console.error('Create tool error:', err);
    res.status(500).json({ error: 'Failed to create tool' });
  }
});

// Get all tools
app.get('/api/tools', authenticateToken, async (req, res) => {
  try {
    const tools = await Tool.find({})
      .populate('created_by', 'name email role')
      .sort({ createdAt: -1 });

    res.json(tools);
  } catch (err) {
    console.error('Fetch tools error:', err);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// ----------------------------------------------------- Query Endpoints -----------------------------------------------------------------

// Submit a query (students and teachers)
app.post('/api/queries', authenticateToken, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Get user to check role
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only students and teachers can submit queries
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Admins cannot submit queries' });
    }

    const query = new Query({
      title,
      description,
      submitted_by: req.userId,
      submitter_role: user.role,
      status: 'pending'
    });

    await query.save();

    // Create notification for admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      const notification = new Notification({
        user_id: adminUser._id,
        type: 'query_response',
        content: `New query submitted: ${title}`,
        related_id: query._id
      });
      await notification.save();
    }

    res.status(201).json(query);
  } catch (err) {
    console.error('Submit query error:', err);
    res.status(500).json({ error: 'Failed to submit query' });
  }
});

// Get user's queries
app.get('/api/queries/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own queries
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const queries = await Query.find({ submitted_by: userId })
      .sort({ createdAt: -1 });

    res.json(queries);
  } catch (err) {
    console.error('Fetch user queries error:', err);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
});

// Get all queries (admin only)
app.get('/api/queries', authenticateToken, adminOnlyMiddleware, async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const queries = await Query.find(filter)
      .populate('submitted_by', 'name email role')
      .sort({ createdAt: -1 });

    res.json(queries);
  } catch (err) {
    console.error('Fetch all queries error:', err);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
});

// Respond to a query (admin only)
app.put('/api/queries/:id/respond', authenticateToken, adminOnlyMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response is required' });
    }

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }

    query.status = 'responded';
    query.response = response;
    query.responded_at = new Date();
    await query.save();

    // Create notification for submitter
    const notification = new Notification({
      user_id: query.submitted_by,
      type: 'query_response',
      content: `Your query "${query.title}" has been responded to`,
      related_id: query._id
    });
    await notification.save();

    res.json(query);
  } catch (err) {
    console.error('Respond to query error:', err);
    res.status(500).json({ error: 'Failed to respond to query' });
  }
});

// ----------------------------------------------------- Notification Endpoints -----------------------------------------------------------------

// Create notification (internal use by other endpoints)
app.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { user_id, type, content, related_id } = req.body;

    // Validate required fields
    if (!user_id || !type || !content) {
      return res.status(400).json({ error: 'user_id, type, and content are required' });
    }

    // Validate type
    const validTypes = ['like', 'comment', 'announcement', 'od_status', 'event_reminder', 'message', 'query_response'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    const notification = new Notification({
      user_id,
      type,
      content,
      related_id: related_id || null,
      read: false
    });

    await notification.save();

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Get user's notifications
app.get('/api/notifications/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own notifications (unless admin)
    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && req.userId !== userId) {
      return res.status(403).json({ error: 'You can only view your own notifications' });
    }

    const notifications = await Notification.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent notifications

    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Users can only mark their own notifications as read
    if (notification.user_id.toString() !== req.userId) {
      return res.status(403).json({ error: 'You can only mark your own notifications as read' });
    }

    notification.read = true;
    await notification.save();

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (err) {
    console.error('Mark notification as read error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read for a user
app.put('/api/notifications/user/:userId/read-all', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only mark their own notifications as read
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'You can only mark your own notifications as read' });
    }

    await Notification.updateMany(
      { user_id: userId, read: false },
      { $set: { read: true } }
    );

    res.json({
      message: 'All notifications marked as read'
    });
  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get unread notification count
app.get('/api/notifications/:userId/unread-count', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own notification count
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'You can only view your own notification count' });
    }

    const count = await Notification.countDocuments({ user_id: userId, read: false });

    res.json({ count });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// ----------------------------------------------------- Semester Subjects Management -----------------------------------------------------------------

// Create semester subject (teachers only)
app.post('/api/semester-subjects', authenticateToken, async (req, res) => {
  try {
    const { batch_year, department, semester, subject_name, subject_code, credits } = req.body;
    
    // Verify user is a teacher
    const user = await User.findById(req.userId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create subjects' });
    }
    
    // Validate required fields
    if (!batch_year || !department || !semester || !subject_name || !subject_code || !credits) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if subject already exists
    const existingSubject = await SemesterSubject.findOne({ 
      batch_year, department, semester, subject_code 
    });
    
    if (existingSubject) {
      return res.status(400).json({ error: 'Subject with this code already exists for this semester' });
    }
    
    const subject = new SemesterSubject({
      batch_year,
      department,
      semester,
      subject_name,
      subject_code,
      credits,
      created_by: req.userId
    });
    
    await subject.save();
    
    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (err) {
    console.error('Create subject error:', err);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Get semester subjects by filters
app.get('/api/semester-subjects', authenticateToken, async (req, res) => {
  try {
    const { batch_year, department, semester } = req.query;
    
    const query = {};
    if (batch_year) query.batch_year = parseInt(batch_year);
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    
    const subjects = await SemesterSubject.find(query)
      .populate('created_by', 'name email')
      .sort({ subject_code: 1 });
    
    res.json(subjects);
  } catch (err) {
    console.error('Fetch subjects error:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Update semester subject (teachers only)
app.put('/api/semester-subjects/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can update subjects' });
    }
    
    const { subject_name, subject_code, credits } = req.body;
    
    const subject = await SemesterSubject.findByIdAndUpdate(
      req.params.id,
      { subject_name, subject_code, credits, updatedAt: new Date() },
      { new: true }
    );
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json({ message: 'Subject updated successfully', subject });
  } catch (err) {
    console.error('Update subject error:', err);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// Delete semester subject (teachers only)
app.delete('/api/semester-subjects/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can delete subjects' });
    }
    
    const subject = await SemesterSubject.findByIdAndDelete(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// ----------------------------------------------------- Exam Timetable Management -----------------------------------------------------------------

// Create/Update exam timetable (teachers only)
app.post('/api/exam-timetables', authenticateToken, async (req, res) => {
  try {
    const { batch_year, department, semester, exams } = req.body;
    
    // Verify user is a teacher
    const user = await User.findById(req.userId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create exam timetables' });
    }
    
    // Validate required fields
    if (!batch_year || !department || !semester || !exams || !Array.isArray(exams)) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if exam timetable already exists
    const existingTimetable = await ExamTimetable.findOne({ batch_year, department, semester });
    
    if (existingTimetable) {
      // Update existing timetable
      existingTimetable.exams = exams;
      existingTimetable.uploaded_by = req.userId;
      existingTimetable.updatedAt = new Date();
      await existingTimetable.save();
      
      const populated = await ExamTimetable.findById(existingTimetable._id)
        .populate('exams.subject_id')
        .populate('uploaded_by', 'name email');
      
      return res.json({
        message: 'Exam timetable updated successfully',
        timetable: populated
      });
    }
    
    // Create new exam timetable
    const timetable = new ExamTimetable({
      batch_year,
      department,
      semester,
      exams,
      uploaded_by: req.userId
    });
    
    await timetable.save();
    
    const populated = await ExamTimetable.findById(timetable._id)
      .populate('exams.subject_id')
      .populate('uploaded_by', 'name email');
    
    res.status(201).json({
      message: 'Exam timetable created successfully',
      timetable: populated
    });
  } catch (err) {
    console.error('Exam timetable creation error:', err);
    res.status(500).json({ error: 'Failed to create exam timetable' });
  }
});

// Get exam timetable by filters
app.get('/api/exam-timetables', authenticateToken, async (req, res) => {
  try {
    const { batch_year, department, semester } = req.query;
    
    const query = {};
    if (batch_year) query.batch_year = parseInt(batch_year);
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    
    const timetables = await ExamTimetable.find(query)
      .populate('exams.subject_id')
      .populate('uploaded_by', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json(timetables);
  } catch (err) {
    console.error('Fetch exam timetables error:', err);
    res.status(500).json({ error: 'Failed to fetch exam timetables' });
  }
});

// Delete exam timetable (teachers only)
app.delete('/api/exam-timetables/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can delete exam timetables' });
    }
    
    const timetable = await ExamTimetable.findByIdAndDelete(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({ error: 'Exam timetable not found' });
    }
    
    res.json({ message: 'Exam timetable deleted successfully' });
  } catch (err) {
    console.error('Delete exam timetable error:', err);
    res.status(500).json({ error: 'Failed to delete exam timetable' });
  }
});

// ----------------------------------------------------- API Listener -----------------------------------------------------------------

// ============================================ GROUP CHAT ROUTES ============================================

// Get all group chats for current user
app.get('/api/group-chats', authenticateToken, async (req, res) => {
  try {
    // Get groups where user is a member or creator
    const groups = await GroupChat.find({
      $or: [
        { members: req.userId },
        { created_by: req.userId },
        { type: 'world' } // Everyone can access World Chat
      ]
    }).populate('created_by', 'name email')
      .populate('club_id', 'name logo')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (err) {
    console.error('Get group chats error:', err);
    res.status(500).json({ error: 'Failed to fetch group chats' });
  }
});

// Create new group chat
app.post('/api/group-chats', authenticateToken, async (req, res) => {
  try {
    const { name, description, type, club_id, members } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    // Validate type
    if (!['custom', 'club'].includes(type)) {
      return res.status(400).json({ error: 'Invalid group type. Use "custom" or "club"' });
    }

    // If club type, validate club_id
    if (type === 'club' && !club_id) {
      return res.status(400).json({ error: 'Club ID is required for club groups' });
    }

    // Create group
    const groupData = {
      name,
      description: description || '',
      type,
      created_by: req.userId,
      members: [req.userId, ...(members || [])] // Add creator and selected members
    };

    if (type === 'club') {
      groupData.club_id = club_id;
    }

    const group = new GroupChat(groupData);
    await group.save();

    // Populate before sending response
    await group.populate('created_by', 'name email');
    if (type === 'club') {
      await group.populate('club_id', 'name logo');
    }

    res.status(201).json(group);
  } catch (err) {
    console.error('Create group chat error:', err);
    res.status(500).json({ error: 'Failed to create group chat' });
  }
});

// Get messages for a group
app.get('/api/group-chats/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if group exists
    const group = await GroupChat.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user has access (member, creator, or world chat)
    const hasAccess = group.type === 'world' || 
                     group.members.includes(req.userId) || 
                     (group.created_by && group.created_by.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages
    const messages = await GroupMessage.find({ group_id: groupId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 })
      .limit(500); // Limit to last 500 messages

    res.json(messages);
  } catch (err) {
    console.error('Get group messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message to group
app.post('/api/group-chats/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if group exists
    const group = await GroupChat.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user has access
    const hasAccess = group.type === 'world' || 
                     group.members.includes(req.userId) || 
                     (group.created_by && group.created_by.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message
    const groupMessage = new GroupMessage({
      group_id: groupId,
      sender: req.userId,
      message: message.trim()
    });

    await groupMessage.save();
    await groupMessage.populate('sender', 'name email');

    res.status(201).json(groupMessage);
  } catch (err) {
    console.error('Send group message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get group members
app.get('/api/group-chats/:groupId/members', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if group exists
    const group = await GroupChat.findById(groupId)
      .populate('members', 'name email role department')
      .populate('created_by', 'name email role department');
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user has access
    const hasAccess = group.type === 'world' || 
                     group.members.some(m => m._id.toString() === req.userId) || 
                     (group.created_by && group.created_by._id.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Return all members including creator
    let allMembers = [...group.members];
    if (group.created_by && !allMembers.find(m => m._id.toString() === group.created_by._id.toString())) {
      allMembers.push(group.created_by);
    }

    res.json(allMembers);
  } catch (err) {
    console.error('Get group members error:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Add members to group
app.post('/api/group-chats/:groupId/members', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;

    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'Members array is required' });
    }

    // Check if group exists
    const group = await GroupChat.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Only creator can add members (or make this more flexible)
    if (group.created_by && group.created_by.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only group creator can add members' });
    }

    // Add new members (avoid duplicates)
    const newMembers = members.filter(m => !group.members.includes(m));
    group.members.push(...newMembers);
    await group.save();

    res.json({ message: 'Members added successfully', group });
  } catch (err) {
    console.error('Add members error:', err);
    res.status(500).json({ error: 'Failed to add members' });
  }
});

// Remove member from group
app.delete('/api/group-chats/:groupId/members/:memberId', authenticateToken, async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    // Check if group exists
    const group = await GroupChat.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Only creator can remove members
    if (group.created_by && group.created_by.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only group creator can remove members' });
    }

    // Cannot remove creator
    if (group.created_by && group.created_by.toString() === memberId) {
      return res.status(400).json({ error: 'Cannot remove group creator' });
    }

    // Remove member
    group.members = group.members.filter(m => m.toString() !== memberId);
    await group.save();

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Search users by name or email
app.get('/api/users/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Search by name or email (case-insensitive)
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name email role department')
    .limit(10);

    res.json(users);
  } catch (err) {
    console.error('User search error:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Initialize World Chat on server start
const createWorldChat = async () => {
  try {
    const existing = await GroupChat.findOne({ type: 'world' });
    if (!existing) {
      await GroupChat.create({
        name: 'World Chat',
        description: 'Public chat for everyone in the campus',
        type: 'world',
        created_by: null,
        members: []
      });
      console.log('World Chat created successfully');
    }
  } catch (err) {
    console.error('Error creating World Chat:', err);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await createWorldChat();
});