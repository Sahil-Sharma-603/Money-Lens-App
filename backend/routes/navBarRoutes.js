const express = require('express'); 
const router = express.Router(); 


// get /dashboard
router.get('/dashboard', async (req, res) => {
    try {
      res.send('/dashboard');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// get /transactions
router.get('/transactions', async (req, res) => {
    try {
      res.send('/transactions');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// get /analytics
router.get('/analytics', async (req, res) => {
    try {
      res.send('/analytics');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// get /goals
router.get('/goals', async (req, res) => {
    try {
      res.send('/goals');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


// get /settings
router.get('/settings', async (req, res) => {
    try {
      res.send('/settings');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });



  // get /profile
router.get('/profile', async (req, res) => {
    try {
      res.send('/profile');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


module.exports = router;