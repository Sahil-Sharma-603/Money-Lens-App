const mongoose = require('mongoose');
// const { Transaction } = require('./Transaction.model');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: false },
  firebaseUid: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  // Add these new fields for 2FA
  twoFactorSecret: { type: String, default: null },
  twoFactorEnabled: { type: Boolean, default: false },
  // Plaid-related fields
  plaidAccessToken: { type: String },
  plaidItemId: { type: String },
  // transactions: [ {type: Transaction, ref: 'transactions'} ],
});

const User = mongoose.model('User', userSchema);
module.exports = User;
