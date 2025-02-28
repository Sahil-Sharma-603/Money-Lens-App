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
            
            // Round to 2 decimal places
            monthlySpending.push({ 
                month: monthKey, 
                spent: parseFloat((Number)(spent).toFixed(2)),
                earned: parseFloat((Number)(earned).toFixed(2)),
                net: parseFloat((Number)(spent + earned).toFixed(2))
            });
        }

        console.log("Monthly Spending Data:", monthlySpending);

        return {
            todaySpending,
            recentTransactions,
            balance,
            monthlySpending,
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return { error: error.message };
    }
}

module.exports = { getDashboardData };
