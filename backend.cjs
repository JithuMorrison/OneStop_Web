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
  role: { type: String, default: 'user' },
  dob: { type: String, default: '' },
  credit: { type: Number, default: 1000 },
  events: { type: Array, default: [] },
  dept: { type: String },
  section: { type: String },
  year: { type: String },
  favblog: { type: Array, default: [] },
  favmat: { type: Array, default: [] },
  titles: { type: Array, default: [] },
  followers: { type: Number, default: 0 },
  following: { type: Array, default: [] },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resetPasswordOTP: String,
  resetPasswordExpires: Date
});

const User = mongoose.model('User', UserSchema);

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

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, name, email, password, phone_number, dept, section, year, role = 'student' } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Only admin can create teacher accounts
    if (role === 'teacher' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to create teacher account' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      name,
      email,
      password: hashedPassword,
      phone_number,
      dept,
      section,
      year,
      role,
      credit: role === 'student' ? 1000 : 0
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
        dept,
        section,
        year,
        role: user.role,
        credit: user.credit
      } 
    });
  } catch (err) {
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
        credit: user.credit
      } 
    });
  } catch (err) {
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

// ----------------------------------------------------- API Listener -----------------------------------------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));