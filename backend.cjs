const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGOURL, {}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// User Schema matching your format
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
  createdAt: { type: Date, default: Date.now }
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

// Middleware to verify JWT
const authenticate = (req, res, next) => {
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

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, name, email, password, phone_number, dept, section, year } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all fields
    const user = new User({
      username,
      name,
      email,
      password: hashedPassword,
      phone_number,
      dept,
      section,
      year,
      role: 'user',
      credit: 1000
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

// Get user profile
app.get('/api/user/:id', authenticate, async (req, res) => {
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

// Follow user
app.post('/api/follow/:id', authenticate, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Get current user
    const currentUser = await User.findById(req.userId);
    
    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to following list
    await User.findByIdAndUpdate(req.userId, {
      $push: { following: req.params.id }
    });

    // Add to target user's followers count
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { followers: 1 }
    });

    res.json({ message: 'Followed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Search users
app.get('/api/search', authenticate, async (req, res) => {
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

app.get('/api/chat/:userId', authenticate, async (req, res) => {
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
app.post('/api/chat/:chatId/message', authenticate, async (req, res) => {
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
app.get('/api/chat/:chatId/messages', authenticate, async (req, res) => {
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
app.get('/api/chats', authenticate, async (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));