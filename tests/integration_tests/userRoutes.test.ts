import request from 'supertest';
import express from 'express'; 
import * as db from '../testdb';
import userRoutes from '../../backend/routes/userRoutes';

// import express = require('express'); 
let server: any;
const app = express();
app.use(express.json());
app.use("/api", userRoutes);

beforeAll(async () => {
    await db.connect(); 
    server = app.listen(); 
});

afterEach(async () => {
    await db.clearDatabase(); 
});

afterAll(async () => {
    await db.closeDatabase(); 
    server.close(); 
});

describe("UserRoutes API Integration Tests", () => {
  describe('GET /hello', () => {
    it('should return "Hello world from backend"', async () => {
      const response = await request(app).get('/api/hello');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world from backend');
    });
  });

  describe('POST /signup', () => {
    it('should create a new user if email does not exist', async () => {
      const newUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        firebaseUid: 'firebase123'
      };

      const response = await request(app)
        .post('/api/signup')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user.email).toBe(newUser.email);
    });
  });
});
