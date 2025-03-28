import { describe, test, expect } from '@jest/globals';
import {getAnalysisData, getSpendingByCategory, getRecurringExpenses, getRecurringIncomeSources} from '../../backend/logic/analysisLogic';

// Let's test the functions directly without relying on the database
describe('getSpendingByCategory', () => {
  test('should handle empty transactions array', async () => {
    const result = await getSpendingByCategory([], 3, 2025);
    expect(result).toEqual({});
  });

  test('should handle null transactions', async () => {
    const result = await getSpendingByCategory(null, 3, 2025);
    expect(result).toEqual({});
  });

  test('should calculate spending by category', async () => {
    const transactions = [
      { amount: '100.00', date: '2025-03-15', category: 'Food' },
      { amount: '200.00', date: '2025-03-20', category: 'Rent' },
      { amount: '50.00', date: '2025-03-25', category: 'Food' }
    ];
    
    const result = await getSpendingByCategory(transactions, 3, 2025);
    expect(result).toHaveProperty('Food', 150);
    expect(result).toHaveProperty('Rent', 200);
  });
});

describe('getRecurringExpenses', () => {
  test('should handle empty transactions array', async () => {
    const result = await getRecurringExpenses([]);
    expect(result).toEqual([]);
  });

  test('should handle null transactions', async () => {
    const result = await getRecurringExpenses(null);
    expect(result).toEqual([]);
  });
});

describe('getAnalysisData', () => {
  test('should return empty object for null user ID', async () => {
    const result = await getAnalysisData(null);
    expect(result).toEqual({});
  });

  test('should return empty object for undefined user ID', async () => {
    const result = await getAnalysisData(undefined);
    expect(result).toEqual({});
  });
});
