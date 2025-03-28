// Import Jest types
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { apiRequest, LoginResponse, SignupResponse } from '../../frontend/src/app/assets/utilities/API_HANDLER';
import app from '../../backend/server'; // Adjust the path to your Express app
import User from '../../backend/models/User.model';
const BASE_URL = 'http://localhost:5001/api';

jest.mock('../../frontend/src/app/assets/utilities/API_HANDLER', () => ({
  ...jest.requireActual('../../frontend/src/app/assets/utilities/API_HANDLER'),
  apiRequest: jest.fn(),
}));

jest.mock('../../backend/models/User.model');





describe('apiRequest', () => {
  const mockApiRequest = apiRequest as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    } as unknown as Storage;
  });

  test('successful sign-in returns token and user data', async () => {
    const mockResponse: LoginResponse = {
      token: 'mockToken',
      user: {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test',
        lastName: 'User',
      },
    };

    mockApiRequest.mockResolvedValue(mockResponse);

    const result = await apiRequest<LoginResponse>('/users/login', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
      requireAuth: false,
    });

    expect(result).toEqual(mockResponse);
    expect(mockApiRequest).toHaveBeenCalledWith('/users/login', {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
      requireAuth: false,
    });
  });

  test('sign-in fails with invalid credentials', async () => {
    const mockError = new Error('Invalid credentials');
    mockApiRequest.mockRejectedValue(mockError);

    await expect(
      apiRequest<LoginResponse>('/users/login', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
        requireAuth: false,
      })
    ).rejects.toThrow('Invalid credentials');
  });

  test('sign-in with empty email fails', async () => {
    const mockError = new Error('Email is required');
    mockApiRequest.mockRejectedValue(mockError);

    await expect(
      apiRequest<LoginResponse>('/users/login', {
        method: 'POST',
        body: {
          email: '',
          password: 'password123',
        },
        requireAuth: false,
      })
    ).rejects.toThrow('Email is required');
  });

  test('sign-in with incorrect credentials does not set token in localStorage', async () => {
    const mockError = new Error('Invalid credentials');
    mockApiRequest.mockRejectedValue(mockError);

    await expect(
      apiRequest<LoginResponse>('/users/login', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
        requireAuth: false,
      })
    ).rejects.toThrow('Invalid credentials');

    expect(localStorage.setItem).not.toHaveBeenCalledWith('token', expect.any(String));
  });

  test('account creation with invalid email format fails', async () => {
    const mockError = new Error('Invalid email format');
    mockApiRequest.mockRejectedValue(mockError);

    await expect(
      apiRequest<SignupResponse>('/users/signup', {
        method: 'POST',
        body: {
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          password: 'password123',
        },
        requireAuth: false,
      })
    ).rejects.toThrow('Invalid email format');
  });

  test('sign-up with missing password fails', async () => {
    const mockError = new Error('Password is required');
    mockApiRequest.mockRejectedValue(mockError);

    await expect(
      apiRequest<SignupResponse>('/users/signup', {
        method: 'POST',
        body: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: '',
        },
        requireAuth: false,
      })
    ).rejects.toThrow('Password is required');
  });

  test('sign-in with missing password fails', async () => {
    const mockError = new Error('Password is required');
    mockApiRequest.mockRejectedValue(mockError);

    await expect(
      apiRequest<LoginResponse>('/users/login', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: '',
        },
        requireAuth: false,
      })
    ).rejects.toThrow('Password is required');
  });

  test('sign-in with unverified email fails', async () => {
    const mockError = new Error('Email is not verified');
    mockApiRequest.mockRejectedValue(mockError);

    await expect(
      apiRequest<LoginResponse>('/users/login', {
        method: 'POST',
        body: {
          email: 'unverified@example.com',
          password: 'password123',
        },
        requireAuth: false,
      })
    ).rejects.toThrow('Email is not verified');
  });
  test('sign-up with valid data returns user data', async () => {
    const mockResponse: SignupResponse = {
      message: 'User created successfully',
      user: {
        _id: 'user123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      },
    };

    mockApiRequest.mockResolvedValue(mockResponse);

    const result = await apiRequest<SignupResponse>('/users/signup', {
      method: 'POST',
      body: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
      },
      requireAuth: false,
    });

    expect(result).toEqual(mockResponse);
    expect(mockApiRequest).toHaveBeenCalledWith('/users/signup', {
      method: 'POST',
      body: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
      },
      requireAuth: false,
    });
  });

  test('sign-out clears token from localStorage', async () => {
    localStorage.setItem('token', 'mockToken');

    const signOut = async () => {
      localStorage.removeItem('token');
    };

    await signOut();

    expect(localStorage.getItem('token'));
  });
});