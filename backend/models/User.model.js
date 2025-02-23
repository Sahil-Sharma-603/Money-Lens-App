const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: false },
  firebaseUid: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  // Plaid-related fields
  plaidAccessToken: { type: String },
  plaidItemId: { type: String },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
