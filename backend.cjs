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
  members: { type: Array, default: [] }, // Array of { userId, role }
  moderators: { type: Array, default: [] }, // Array of { userId, type: 'teacher' | 'student' }
  works_done: { type: Array, default: [] },
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
  image: { type: String, required: true }, // Supabase Storage URL
  additional_images: { type: Array, default: [] }, // Array of URLs
  hashtag: { type: String, required: true }, // #type_eventName_startDate_endDate
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0 },
  liked_by: { type: Array, default: [] }, // user IDs
  comments: { type: Array, default: [] }, // Array of { id, content, userId, userName, createdAt }
  registration_enabled: { type: Boolean, default: false },
  registration_fields: { type: Array, default: [] },
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

const Schema = new mongoose.Schema({
  sem: String,
  dept: String,
  subjects: [[String, Number]]
}, { collection: 'cgpa' }); // specify the collection name

// Define model
const CgpaModel = mongoose.model('Cgpa', Schema);



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

// Get first 10 files
app.get('/api/materials', authenticateToken, async (req, res) => {
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
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
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

    // Increment target user's followers count
    await User.findByIdAndUpdate(targetUserId, {
      $inc: { followers: 1 }
    });

    res.json({ message: 'Followed successfully' });
  } catch (err) {
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

    // Decrement target user's followers count
    await User.findByIdAndUpdate(targetUserId, {
      $inc: { followers: -1 }
    });

    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
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

// Middleware to check if user is admin
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

// Update club (moderators only)
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

    // Check if user is a moderator
    const isModerator = club.moderators.some(
      mod => mod.userId.toString() === req.userId
    );

    if (!isModerator) {
      return res.status(403).json({ error: 'Only club moderators can edit this club' });
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

// ----------------------------------------------------- API Listener -----------------------------------------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));