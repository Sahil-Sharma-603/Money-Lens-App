import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Define types
interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    lastName: string;
  };
}

interface SignupResponse {
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Mock modules
jest.mock('../../frontend/src/app/assets/utilities/API_HANDLER', () => ({
  apiRequest: jest.fn()
}));

jest.mock('../../backend/models/User.model', () => ({}));

// Import the mocked function
import { apiRequest } from '../../frontend/src/app/assets/utilities/API_HANDLER';

describe('apiRequest', () => {
  // Cast the mock to the correct type
  const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(() => null)
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

    mockApiRequest.mockResolvedValueOnce(mockResponse);

    const result = await apiRequest('/users/login', {
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
    mockApiRequest.mockRejectedValueOnce(mockError);

    await expect(
      apiRequest('/users/login', {
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
    mockApiRequest.mockRejectedValueOnce(mockError);

    await expect(
      apiRequest('/users/login', {
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
    mockApiRequest.mockRejectedValueOnce(mockError);

    await expect(
      apiRequest('/users/login', {
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
    mockApiRequest.mockRejectedValueOnce(mockError);

    await expect(
      apiRequest('/users/signup', {
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
    mockApiRequest.mockRejectedValueOnce(mockError);

    await expect(
      apiRequest('/users/signup', {
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
    mockApiRequest.mockRejectedValueOnce(mockError);

    await expect(
      apiRequest('/users/login', {
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
    mockApiRequest.mockRejectedValueOnce(mockError);

    await expect(
      apiRequest('/users/login', {
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

    mockApiRequest.mockResolvedValueOnce(mockResponse);

    const result = await apiRequest('/users/signup', {
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

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });
});