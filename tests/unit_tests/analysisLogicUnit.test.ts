// import * as db from '../testdb'; 
// // import User from "../../models/User.model";
// import User = require('../../models/User.model.js');

// // import Transaction = require('../../models/Transaction.model.js');
// import { getAnalysisData, getSpendingByCategory, getRecurringExpenses, getRecurringIncomeSources } from "../../logic/analysisLogic";


// const fakeUserData = {
//     id: 123,
//     firstName: 'Dummy',
//     lastName: 'User',
//     email: 'dummy@user.com',
//     age: 10, 
//     firebaseUid: 'firebase123'

//   };

//   const fakeTransactionData = {
//     user_id: 1, 
//     account_id: 1, 
//     amount: 10, 
//     category: "Food and Drink", 
//     date: "01-01-2001", 
//     merchant_name: "store", 
//     transaction_type: null, 
//     transaction_id: 1, 
//     iso_currency_code: 0, 
    
//   }; 

// beforeAll(async () => {
//     await db.connect(); 
// });

// afterEach(async () => {
//     await db.clearDatabase(); 
// });

// afterAll(async () => {
//     await db.closeDatabase(); 
// });


// describe('getAnalysisData', () => {    

    
//     test('returns empty analysis for non-existent user', async () => {
//         const mockUser = new User(fakeUserData);

//         const result = await getAnalysisData(mockUser._id);
//         expect(result).toEqual({});
//     });

//     test('return empty analysis for existing user with no transaction data', async () => {
//         // const mockUser = new User(fakeUserData);
//         const mockUser = new User({
//             id: 123,
//             firstName: 'Dummy',
//             lastName: 'User',
//             email: 'dummy@user.com',
//             firebaseUid: 'firebase123'
        
//           }); 
//         await mockUser.save(); 
//         console.log("mockuser after save", mockUser); 
//         const result = await getAnalysisData(mockUser._id);
//         console.log("results: ", result); 
//         expect(result).toEqual({});
//     }, 5000); 

// });






// tests/analysis.test.js
// import mongoose from 'mongoose';
// import  { MongoMemoryServer } from 'mongodb-memory-server';
// import { getAnalysisData, getSpendingByCategory, getRecurringExpenses } from '../../backend/logic/analysisLogic';
// import User from '../../backend/models/User.model';
// import { Transaction } from '../../backend/models/Transaction.model';

// let mongoServer: any;

// beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const uri = mongoServer.getUri();
//     await mongoose.connect(uri);
// });

// afterAll(async () => {
//     await mongoose.disconnect();
//     await mongoServer.stop();
// });

// describe('Analysis Data Functions', () => {
//     let user:any;
//     let transactions:any;

//     beforeEach(async () => {
//         user = await User.create({ name: 'Ginelle', email: 'ginelle@example.com' });

//         transactions = [
//             { user_id: user._id, amount: '100.00', date: new Date(), category: 'Groceries', name: 'Walmart' },
//             { user_id: user._id, amount: '-50.00', date: new Date(), category: 'Salary', name: 'Employer' },
//             { user_id: user._id, amount: '150.00', date: new Date(), category: 'Groceries', name: 'Costco' },
//         ];
//         await Transaction.insertMany(transactions);
//     });

//     afterEach(async () => {
//         await User.deleteMany();
//         await Transaction.deleteMany();
//     });

//     test('getAnalysisData returns correct data', async () => {
//         const result = await getAnalysisData(user._id);
        
//         // Expecting a non-empty result with keys related to transactions and financial data
//         expect(result).toHaveProperty('transactions');
//         expect(result.transactions).toHaveLength(3);
//         expect(result).toHaveProperty('balance');
//         expect(result.balance).toBeCloseTo(200, 2); // Balance should sum the transactions (100 - 50 + 150)
//         expect(result).toHaveProperty('thisMonth');
//         expect(result.thisMonth).toHaveProperty('spent');
//         expect(result.thisMonth.spent).toBeGreaterThan(0);
//     });

//     // test('getSpendingByCategory returns correct category data', async () => {
//     //     const result = await getSpendingByCategory(transactions, 3, 2025); // Current month/year
        
//     //     expect(result).toHaveProperty('Groceries');
//     //     expect(result.Groceries).toBeGreaterThan(0);
//     //     expect(result).toHaveProperty('Salary');
//     //     expect(result.Salary).toBeLessThan(0);
//     // });

//     test('getRecurringExpenses detects recurring expenses correctly', async () => {
//         // Insert multiple recurring expenses
//         const recurringTransactions = [
//             { user_id: user._id, amount: '50.00', date: new Date(), category: 'Rent', name: 'Landlord' },
//             { user_id: user._id, amount: '50.00', date: new Date(new Date().setMonth(new Date().getMonth() - 1)), category: 'Rent', name: 'Landlord' }
//         ];
//         await Transaction.insertMany(recurringTransactions);

//         const result = await getRecurringExpenses(recurringTransactions);

//         expect(result).toHaveLength(1);
//         expect(result[0]).toHaveProperty('name', 'Landlord');
//         expect(result[0]).toHaveProperty('amount', 50.00);
//         expect(result[0]).toHaveProperty('frequency', 'Monthly');
//     });

//     test('getAnalysisData handles user not found', async () => {
//         const result = await getAnalysisData('nonexistent-user-id');
//         expect(result).toEqual({ error: "User not found" });
//     });

//     test('getSpendingByCategory handles empty transactions', async () => {
//         const result = await getSpendingByCategory([], 3, 2025);
//         expect(result).toEqual({});
//     });
// });





import  { connect, clearDatabase, closeDatabase } from '../testdb'
import {getAnalysisData, getSpendingByCategory, getRecurringExpenses, getRecurringIncomeSources} from '../../backend/logic/analysisLogic';
import  User  from '../../backend/models/User.model';
import Transaction from '../../backend/models/Transaction.model'

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

const fakeUserData = {
    firstName: 'Dummy',
    lastName: 'User',
    email: 'dummy@user.com',
    age: 10, 
    firebaseUid: 'firebase123'

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

    
describe('getAnalysisData', ()  => {

    test('get analysis data for non-existing user', async() => {
        const mockUser =  await User.create(fakeUserData); 
        const result = await getAnalysisData(mockUser._id);
        expect(result).toBe({});  
    }); 

    test('get empty analysis data for non-existing user', async() => {
        const mockUser =  await User.create(fakeUserData); 
        await mockUser.save(); 
        const result = await getAnalysisData(mockUser._id);
        expect(result).toBe({});  
    }); 

});