const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: [0, 'Target amount cannot be negative']
  },
  currentAmount: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Current amount cannot be negative'],
    validate: {
      validator: function(v) {
        return v <= this.targetAmount;
      },
      message: 'Current amount cannot exceed target amount'
    }
  },
  targetDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Target date must be in the future'
    }
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