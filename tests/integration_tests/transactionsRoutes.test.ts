// Import Jest types
import { describe, it, expect, beforeAll, afterEach, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { connect, clearDatabase, closeDatabase } from './testdb';
import User from '../../backend/models/User.model';
import { Transaction } from '../../backend/models/Transaction.model';
import Account from '../../backend/models/Account.model';
import * as fs from 'fs';
import path from 'path';

// Mock the multer middleware to avoid file system operations
jest.mock('multer', () => {
  return () => ({
    single: () => (req: any, res: any, next: any) => {
      next();
    }
  });
});

// Import the route to test
const transactionsRoutes = require('../../backend/routes/transactionsRoutes');

// Setting up the express app for testing
const app = express();
app.use(express.json());
app.use('/api/transactions', transactionsRoutes);

// Connect to in-memory database before tests
beforeAll(async () => {
  await connect();
  process.env.JWT_SECRET = 'test-jwt-secret';
  
  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(__dirname, '../../backend/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
});

// Clear database after each test
afterEach(async () => {
  await clearDatabase();
});

// Close database after all tests
afterAll(async () => {
  await closeDatabase();
});

// Test user data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  firebaseUid: 'test-firebase-uid'
};

// Helper to create test user and generate auth token
const setupTestUser = async () => {
  const user = new User(testUser);
  await user.save();
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-jwt-secret');
  return { user, token };
};

// Helper to create test account
const setupTestAccount = async (userId: mongoose.Types.ObjectId) => {
  const account = new Account({
    user_id: userId,
    name: 'Test Account',
    type: 'checking',
    balance: 1000,
    currency: 'USD',
    institution: 'Test Bank'
  });
  await account.save();
  return account;
};

// Helper to create test transactions
const setupTestTransactions = async (userId: mongoose.Types.ObjectId, accountId: mongoose.Types.ObjectId, count = 5) => {
  const transactions = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const transaction = new Transaction({
      user_id: userId,
      account_id: accountId,
      amount: i % 2 === 0 ? 100 + i : -(50 + i), // Alternate between positive and negative
      date: date.toISOString().split('T')[0],
      name: `Transaction ${i + 1}`,
      category: [`Category ${(i % 3) + 1}`],
      transaction_id: `test-transaction-${i}`,
      iso_currency_code: 'USD',
      transaction_type: i % 2 === 0 ? 'CREDIT' : 'DEBIT'
    });
    
    transactions.push(transaction);
    await transaction.save();
  }
  
  return transactions;
};

describe('GET /api/transactions/stored', () => {
  it('should return 401 if no auth token provided', async () => {
    const response = await request(app).get('/api/transactions/stored');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authentication token missing');
  });
  
  it('should return 401 if invalid auth token provided', async () => {
    const response = await request(app)
      .get('/api/transactions/stored')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid authentication token');
  });
  
  it('should return user transactions with pagination', async () => {
    const { user, token } = await setupTestUser();
    const account = await setupTestAccount(user._id);
    await setupTestTransactions(user._id, account._id, 10);
    
    const response = await request(app)
      .get('/api/transactions/stored')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(10);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
    expect(response.body.transactions).toHaveLength(10);
  });
  
  it('should filter transactions by date range', async () => {
    const { user, token } = await setupTestUser();
    const account = await setupTestAccount(user._id);
    await setupTestTransactions(user._id, account._id, 10);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const fromDate = yesterday.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];
    
    const response = await request(app)
      .get(`/api/transactions/stored?fromDate=${fromDate}&toDate=${toDate}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.transactions.length).toBeLessThanOrEqual(2);
    
    // Verify all returned transactions are within the date range
    response.body.transactions.forEach((transaction: any) => {
      // Convert strings to Date objects for comparison
      const transactionDate = new Date(transaction.date);
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      
      expect(transactionDate >= fromDateObj).toBeTruthy();
      expect(transactionDate <= toDateObj).toBeTruthy();
    });
  });
});

describe('PUT /api/transactions/:id', () => {
  it('should return 401 if no auth token provided', async () => {
    const response = await request(app).put('/api/transactions/123');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authentication token missing');
  });
  
  it('should return 404 if transaction not found', async () => {
    const { token } = await setupTestUser();
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const response = await request(app)
      .put(`/api/transactions/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Transaction not found or access denied');
  });
  
  it('should successfully update transaction fields', async () => {
    const { user, token } = await setupTestUser();
    const account = await setupTestAccount(user._id);
    const transactions = await setupTestTransactions(user._id, account._id, 1);
    const transaction = transactions[0];
    
    const updateData = {
      name: 'Updated Transaction Name',
      category: ['Updated Category'],
      amount: 999.99,
      date: '2023-03-15'
    };
    
    const response = await request(app)
      .put(`/api/transactions/${transaction._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.transaction.name).toBe(updateData.name);
    expect(response.body.transaction.category).toEqual(updateData.category);
    expect(response.body.transaction.amount).toBe(updateData.amount);
    expect(response.body.transaction.date).toBe(updateData.date);
    expect(response.body.transaction.transaction_type).toBe('CREDIT');
  });
  
  it('should not update transaction fields not included in allowedUpdates', async () => {
    const { user, token } = await setupTestUser();
    const account = await setupTestAccount(user._id);
    const transactions = await setupTestTransactions(user._id, account._id, 1);
    const transaction = transactions[0];
    
    const originalTransactionId = transaction.transaction_id;
    
    const updateData = {
      name: 'Updated Name',
      transaction_id: 'attempted-update-id'
    };
    
    const response = await request(app)
      .put(`/api/transactions/${transaction._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.transaction.name).toBe(updateData.name);
    expect(response.body.transaction.transaction_id).toBe(originalTransactionId);
  });
});

describe('DELETE /api/transactions/:id', () => {
  it('should return 401 if no auth token provided', async () => {
    const response = await request(app).delete('/api/transactions/123');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authentication token missing');
  });
  
  it('should return 404 if transaction not found', async () => {
    const { token } = await setupTestUser();
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const response = await request(app)
      .delete(`/api/transactions/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Transaction not found or access denied');
  });
  
  it('should successfully delete a transaction', async () => {
    const { user, token } = await setupTestUser();
    const account = await setupTestAccount(user._id);
    const transactions = await setupTestTransactions(user._id, account._id, 1);
    const transaction = transactions[0];
    
    const response = await request(app)
      .delete(`/api/transactions/${transaction._id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Transaction deleted successfully');
    
    // Verify transaction is actually deleted from database
    const deletedTransaction = await Transaction.findById(transaction._id);
    expect(deletedTransaction).toBeNull();
  });
});