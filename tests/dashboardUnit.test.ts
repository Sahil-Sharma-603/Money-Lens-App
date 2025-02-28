// import {expect, test} from 'jest';
import { describe } from 'node:test';

describe('Dashboard logic functions', () => {
    // set up: 
    // create a user with no transactions
    // create a user with transactions 
    
    
//     // test getDashboardData(userid)
//     test('test getDashboardData', () => {
//         expect(); 
//     }); 
    
// }); 


test('null', () => {
    const n = null;
    expect(n).toBeNull();
    expect(n).toBeDefined();
    expect(n).not.toBeUndefined();
    expect(n).not.toBeTruthy();
    expect(n).toBeFalsy();
  });



const { getDashboardData } = require("../backend/logic/dashboardLogic.js"); // Adjust path if needed
const User = require("../backend/models/User.model.js");
const { Transaction } = require("../backend/models/transaction.model.js");



jest.mock("../backend/models/User.model.js");
jest.mock("../backend/models/transaction.model.js");

describe("getDashboardData", () => {
  const userId = "user123";
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Test user not found
  test("returns error if user is not found", async () => {
    User.findById.mockResolvedValue(null);

    const result = await getDashboardData(userId);
    expect(result).toEqual({ error: "User not found" });
  });

  // 2. Test today's spending calculation
  test("calculates today's spending correctly", async () => {
    const today = new Date().toISOString().split("T")[0];
    
    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue([
      { user_id: userId, date: today, amount: "20.50" },
      { user_id: userId, date: today, amount: "30.00" },
      { user_id: userId, date: "2024-01-01", amount: "100.00" }, // Not today
    ]);

    const result = await getDashboardData(userId);
    expect(result.todaySpending).toBe(50.50);
  });

  // 3. Test fetching 20 most recent transactions
  test("returns the 20 most recent transactions", async () => {
    const transactions = Array.from({ length: 25 }, (_, i) => ({
      user_id: userId,
      date: `2024-02-${25 - i}`,
      amount: `${i + 1}.00`,
      name: `Transaction ${i + 1}`,
      category: ["Other", "Food"],
    }));

    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue(transactions);

    const result = await getDashboardData(userId);
    expect(result.recentTransactions.length).toBe(20);
    expect(result.recentTransactions[0].amount).toBe(25);
  });

  // 4. Test calculating balance correctly
  test("calculates balance correctly", async () => {
    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue([
      { user_id: userId, amount: "50.00" },
      { user_id: userId, amount: "-20.00" },
      { user_id: userId, amount: "30.00" },
    ]);

    const result = await getDashboardData(userId);
    expect(result.balance).toBe(60);
  });

  // 5. Test monthly spending correctly calculated
  test("calculates monthly spending correctly", async () => {
    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue([
      { user_id: userId, date: "2024-02-15", amount: "100.00" },
      { user_id: userId, date: "2024-02-05", amount: "-50.00" },
      { user_id: userId, date: "2024-01-20", amount: "200.00" },
      { user_id: userId, date: "2024-01-10", amount: "-100.00" },
    ]);

    const result = await getDashboardData(userId);

    expect(result.monthlySpending[0]).toMatchObject({
      month: "2024-02",
      spent: 100,
      earned: -50,
      net: 50,
    });
    expect(result.monthlySpending[1]).toMatchObject({
      month: "2024-01",
      spent: 200,
      earned: -100,
      net: 100,
    });
  });

  // 6. Test for valid transaction count
  test("returns correct number of transactions", async () => {
    const transactions = [
      { user_id: userId, amount: "10.00", date: "2024-02-25" },
      { user_id: userId, amount: "50.00", date: "2024-02-24" },
    ];

    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue(transactions);

    const result = await getDashboardData(userId);
    expect(result.count).toBe(2);
  });

  // 7. Test for no transactions
  test("returns zero transactions if no transactions exist", async () => {
    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue([]);

    const result = await getDashboardData(userId);
    expect(result.count).toBe(0);
    expect(result.recentTransactions.length).toBe(0);
  });

  // 8. Test if the "fromDate" filter works correctly
  test("filters transactions by fromDate", async () => {
    const fromDate = "2024-02-01";
    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue([
      { user_id: userId, date: "2024-02-15", amount: "100.00" },
      { user_id: userId, date: "2024-01-20", amount: "200.00" },
    ]);

    const result = await getDashboardData(userId, { fromDate });
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0].date).toBe("2024-02-15");
  });

  // 9. Test if the "toDate" filter works correctly
  test("filters transactions by toDate", async () => {
    const toDate = "2024-02-01";
    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue([
      { user_id: userId, date: "2024-02-15", amount: "100.00" },
      { user_id: userId, date: "2024-01-20", amount: "200.00" },
    ]);

    const result = await getDashboardData(userId, { toDate });
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0].date).toBe("2024-01-20");
  });

  // 10. Test if both "fromDate" and "toDate" filters work together
  test("filters transactions by both fromDate and toDate", async () => {
    const fromDate = "2024-01-01";
    const toDate = "2024-02-01";
    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue([
      { user_id: userId, date: "2024-02-15", amount: "100.00" },
      { user_id: userId, date: "2024-01-20", amount: "200.00" },
    ]);

    const result = await getDashboardData(userId, { fromDate, toDate });
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0].date).toBe("2024-01-20");
  });
});


}); 