const request = require('supertest');
const express = require('express');
const User = require('../../backend/models/User.model');
const userRoutes = require('../../backend/routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

jest.mock('../../backend/models/User.model');


describe('User Signup API Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    const newUser = {
      firstName: 'testuserfirstName',
      lastName: 'testuserLastName',
      email: 'testUser2@gmail.com',
      firebaseUid: 'firebase-uid-123',
    };

    User.findOne.mockResolvedValue(null);
    User.prototype.save.mockResolvedValue(newUser);

    const response = await request(app)
      .post('/api/users/signup')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    
  });

  it('should not create a user with an existing email', async () => {
    const existingUser = {
      _id: '1',
      firstName: 'testuserfirstName',
      lastName:  'testuserLastName',
      email: 'testUser2@gmail.com',
      firebaseUid: 'firebase-uid-456',
    };

    User.findOne.mockResolvedValue(existingUser);

    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      firebaseUid: 'firebase-uid-123',
    };

    const response = await request(app)
      .post('/api/users/signup')
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User with this email already exists');
  });

  it('should handle errors during signup', async () => {
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      // Missing email and firebaseUid
    };

    User.prototype.save.mockImplementation(() => {
      throw new Error('Test error');
    });

    const response = await request(app)
      .post('/api/users/signup')
      .send(newUser);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Test error');
  });
}); // end of describe


describe('GET /api/users', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should fetch all users successfully', async () => {
      const users = [
        { _id: '1', firstName: 'Sahil', lastName: 'Sharma', email: 'SahilSharma@example.com' },
        { _id: '2', firstName: 'test', lastName: 'user', email: 'testuser@example.com' },
      ];
  
      User.find.mockResolvedValue(users);
  
      const response = await request(app).get('/api/users');
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(users);
    });
  
    it('should handle errors when fetching users', async () => { User.find.mockImplementation(() => {
        throw new Error('Test error');
      });
  
      const response = await request(app).get('/api/users');
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Test error');
    });
  }); // end of describe

