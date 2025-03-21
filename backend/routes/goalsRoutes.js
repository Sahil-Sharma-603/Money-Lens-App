const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth.middleware');
const Goal = require('../models/Goal');

// Test endpoint - no auth required
router.get('/test', (req, res) => {
  res.json({ message: 'Goals API is working!' });
});

// Debug endpoint to check auth - auth required
router.get('/auth-check', auth, (req, res) => {
  res.json({
    message: 'Auth is working correctly',
    user: req.user
  });
});

// POST create a new goal - temporary test version without auth
router.post('/test-create', async (req, res) => {
  try {
    console.log('POST test-create endpoint hit');
    console.log('Request body:', req.body);
    
    // Use a test user ID - replace with a valid ObjectId from your database
    const testUserId = req.headers['x-test-user-id'] || '65fc123456789abcdef12345';
    
    if (!mongoose.Types.ObjectId.isValid(testUserId)) {
      return res.status(400).json({ error: 'Invalid test user ID format' });
    }
    
    const { title, description, targetAmount, currentAmount, targetDate, category, type } = req.body;
    
    const newGoal = new Goal({
      title: title || 'Test Goal',
      description: description || 'Test Description',
      targetAmount: Number(targetAmount) || 1000,
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      targetDate: targetDate || new Date(),
      category: type === 'Savings' ? (category || 'Test') : undefined,
      type: type || 'Savings',
      userId: testUserId
    });
    
    console.log('Goal to be saved:', newGoal);
    
    const savedGoal = await newGoal.save();
    console.log('Goal saved successfully with ID:', savedGoal._id);
    
    res.status(201).json({
      id: savedGoal._id.toString(),
      title: savedGoal.title,
      description: savedGoal.description,
      targetAmount: savedGoal.targetAmount,
      currentAmount: savedGoal.currentAmount,
      targetDate: savedGoal.targetDate,
      category: savedGoal.category,
      type: savedGoal.type,
      createdAt: savedGoal.createdAt
    });
  } catch (error) {
    console.error('Error in test-create:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

// GET all goals for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Goals GET request received');
    console.log('User ID from token:', req.user?.id);
    
    const goals = await Goal.find({ userId: req.user._id });
    
    console.log(`Found ${goals.length} goals for user`);
    
    // Transform _id to id for frontend compatibility
    const transformedGoals = goals.map(goal => ({
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
      category: goal.category,
      type: goal.type,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt
    }));
    
    res.json(transformedGoals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// POST create a new goal
router.post('/', auth, async (req, res) => {
  try {
    console.log('POST request to create goal received');
    console.log('Request body:', req.body);
    console.log('User object from auth:', req.user);
    
    // Validate that all required fields are present
    const { title, description, targetAmount, currentAmount, targetDate, category, type } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!targetAmount) {
      return res.status(400).json({ error: 'Target amount is required' });
    }
    
    if (!targetDate) {
      return res.status(400).json({ error: 'Target date is required' });
    }
    
    if (type === 'Savings' && !category) {
      return res.status(400).json({ error: 'Category is required for savings goals' });
    }
    
    if (!req.user || !req.user._id) {
      return res.status(400).json({ error: 'User ID is missing from authentication' });
    }
    
    // Create the new goal
    const newGoal = new Goal({
      title,
      description: description || '',
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      targetDate: new Date(targetDate),
      category: type === 'Savings' ? category : undefined,
      type: type || 'Savings',
      userId: req.user._id,
      createdAt: new Date()
    });
    
    console.log('Goal to be saved:', {
      title: newGoal.title,
      targetAmount: newGoal.targetAmount,
      type: newGoal.type,
      category: newGoal.category,
      userId: newGoal.userId
    });
    
    // Save to database
    const savedGoal = await newGoal.save();
    console.log('Goal saved successfully with ID:', savedGoal._id);
    
    // Return the created goal
    res.status(201).json({
      id: savedGoal._id.toString(),
      title: savedGoal.title,
      description: savedGoal.description,
      targetAmount: savedGoal.targetAmount,
      currentAmount: savedGoal.currentAmount,
      targetDate: savedGoal.targetDate,
      category: savedGoal.category,
      type: savedGoal.type,
      createdAt: savedGoal.createdAt
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET a specific goal
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ 
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json({
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
      category: goal.category,
      type: goal.type,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// PUT update a goal
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, targetAmount, currentAmount, targetDate, category, type } = req.body;
    
    // Build update object with only provided fields
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (targetAmount) updateFields.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) updateFields.currentAmount = Number(currentAmount);
    if (targetDate) updateFields.targetDate = new Date(targetDate);
    if (type) {
      updateFields.type = type;
      // Only update category if it's a savings goal
      if (type === 'Savings' && category) {
        updateFields.category = category;
      } else if (type === 'Spending Limit') {
        updateFields.category = undefined;
      }
    }
    updateFields.updatedAt = new Date();
    
    // Find and update the goal
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateFields,
      { new: true, runValidators: true } // Return updated document and run validators
    );
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found or you do not have permission' });
    }
    
    res.json({
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
      category: goal.category,
      type: goal.type,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// DELETE a goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found or you do not have permission' });
    }
    
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// PATCH add money to a goal
router.patch('/:id/add-money', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        $inc: { currentAmount: Number(amount) },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found or you do not have permission' });
    }
    
    res.json({
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: goal.targetDate,
      category: goal.category,
      type: goal.type,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt
    });
  } catch (error) {
    console.error('Error adding money to goal:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;