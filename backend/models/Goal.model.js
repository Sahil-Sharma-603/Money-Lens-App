
const mongoose = require('mongoose');

const subGoalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  }
}, { timestamps: true });

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
    trim: true,
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
    required: function(){return this.type === 'Savings';},

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
  accountId: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
  // New fields to match GoalForm.tsx:
  selectedAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  limitAmount: {
    type: Number,
    default: 0
  },
  interval: {
    type: String,
    enum: ['Date', 'Daily', 'Weekly', 'Monthly', 'Annually'],
    default: 'Date'
  },
  // Instead of savingSubGoals with a nested structure, use a flat array
  subGoals: [subGoalSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);

//my version
const SubSavingGoal = mongoose.models.SubSavingGoal || mongoose.model('SubSavingGoal', subGoalSchema);
module.exports = {Goal, SubSavingGoal}; 

//Sahil's version
// module.exports = { Goal };

