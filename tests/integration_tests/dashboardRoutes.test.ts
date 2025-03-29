
// Import Jest types
import { describe, test, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import * as db from './testdb';
import dashboardRoutes from '../../backend/routes/dashboardRoutes';
import User from '../../backend/models/User.model';
import { Transaction } from '../../backend/models/Transaction.model';
process.env.JWT_SECRET = 'test_jwt_secret';
const mongoose = require('../../backend/models/User.model').model('User').base;

// Setup test app
const app = express();
app.use(express.json());
app.use('/api', dashboardRoutes);

describe('Dashboard Integration Test', () => {
  let userId: string;
  let token: string;

  const createToken = (id: string) =>
    jwt.sign({ userId: id },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );

  beforeAll(async () => {
    await db.connect();
  },10000);

  afterEach(async () => {
    await db.clearDatabase();
  },10000);

  afterAll(async () => {
    await db.closeDatabase();
  },10000);

  test('should return dashboard data for valid user and token', async () => {
    // Create a user
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      firebaseUid: 'uid123',
    });

    userId = user._id.toString();
    token = createToken(userId);

    // Create valid ObjectId for account_id
    const fakeAccountId = new mongoose.Types.ObjectId();

    await Transaction.create([
      {
        user_id: userId,
        name: 'Coffee',
        amount: 4.5,
        date: new Date().toISOString().split('T')[0],
        category: ['Food', 'Coffee'],
        transaction_type: 'place',
        transaction_id: 'txn_001',
        iso_currency_code: 'USD',
        account_id: fakeAccountId,
      },
      {
        user_id: userId,
        name: 'Freelance',
        amount: -200,
        date: new Date().toISOString().split('T')[0],
        category: ['Income', 'Freelance'],
        transaction_type: 'digital',
        transaction_id: 'txn_002',
        iso_currency_code: 'USD',
        account_id: fakeAccountId,
      },
    ]);

    const response = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
    expect(response.body).toHaveProperty('monthlySpending');
    expect(response.body).toHaveProperty('weeklySpending');
    expect(response.body).toHaveProperty('todaySpending');
    expect(response.body).toHaveProperty('recentTransactions');
    expect(response.body).toHaveProperty('thisMonth');
    expect(response.body).toHaveProperty('monthAvg');
    expect(response.body).toHaveProperty('dailyAvg');
  });

  test('should return 404 if user not found', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const fakeToken = createToken(fakeId);

    const response = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toMatch(/user not found/i);
  });

  test('should return 401 if no token provided', async () => {
    const response = await request(app).get('/api/dashboard');
    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/authentication token missing/i);
  });

  test('should return 401 for invalid token', async () => {
    const response = await request(app)
      .get('/api/dashboard')
      .set('Authorization', 'Bearer badtoken');

    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/invalid authentication token/i);
  });
});
