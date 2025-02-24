const express = require('express'); 

const router = express.Router(); 


// get /dashboard
router.get('/dashboard', auth, async (req, res) => {
    try {
      res.render('/dashboard');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// get /transactions
router.get('/transactions', auth,  async (req, res) => {
    try {
      res.render('/transactions');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// get /analytics
router.get('/analytics', auth, async (req, res) => {
    try {
      res.send('/analytics');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// get /goals
router.get('/goals', auth, async (req, res) => {
    try {
      res.send('/goals');
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


module.exports = router;