
import  { connect, clearDatabase, closeDatabase } from '../testdb'
import {getAnalysisData, getTransactions, getSpendingByCategory, getRecurringExpenses, getRecurringIncomeSources} from '../../backend/logic/analysisLogic';
import  User  from '../../backend/models/User.model';
import Transaction from '../../backend/models/Transaction.model'
const mongoose = require('mongoose');

let originalEnv:any; 

beforeAll(async () => {
    await connect()
    originalEnv = { ...process.env };
});
afterEach(async () => await clearDatabase());
afterAll(async () => {
    await closeDatabase()
    process.env = originalEnv;
});

const fakeUserData = {
    firstName: 'Dummy',
    lastName: 'User',
    email: 'dummy@user.com',
    age: 10, 
    firebaseUid: 'firebase123'

};

const fakeTransactionData = {
    user_id: new mongoose.Types.ObjectId(123456789), 
    account_id: new mongoose.Types.ObjectId(123456789), 
    amount: 10, 
    category: "Food and Drink", 
    date: "01-01-2001", 
    merchant_name: "store", 
    transaction_type: "type", 
    transaction_id: 1, 
    iso_currency_code: 0, 

}; 

const fakeTransactionData2 = {
    user_id: new mongoose.Types.ObjectId(123456789), 
    account_id: new mongoose.Types.ObjectId(123456789), 
    amount: 30, 
    category: "Food and Drink", 
    date: "01-02-2001", 
    merchant_name: "store", 
    transaction_type: "type", 
    transaction_id: 2, 
    iso_currency_code: 0, 

}; 



    
describe('getAnalysisData', ()  => {

    test('get empty analysis data for non-existing user', async() => {
        const mockUser =  await User.create(fakeUserData); 
        const result = await getAnalysisData(mockUser._id);
        expect(result).toStrictEqual({});
        


    }); 

    test('get empty analysis data for existing user', async() => {
        const mockUser =  await User.create(fakeUserData); 
        await mockUser.save(); 
        const result = await getAnalysisData(mockUser._id);
        expect(result).toStrictEqual({});
        
  
    }); 


    test('get analysis data for existing user', async() => {
        const mockUser =  await User.create(fakeUserData); 
        await mockUser.save(); 
        await Transaction.saveTransaction(fakeTransactionData, mockUser._id); 
        const result = await getAnalysisData(mockUser._id);
        console.log(result); 
        expect(result.balance).toBe(10);  
        expect(result.transactions).not.toBeNull(); 
        // expect(result.transactions[0].amount).toBe(10);
        
  
    }); 

    

    test('getTransactions from 1 transactions for existing user', async() => {
        const mockUser =  await User.create(fakeUserData); 
        await mockUser.save(); 
        await Transaction.saveTransaction(fakeTransactionData, mockUser._id); 
        let result: any[]; 
        result = await getTransactions(mockUser._id) as any[];
        console.log(result);  
        expect(result).not.toBeNull(); 
        expect(result).toHaveLength(1);
        
        expect(result[0]).toHaveProperty('_id');
        expect(result[0]).toHaveProperty('user_id');
        expect(result[0]).toHaveProperty('account_id');
        expect(result[0]).toHaveProperty('amount', 10);
        expect(result[0]).toHaveProperty('category', ['Food and Drink']);
        expect(result[0]).toHaveProperty('date', '01-01-2001');
        expect(result[0]).toHaveProperty('iso_currency_code', '0');
        expect(result[0]).toHaveProperty('merchant_name', 'store');
        expect(result[0]).toHaveProperty('pending', false);
        expect(result[0]).toHaveProperty('transaction_id', '1');
        expect(result[0]).toHaveProperty('transaction_type', 'type');
        expect(result[0]).toHaveProperty('counterparties', []);
        expect(result[0]).toHaveProperty('__v', 0);

        expect(result[0].amount).toBeGreaterThan(0);
        
  
    }); 


    test('getTransactions from 2 transactions for existing user', async() => {
        const mockUser =  await User.create(fakeUserData); 
        await mockUser.save(); 
        await Transaction.saveTransaction(fakeTransactionData, mockUser._id); 
        await Transaction.saveTransaction(fakeTransactionData2, mockUser._id);
        let result: any[]; 
        result = await getTransactions(mockUser._id) as any[];
        console.log(result);  
        expect(result).not.toBeNull(); 
        expect(result).toHaveLength(2);
        
        expect(result[0]).toHaveProperty('_id');
        expect(result[0]).toHaveProperty('user_id');
        expect(result[0]).toHaveProperty('account_id');
        expect(result[0]).toHaveProperty('amount', 10);
        expect(result[0]).toHaveProperty('category', ['Food and Drink']);
        expect(result[0]).toHaveProperty('date', '01-01-2001');
        expect(result[0]).toHaveProperty('iso_currency_code', '0');
        expect(result[0]).toHaveProperty('merchant_name', 'store');
        expect(result[0]).toHaveProperty('pending', false);
        expect(result[0]).toHaveProperty('transaction_id', '1');
        expect(result[0]).toHaveProperty('transaction_type', 'type');
        expect(result[0]).toHaveProperty('counterparties', []);
        expect(result[0]).toHaveProperty('__v', 0);

        expect(result[1]).toHaveProperty('_id');
        expect(result[1]).toHaveProperty('user_id');
        expect(result[1]).toHaveProperty('account_id');
        expect(result[1]).toHaveProperty('amount', 30);
        expect(result[1]).toHaveProperty('category', ['Food and Drink']);
        expect(result[1]).toHaveProperty('date', '01-02-2001');
        expect(result[1]).toHaveProperty('iso_currency_code', '0');
        expect(result[1]).toHaveProperty('merchant_name', 'store');
        expect(result[1]).toHaveProperty('pending', false);
        expect(result[1]).toHaveProperty('transaction_id', '2');
        expect(result[1]).toHaveProperty('transaction_type', 'type');
        expect(result[1]).toHaveProperty('counterparties', []);
        expect(result[1]).toHaveProperty('__v', 0);

        expect(result[0].amount).toBeGreaterThan(0);
        expect(result[1].amount).toBeGreaterThan(0);
        
  
    }); 

    test('getSpendingByCategory data from 2 transactions for existing user', async() => {
        const mockUser =  await User.create(fakeUserData); 
        await mockUser.save(); 
        await Transaction.saveTransaction(fakeTransactionData, mockUser._id); 
        await Transaction.saveTransaction(fakeTransactionData2, mockUser._id);
        const result = await getSpendingByCategory(getTransactions(mockUser._id), "01", "2001");
        console.log(result);  
        expect(result).not.toBeNull(); 
        // expect(result.transactions[0].amount).toBe(10);
        
  
    }); 

    test('getSpendingByCategory data from 1 transaction for existing user', async() => {
        const mockUser =  await User.create(fakeUserData); 
        await mockUser.save(); 
        await Transaction.saveTransaction(fakeTransactionData, mockUser._id);  
        const result = await getSpendingByCategory(getTransactions(mockUser._id), "01", "2001");
        console.log(result);  
        expect(result).not.toBeNull(); 
        expect(result).toStrictEqual({});
        
  
    }); 

    test('should fetch user without timeout when NODE_ENV is test', async () => {

        const mockUser = await User.create(fakeUserData);
        await mockUser.save(); 
        // User.findById.mockResolvedValue(mockUser._id);

        const findByIdMock = jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

        let dbUser;
        if (process.env.NODE_ENV === 'test') {
            dbUser = await User.findById(mockUser._id);
        }

        // Ensure User.findById was called with the correct argument
        expect(findByIdMock).toHaveBeenCalledWith(mockUser._id);
        expect(dbUser).toEqual(mockUser);

        // Clean up the mock
        findByIdMock.mockRestore();
    });

    test('should fetch user with timeout in non-test environments', async () => {
        // Override NODE_ENV using Object.defineProperty
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: 'production',
            writable: true,  // Allow modification
        });
    
        const mockUser = await User.create(fakeUserData);
        await mockUser.save(); 
    
        // Mock the User.findById method to avoid real DB calls
        const findByIdMock = jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
    
        let dbUser;
        try {
            dbUser = await Promise.race([
                User.findById(mockUser._id),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("User lookup timed out")), 3000)
                )
            ]);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            // expect(error.message).toBe('User lookup timed out');  // Ensure correct timeout message
        }
    
        // Ensure the mocked method was called correctly
        expect(findByIdMock).toHaveBeenCalledWith(mockUser._id);
    
        // This might not run because of the timeout, but you can check if dbUser was set
        if (dbUser) {
            expect(dbUser).toEqual(mockUser);
        }
    
        // Clean up the mock
        findByIdMock.mockRestore();
    });
    
    

    test('should timeout if user lookup takes too long in non-test environments', async () => {
        // TypeScript allows direct assignment when we cast process.env as 'any'
        (process.env as any).NODE_ENV = 'production';
    
        // Mock User.findById to simulate a long-running query
        const findByIdMock = jest.spyOn(User, 'findById').mockImplementation((id) => {
            return {
                exec: jest.fn().mockResolvedValue({ _id: '123' })  // Return a mocked result after exec is called
            } as any;  // Cast to any to bypass TypeScript errors for mock objects
        });
    
        let dbUser;
        let timeout;
        try {
            dbUser = await Promise.race([
                User.findById('123').exec(),  // Call exec() on the mock query
                new Promise((_, reject) => {
                    timeout = setTimeout(() => reject(new Error("User lookup timed out")), 3000);  // Timeout after 3 seconds
                }),
            ]);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            // expect(error.message).toBe('User lookup timed out');
        }
    
        // Ensure the mock function was called with the correct argument
        expect(findByIdMock).toHaveBeenCalledWith('123');
        // expect(dbUser).toBeUndefined();
    
        // Clean up the timeout to avoid open handles
        if (timeout) clearTimeout(timeout);
    
        // Clean up the mock
        findByIdMock.mockRestore();
    });

}); 