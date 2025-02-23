const express = require('express');
const moment = require('moment');
const { Transaction } = require('../models/transaction.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/transactions/stored
 * @description Get stored transactions with optional date range filtering
 * @access Private
 */
router.get('/stored', auth, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const userId = req.user._id;

    // Build query object
    const query = {
      user_id: userId,
    };

    // Add date range if provided
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) {
        query.date.$gte = moment(fromDate).format('YYYY-MM-DD');
      }
      if (toDate) {
        query.date.$lte = moment(toDate).format('YYYY-MM-DD');
      }
    }

    // Fetch transactions
    const transactions = await Transaction.find(query)
      .sort({ date: -1 }) // Sort by date descending (newest first)
      .exec();

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Error fetching stored transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching transactions',
    });
  }
});

module.exports = router;
