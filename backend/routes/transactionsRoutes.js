const express = require('express');
const moment = require('moment');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { Transaction, saveTransaction } = require('../models/transaction.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept only csv files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

/**
 * @route GET /api/transactions/stored
 * @description Get stored transactions with optional date range filtering and search
 * @access Private
 */
router.get('/stored', auth, async (req, res) => {
  try {
    const { fromDate, toDate, search } = req.query;
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

    // Add search functionality if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i'); // 'i' for case-insensitive
      query.$or = [{ merchant_name: searchRegex }, { name: searchRegex }];
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

/**
 * @route POST /api/transactions/import-csv
 * @description Import transactions from a CSV file with column mapping
 * @access Private
 */
router.post('/import-csv', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      error: 'No file uploaded' 
    });
  }

  try {
    const filePath = req.file.path;
    const mapping = req.body.mapping || {};
    
    // Validate required mappings
    const requiredFields = ['date', 'amount', 'name', 'category'];
    const missingFields = requiredFields.filter(field => !mapping[field]);
    
    if (missingFields.length > 0) {
      // Delete the uploaded file
      fs.unlinkSync(filePath);
      
      return res.status(400).json({
        success: false,
        error: `Missing required column mappings: ${missingFields.join(', ')}`
      });
    }
    
    // Read and parse CSV file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 1) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        error: 'CSV file is empty or invalid'
      });
    }
    
    // Process all rows as data (no header)
    const dataRows = lines;
    
    const results = [];
    const errors = [];
    let importedCount = 0;
    
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i].split(',').map(cell => cell.trim());
        
        // Skip empty rows
        if (row.length <= 1) continue;
        
        // Map CSV columns to transaction model fields based on user selection
        const dateValue = row[mapping.date];
        const amountValue = row[mapping.amount].replace(/[$,]/g, ''); // Remove $ and commas
        const nameValue = row[mapping.name];
        const categoryValue = row[mapping.category];
        
        // Parse values
        const amount = parseFloat(amountValue);
        
        // Generate a transaction object
        const transaction = {
          user_id: req.user._id,
          account_id: 'csv-import', // Default account ID for imported transactions
          amount: isNaN(amount) ? 0 : amount,
          date: moment(dateValue).isValid() ? 
            moment(dateValue).format('YYYY-MM-DD') : 
            moment().format('YYYY-MM-DD'),
          name: nameValue || 'Unnamed Transaction',
          category: categoryValue ? [categoryValue] : ['Uncategorized'],
          transaction_id: `csv-${uuidv4()}`, // Generate a unique ID
          iso_currency_code: 'USD', // Default currency
          transaction_type: (amount < 0) ? 'DEBIT' : 'CREDIT',
        };
        
        // Save transaction using the existing helper function
        const savedTransaction = await saveTransaction(transaction, req.user._id);
        
        if (savedTransaction) {
          importedCount++;
          results.push(savedTransaction);
        }
      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        errors.push({
          row: i + 1,
          error: error.message
        });
      }
    }
    
    // Delete the uploaded file
    fs.unlinkSync(filePath);
    
    // Return results
    res.json({
      success: true,
      count: importedCount,
      errors: errors.length,
      errorDetails: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('CSV import error:', error);
    
    // Make sure to clean up the file if there's an error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to process CSV file: ' + error.message
    });
  }
});

module.exports = router;