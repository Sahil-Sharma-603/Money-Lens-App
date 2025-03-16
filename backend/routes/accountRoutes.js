const express = require('express');
const mongoose = require('mongoose');
const Account = require('../models/Account.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/accounts
 * @description Get all accounts for the authenticated user
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ user_id: req.user._id });
    res.json({
      success: true,
      count: accounts.length,
      accounts,
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching accounts',
    });
  }
});

/**
 * @route POST /api/accounts
 * @description Create a new account
 * @access Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, balance, currency, institution } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required fields',
      });
    }

    // Check for duplicate account name for this user
    const existingAccount = await Account.findOne({
      user_id: req.user._id,
      name: name,
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        error: 'An account with this name already exists',
      });
    }

    // Create the new account
    const account = new Account({
      user_id: req.user._id,
      name,
      type,
      balance: balance || 0,
      currency: currency || 'USD',
      institution: institution || '',
    });

    await account.save();

    res.status(201).json({
      success: true,
      account,
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating account',
    });
  }
});

/**
 * DELETE all plaid accounts for the authenticated user.
 * This route must come BEFORE the "/:id" route.
 * @route DELETE /api/accounts/plaid
 * @access Private
 */
router.delete('/plaid', auth, async (req, res) => {
  try {
    await Account.deleteMany({ user_id: req.user._id, type: 'plaid' });
    res.json({
      success: true,
      message: 'All plaid accounts deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting plaid accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting plaid accounts',
    });
  }
});

/**
 * @route GET /api/accounts/:id
 * @description Get a specific account by ID
 * @access Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
      });
    }

    res.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching account',
    });
  }
});

/**
 * @route PUT /api/accounts/:id
 * @description Update an account
 * @access Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, balance, currency, institution, is_active } = req.body;

    // Find the account and make sure it belongs to the user
    const account = await Account.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found or access denied',
      });
    }

    // Update fields if provided
    if (name) account.name = name;
    if (type) account.type = type;
    if (balance !== undefined) account.balance = balance;
    if (currency) account.currency = currency;
    if (institution) account.institution = institution;
    if (is_active !== undefined) account.is_active = is_active;

    await account.save();

    res.json({
      success: true,
      account,
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error updating account',
    });
  }
});

/**
 * @route DELETE /api/accounts/:id
 * @description Delete an account
 * @access Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found or access denied',
      });
    }

    if (account.type === 'plaid') {
      return res.status(400).json({
        success: false,
        error:
          'Plaid accounts cannot be deleted directly. Please disconnect from Plaid instead.',
      });
    }

    await Account.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting account',
    });
  }
});

module.exports = router;
