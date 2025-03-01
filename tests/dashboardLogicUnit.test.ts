// import {expect, test} from 'jest';
import { describe } from 'node:test';

const { getDashboardData } = require("../backend/logic/dashboardLogic.js"); // Adjust path if needed
const User = require("../backend/models/User.model.js");
const { Transaction } = require("../backend/models/transaction.model.js")


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
      { user_id: userId, date: "2025-01-01", amount: "100.00" }, // Not today
    ]);

    const result = await getDashboardData(userId);
    expect(result.todaySpending).toBe(50.50);
  });

 // 3. Test fetching 20 most recent transactions
  test("returns the 20 most recent transactions", async () => {
    const transactions = Array.from({ length: 25 }, (_, i) => ({
      user_id: userId,
      date: `2025-02-${25 - i}`,
      amount: `${i + 1}.00`,
      name: `Transaction ${i + 1}`,
      category: ["Other", "Food"],
    }));

    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue(transactions);

    const result = await getDashboardData(userId);
    if(result == null){
      fail("result is null"); 
    } else {
      expect(result.recentTransactions.length).toBe(20);
      expect(result.recentTransactions[0].amount).toBe(1);
      expect(result.recentTransactions[19].amount).toBe(20); 
    }
  });

  // 5. Test monthly spending correctly calculated
  test("calculates monthly spending correctly", async () => {
    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue([
      { user_id: userId, date: "2025-02-15", amount: "100.00" },
      { user_id: userId, date: "2025-02-05", amount: "-50.00" },
      { user_id: userId, date: "2025-01-20", amount: "200.00" },
      { user_id: userId, date: "2025-01-10", amount: "-100.00" },
    ]);

    const result = await getDashboardData(userId);
    if(result == null){
      fail("result is null"); 
    } else {

      expect(result.monthlySpending[0]).toMatchObject({
        month: "2025-02",
        spent: 100,
        earned: -50,
        net: 50,
      });
      expect(result.monthlySpending[1]).toMatchObject({
        month: "2025-01",
        spent: 200,
        earned: -100,
        net: 100,
      });

    }
  });


  // 6. Test for valid transaction count
  test("returns correct number of transactions", async () => {
    const transactions = [
      { user_id: userId, amount: "10.00", date: "2025-02-25" },
      { user_id: userId, amount: "50.00", date: "2025-02-24" },
    ];

    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue(transactions);

    const result = await getDashboardData(userId);
    if(result == null){
      fail("result is null"); 
    } else {
      expect(result.recentTransactions.length).toBe(2);
    }
  });

  // 7. Test for no transactions
  test("returns zero transactions if no transactions exist", async () => {
    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue([]);

    const result = await getDashboardData(userId);
    
    expect(result.recentTransactions).toEqual([]);
  });

  // 8. Test for correct monthly average spending and earning
  test("calculates average monthly spent and earned correctly", async () => {
    const transactions = [
      { user_id: userId, date: "2025-02-10", amount: "500.00" },
      { user_id: userId, date: "2025-02-15", amount: "-200.00" },
      { user_id: userId, date: "2025-01-10", amount: "700.00" }, 
      { user_id: userId, date: "2025-01-20", amount: "-300.00" },
    ];

    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue(transactions);

    const result = await getDashboardData(userId);
    
    expect(result.monthAvg.spent).toBeCloseTo((500 + 700) / 2, 2);
    expect(result.monthAvg.earned).toBeCloseTo(-(200 + 300) / 2, 2);
  });

  // 9. Test for this month's spending and earning
  test("calculates this month's spent and earned correctly", async () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const transactions = [
      { user_id: userId, date: `${currentMonth}-05`, amount: "400.00" },
      { user_id: userId, date: `${currentMonth}-15`, amount: "-150.00" },
    ];

    User.findById.mockResolvedValue({ _id: userId });
    Transaction.find.mockResolvedValue(transactions);

    const result = await getDashboardData(userId);

    expect(result.thisMonth.spent).toBe(400.00);
    expect(result.thisMonth.earned).toBe(-150.00);
  });

});