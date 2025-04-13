const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB using MONGO_URL from .env
mongoose.connect(process.env.MONGOURL, {}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define schema
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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
