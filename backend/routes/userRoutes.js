const express = require('express');
const User = require('./../models/User.model');

const router = express.Router();

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const user = new User({ name, email, age });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    res.send('Hello world');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/hello', async (req, res) => {
  try {
    res.send('Hello world from backend');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
