const User = require("../models/User.model.js");
const { Transaction } = require("../models/transaction.model");

/**
 * Fetches transaction-related data for the dashboard.
 */
async function getDashboardData(userId) {
    try {
        // ensure the user exists
        const dbUser = await User.findById(userId);
        if (!dbUser) {
        return { error: "User not found" };
        }

        // Fetch transactions for this user
        const transactions = await Transaction.find({ user_id: userId });

        console.log("Fetched transactions:", transactions); // ✅ Debugging

        // Get today's transactions
        const todayDate = new Date().toISOString().split("T")[0];
        const todaySpending = transactions
        .filter((t) => {
            if (!t.date) return false;
            const transactionDate = new Date(t.date).toISOString().split("T")[0];
            return transactionDate === todayDate;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // get recent transactions (last 20)
        const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20)
        .map((t) => ({
            amount: parseFloat(t.amount),
            name: t.name,
            category: t.category?.[1] || "Unknown",
        }));

        // calculate balance
        const balance = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        let monthlySpending = [];
        let totalSpent = 0;
        let totalEarned = 0;
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const monthKey = `${year}-${month}`;
            
            // Filter transactions for this month
            const monthTransactions = transactions.filter(t => {
                if (!t.date) return false;
                return t.date.startsWith(monthKey);
            });
            
            // Separate spent (positive) from earned (negative) (why did plaid set up - to be positive??)
            const spent = monthTransactions
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);
                
            const earned = monthTransactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + t.amount, 0);

            totalSpent += spent;
            totalEarned += earned;
            
            // Round to 2 decimal places
            monthlySpending.push({ 
                month: monthKey, 
                spent: parseFloat(spent.toFixed(2)),
                earned: parseFloat(earned.toFixed(2)),
                net: parseFloat((spent + earned).toFixed(2))
            });
        }

       // calculate This Month's Stats
       const currentMonthKey = new Date().toISOString().slice(0, 7); // Format: "YYYY-MM"
       const thisMonthData = monthlySpending.find(m => m.month === currentMonthKey) || { spent: 0, earned: 0 };

       // calculate Monthly Averages
       const monthsCount = monthlySpending.length;
       const monthAvg = {
           spent: monthsCount > 0 ? parseFloat((totalSpent / monthsCount).toFixed(2)) : 0,
           earned: monthsCount > 0 ? parseFloat((totalEarned / monthsCount).toFixed(2)) : 0
       };

        // calculate average spend per day
        let oldestTransactionDate = transactions.length > 0 
            ? new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())))
            : new Date();

        // Calculate number of days since the oldest transaction (for finding daily avg.)
        const today = new Date();
        const timeDiff = today.getTime() - oldestTransactionDate.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        const dailyAvg = totalDays > 0 ? parseFloat((totalSpent / totalDays).toFixed(2)) : 0;

        console.log("Oldest Transaction Date:", oldestTransactionDate.toISOString().split("T")[0]);
        console.log("Total Days:", totalDays);
        console.log("Daily Average Spending:", dailyAvg);

        console.log("Monthly Spending Data:", monthlySpending);
        console.log("This Month:", thisMonthData);
        console.log("Average Monthly:", monthAvg);
        console.log("Daily Average Spending:", dailyAvg);

        return {
            todaySpending,
            recentTransactions,
            balance,
            monthlySpending,
            thisMonth: thisMonthData,
            monthAvg,
            dailyAvg
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return { error: error.message };
    }
}

module.exports = { getDashboardData };
