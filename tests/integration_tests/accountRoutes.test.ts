// Import Jest types
import { describe, test, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import * as db from './testdb';
import accountRoutes from '../../backend/routes/accountRoutes';
import User from '../../backend/models/User.model';
import Account from '../../backend/models/Account.model';
import { Transaction } from '../../backend/models/Transaction.model';
import jwt from 'jsonwebtoken';
process.env.JWT_SECRET = 'test_jwt_secret';

const app = express();
app.use(express.json());
app.use('/api/accounts', accountRoutes);

const createToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
};

describe('Account Routes Integration Test', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    await db.connect();

    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'account@example.com',
      firebaseUid: 'uid_account_test',
    });

    userId = user._id.toString();
    token = createToken(userId);
  });

  afterEach(async () => {
    await db.clearDatabase();
  });

  afterAll(async () => {
    await db.closeDatabase();
  });

  test('POST /api/accounts - create new account', async () => {
    const res = await request(app)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Savings',
        type: 'savings',
        balance: 1000,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.account.name).toBe('Savings');
  });

  test('GET /api/accounts - fetch user accounts', async () => {
    await Account.create({
      user_id: userId,
      name: 'Checking',
      type: 'checking',
    });

    const res = await request(app)
      .get('/api/accounts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accounts.length).toBe(1);
    expect(res.body.accounts[0].name).toBe('Checking');
  });

  test('GET /api/accounts/:id - get specific account', async () => {
    const account = await Account.create({
      user_id: userId,
      name: 'Investment',
      type: 'investment',
    });

    const res = await request(app)
      .get(`/api/accounts/${account._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.account.name).toBe('Investment');
  });

  test('PUT /api/accounts/:id - update account details', async () => {
    const account = await Account.create({
      user_id: userId,
      name: 'ToUpdate',
      type: 'other',
    });

    const res = await request(app)
      .put(`/api/accounts/${account._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'UpdatedName',
        balance: 500,
      });

    expect(res.status).toBe(200);
    expect(res.body.account.name).toBe('UpdatedName');
    expect(res.body.account.balance).toBe(500);
  });

  test('DELETE /api/accounts/:id - delete account and transactions', async () => {
    const account = await Account.create({
      user_id: userId,
      name: 'DeleteMe',
      type: 'checking',
    });

    await Transaction.create({
      user_id: userId,
      account_id: account._id,
      name: 'Test Transaction',
      amount: 50,
      date: new Date().toISOString(),
      category: ['Test'],
      transaction_type: 'place',
      transaction_id: 'txn_delete_1',
      iso_currency_code: 'USD',
    });

    const res = await request(app)
      .delete(`/api/accounts/${account._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const txns = await Transaction.find({ account_id: account._id });
    expect(txns.length).toBe(0);
  });
});
