import { describe, test, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import { connect, clearDatabase, closeDatabase } from './testdb';
const User = require('../backend/models/User.model');

// Connect to in-memory database before tests
beforeAll(async () => {
  await connect();
});

// Clear database after each test
afterEach(async () => {
  await clearDatabase();
});

// Close database after all tests
afterAll(async () => {
  await closeDatabase();
});

describe('User Model Test', () => {
  test('should validate required fields', async () => {
    // Create user without required fields
    const userWithoutRequiredFields = new User({
      // Missing firstName, lastName, email, and firebaseUid
    });

    // Validate should fail
    await expect(userWithoutRequiredFields.validate()).rejects.toThrow();
  });

  test('should create & save user successfully', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      firebaseUid: 'firebase123',
    };

    const validUser = new User(userData);
    const savedUser = await validUser.save();
    
    // Check if saved user has all required data
    expect(savedUser._id).toBeDefined();
    expect(savedUser.firstName).toBe(userData.firstName);
    expect(savedUser.lastName).toBe(userData.lastName);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.firebaseUid).toBe(userData.firebaseUid);
    expect(savedUser.createdAt).toBeDefined();
  });

  test('should fail due to duplicate email', async () => {
    // First user with unique email
    const userData = {
      firstName: 'First',
      lastName: 'User',
      email: 'duplicate@example.com',
      firebaseUid: 'firebase123',
    };

    await new User(userData).save();

    // Second user with same email but different firebaseUid
    const duplicateEmailUser = new User({
      firstName: 'Second',
      lastName: 'User',
      email: 'duplicate@example.com',
      firebaseUid: 'firebase456',
    });

    // Attempting to save should fail with duplicate key error
    await expect(duplicateEmailUser.save()).rejects.toThrow();
  });

  test('should fail due to duplicate firebaseUid', async () => {
    // First user with unique firebaseUid
    const userData = {
      firstName: 'First',
      lastName: 'User',
      email: 'first@example.com',
      firebaseUid: 'firebase789',
    };

    await new User(userData).save();

    // Second user with same firebaseUid but different email
    const duplicateFirebaseUser = new User({
      firstName: 'Second',
      lastName: 'User',
      email: 'second@example.com',
      firebaseUid: 'firebase789',
    });

    // Attempting to save should fail with duplicate key error
    await expect(duplicateFirebaseUser.save()).rejects.toThrow();
  });
});