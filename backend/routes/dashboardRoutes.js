import { getDashboardAccountBalance as balance, getDashboardMonthlySpending as monthly, getDashboardRecentTransactions as recent, getDashboardTodaysSpending as today  } from "..dashboardLogic.js"

const express = require('express'); 

const router = express.Router(); 


// get /dashboard
router.get('/dashboard', auth, async (req, res) => {
    try {
        res.send(balance); 
        res.send(monthly); 
        res.send(recent); 
        res.send(today); 
        res.status(200).json("dashboard ok");
        console.log("dashboard route"); 
        
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