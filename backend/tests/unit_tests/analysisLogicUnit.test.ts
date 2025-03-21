import * as db from '../testdb'; 
const User = require("../../models/User.model");
const { Transaction } = require("../../models/transaction.model");
const { getAnalysisData, getSpendingByCategory, getRecurringExpenses, getRecurringIncomeSources } = require("../../logic/analysisLogic");


const fakeUserData = {
    firstName: 'Dummy',
    lastName: 'User',
    email: 'dummy@user.com',

  };

  const fakeTransactionData = {
    user_id: 1, 
    account_id: 1, 
    amount: 10, 
    category: "Food and Drink", 
    date: "01-01-2001", 
    merchant_name: "store", 
    transaction_type: null, 
    transaction_id: 1, 
    iso_currency_code: 0, 
    
  }; 

beforeAll(async () => {
    await db.connect(); 
});

afterEach(async () => {
    await db.clearDatabase(); 
});

afterAll(async () => {
    await db.closeDatabase(); 
})


describe('getAnalysisData', () => {
    test('returns empty analysis for non-existent user', async () => {
        const mockUser = await User.create(fakeUserData);

        const result = await getAnalysisData(mockUser.user_id);
        expect(result).toEqual({});
    });

});