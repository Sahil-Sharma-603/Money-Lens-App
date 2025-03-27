const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'checking',
      'savings',
      'credit',
      'loan',
      'investment',
      'cash',
      'other',
      'plaid',
    ],
  },
  balance: {
    type: Number,
    default: 0,
  },
  initial_balance: {
    type: Number,
    default: 0,
  },
  balance_date: {
    type: Date,
    default: Date.now,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  institution: {
    type: String,
    default: '',
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  // Fields for Plaid accounts
  plaid_account_id: {
    type: String,
    // No index here, defined it with schema.index() below
  },
  plaid_item_id: {
    type: String,
  },
  plaid_mask: {
    type: String,
  },
  plaid_subtype: {
    type: String,
  },
});

// Add a unique compound index for user_id and name
accountSchema.index({ user_id: 1, name: 1 }, { unique: true });

// Add a unique index for plaid_account_id if it exists
accountSchema.index({ plaid_account_id: 1 }, { unique: true, sparse: true });

// Update the 'updated_at' field on save
accountSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Method to update account balance based on transactions
accountSchema.methods.updateBalance = async function (amount) {
  this.balance += amount;
  this.updated_at = Date.now();
  return this.save();
};

// Method to set an initial balance for an account
accountSchema.methods.setInitialBalance = async function (initialBalance) {
  this.initial_balance = initialBalance;
  this.balance = initialBalance;
  this.balance_date = Date.now();
  this.updated_at = Date.now();
  return this.save();
};

// Create the Account model
const Account =
  mongoose.models.Account || mongoose.model('Account', accountSchema);

module.exports = Account;
