
import request from 'supertest';
import express from 'express';
import * as db from './testdb';
import userRoutes from '../../backend/routes/userRoutes';
import User from '../../backend/models/User.model';

const app = express();
app.use(express.json());
app.use('/api', userRoutes);

describe("UserRoutes Integration test", () => {
  beforeAll(async () => {
    await db.connect();
  }, 10000);

  afterEach(async () => {
    await db.clearDatabase();
  }, 10000);

  afterAll(async () => {
    await db.closeDatabase();
  }, 10000);

  const testUser = {
    firstName: "TestUser1",
    lastName: "lastname",
    email: "test@gmail.com",
    firebaseUid: "18y8y28egbdiq"
  };

  test("POST /signup - should create a new user", async () => {
    const response = await request(app).post('/api/signup').send(testUser);
    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(testUser.email);
  });

  test("POST /signup - should NOT allow duplicate emails", async () => {
    // First signup
    await request(app).post('/api/signup').send(testUser);

    // Second signup with same email
    const response = await request(app).post('/api/signup').send(testUser);
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/already exists/i);
  });

  test("POST /signup - should return 500 if missing fields", async () => {
    const badUser = {
      firstName: "MissingStuff",
      email: "bad@example.com"
      // Missing lastName and firebaseUid
    };

    const response = await request(app).post('/api/signup').send(badUser);
    expect(response.status).toBe(500);
    expect(response.body.message).toBeDefined();
  });

  test("GET / (users list) - should return empty initially", async () => {
    const response = await request(app).get('/api/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("GET / - should return all users after signup", async () => {
    await request(app).post('/api/signup').send(testUser);

    const response = await request(app).get('/api/');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].email).toBe(testUser.email);
  });
});
