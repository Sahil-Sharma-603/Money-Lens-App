const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  currentAmount: {
    type: Number,
    required: true,
    default: 0
  },
  targetDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: function() {
      return this.type === 'Savings';
    }
  },
  type: {
    type: String,
    enum: ['Savings', 'Spending Limit'],
    default: 'Savings'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);

module.exports = Goal;