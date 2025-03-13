const request = require('supertest');
const express = require('express');
const moment = require('moment');

// Mock the Transaction model so that Mongoose connection is never required
jest.mock('../../backend/models/transaction.model', () => ({
  Transaction: {
    find: jest.fn()
  }
}));

// Now import the mocked Transaction and the routes
const { Transaction } = require('../../backend/models/transaction.model');
const transactionsRoutes = require('../../backend/routes/transactionsRoutes');

jest.mock('../../backend/middleware/auth.middleware', () => {
  return (req: any, res: any, next: any) => {
    req.user = { _id: '507f191e810c19729de860ea' };
    next();
  };
});

const app = express();
app.use(express.json());
app.use('/api/transactions', transactionsRoutes);

describe('GET /api/transactions/stored', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return transactions without filters', async () => {
    const sampleTransactions = [
      { _id: '1', date: '2022-01-01', merchant_name: 'Test Merchant', name: 'Transaction 1' }
    ];
    
   
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(sampleTransactions)
    };

    // Override Transaction.find to return the mock query object
    (Transaction.find as jest.Mock).mockImplementation(() => mockQuery);

    const res = await request(app)
      .get('/api/transactions/stored')
      .query({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(sampleTransactions.length);
    expect(res.body.transactions).toEqual(sampleTransactions);
    expect(Transaction.find).toHaveBeenCalledWith({ user_id: '507f191e810c19729de860ea' });
  });

  // Uncomment and adjust additional tests as needed:


  it('should apply date range filter', async () => {
    const sampleTransactions: any[] = [];
    
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(sampleTransactions)
    };

    (Transaction.find as jest.Mock).mockImplementation(() => mockQuery);

    const fromDate = '2022-01-01';
    const toDate = '2022-01-31';

    const res = await request(app)
      .get('/api/transactions/stored')
      .query({ fromDate, toDate });

    expect(res.status).toBe(200);
    expect(Transaction.find).toHaveBeenCalledWith({
      user_id: '507f191e810c19729de860ea',
      date: {
        $gte: moment(fromDate).format('YYYY-MM-DD'),
        $lte: moment(toDate).format('YYYY-MM-DD')
      }
    });
  });

  it('should apply search filter', async () => {
    const sampleTransactions: any[] = [];
    
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(sampleTransactions)
    };

    (Transaction.find as jest.Mock).mockImplementation(() => mockQuery);

    const search = 'merchant';
    const res = await request(app)
      .get('/api/transactions/stored')
      .query({ search });

    expect(res.status).toBe(200);
    expect(Transaction.find).toHaveBeenCalledWith({
      user_id: '507f191e810c19729de860ea',
      $or: [
        { merchant_name: expect.any(RegExp) },
        { name: expect.any(RegExp) }
      ]
    });
  });

  it('should handle errors gracefully', async () => {
    (Transaction.find as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    const res = await request(app)
      .get('/api/transactions/stored')
      .query({});

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Test error');
  });
  
});
