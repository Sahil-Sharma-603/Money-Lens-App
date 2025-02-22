const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: {type: String, required: true},
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: false },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
