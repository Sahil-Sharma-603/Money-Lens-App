const express = require('express');
const User = require('./../models/User.model');

const router = express.Router();

// Create a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, lastName, email } = req.body;  // Include lastName, remove age

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({ name, lastName, email });
    await user.save();

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();  // Fetch all users from MongoDB
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test route to check if the backend is running
router.get('/hello', async (req, res) => {
  try {
    res.send('Hello world from backend');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
