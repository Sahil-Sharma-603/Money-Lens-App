const User = require("../models/User.model.js");
const { Transaction } = require("../models/Transaction.model.js");

/**
 * Fetches transaction-related data for the dashboard.
 */
async function getAnalysisData(userId) {
    try {
        // ensure the user exists
        const dbUser = await User.findById(userId);
        if (!dbUser) {
        return { error: "User not found" };
        }

        // Fetch transactions for this user
        const transactions = await Transaction.find({ user_id: userId });

        // console.log("Fetched transactions:", transactions); // ✅ Debugging

        // Get today's transactions
        const todayDate = new Date().toISOString().split("T")[0];
        const todaySpending = transactions
        .filter((t) => {
            if (!t.date) return false;
            const transactionDate = new Date(t.date).toISOString().split("T")[0];
            return transactionDate === todayDate;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // // get recent transactions (last 20)
        // const recentTransactions = transactions
        // .sort((a, b) => new Date(b.date) - new Date(a.date))
        // .slice(0, 20)
        // .map((t) => ({
        //     amount: parseFloat(t.amount),
        //     name: t.name,
        //     category: t.category?.[1] || "Unknown",
        // }));

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
                const transactionMonth = new Date(t.date).toISOString().slice(0, 7); // "YYYY-MM"
                return transactionMonth === monthKey;
            });
            
            // Separate spent (positive) from earned (negative) (why did plaid set up - to be positive??)
            const spent = monthTransactions
                .filter(t => !isNaN(parseFloat(t.amount)) && parseFloat(t.amount) > 0)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        
                
            const earned = (monthTransactions || [])
                .filter(t => !isNaN(parseFloat(t.amount)) && parseFloat(t.amount) < 0)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            totalSpent += spent;
            totalEarned += earned;
            
            // Round to 2 decimal places
            monthlySpending.push({ 
                month: monthKey, 
                spent: isNaN(spent) ? 0 : parseFloat(spent.toFixed(2)),
                earned: isNaN(earned) ? 0 : parseFloat(earned.toFixed(2)),
                net: isNaN(spent + earned) ? 0 : parseFloat((spent + earned).toFixed(2))
            });
        }

       // calculate This Month's Stats
       const currentMonthKey = new Date().toISOString().slice(0, 7); // Format: "YYYY-MM"
       const thisMonthData = monthlySpending.find(m => m.month === currentMonthKey) || { spent: 0, earned: 0 };

       // calculate Monthly Averages
    //    const monthsCount = monthlySpending.length;
    //    const monthAvg = {
    //        spent: monthsCount > 0 ? parseFloat((totalSpent / monthsCount).toFixed(2)) : 0,
    //        earned: monthsCount > 0 ? parseFloat((totalEarned / monthsCount).toFixed(2)) : 0
    //    };

        // Get the date of the oldest transaction (for averages)
        let oldestTransactionDate = transactions.length > 0 
            ? new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())))
            : new Date();

        // Get the current date
        const today = new Date();

        // Calculate the number of months between the first transaction and today
        const totalMonths = (today.getFullYear() - oldestTransactionDate.getFullYear()) * 12 
            + (today.getMonth() - oldestTransactionDate.getMonth()) + 1;
        const monthsCount = Math.max(totalMonths, 1); // ensure this is at least 1

        // Calculate Monthly Averages
        const monthAvg = {
            spent: monthsCount > 0 ? parseFloat((totalSpent / monthsCount).toFixed(2)) : 0,
            earned: monthsCount > 0 ? parseFloat((totalEarned / monthsCount).toFixed(2)) : 0
        };

        // Calculate number of days since the oldest transaction (for finding daily avg.)
        const timeDiff = today.getTime() - oldestTransactionDate.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        const dailyAvg = totalDays > 0 ? parseFloat((totalSpent / totalDays).toFixed(2)) : 0;

        // console.log("Oldest Transaction Date:", oldestTransactionDate.toISOString().split("T")[0]);
        // console.log("Total Days:", totalDays);
        // console.log("Daily Average Spending:", dailyAvg);

        // console.log("Monthly Spending Data:", monthlySpending);
        // console.log("This Month:", thisMonthData);
        // console.log("Average Monthly:", monthAvg);
        // console.log("Daily Average Spending:", dailyAvg);


        const spendingByCategory = await getSpendingByCategory(transactions, today.getMonth() +1, today.getFullYear());
        const recurringExpenses = await getRecurringExpenses(transactions); 
        const recurringIncomeSources = await getSpendingByCategory(transactions, today.getMonth() +1, today.getFullYear()); 
        console.log("SpendingbyCategory: ", spendingByCategory); 
        console.log("Recurring expenses: ", recurringExpenses); 

        return {
            todaySpending,
            transactions,
            // recentTransactions,
            balance,
            monthlySpending,
            thisMonth: thisMonthData,
            monthAvg,
            dailyAvg, 
            spendingByCategory, 
            recurringExpenses, 
            recurringIncomeSources, 
        };
    } catch (error) {
        console.error("Error fetching analysis data:", error);
        return { error: error.message };
    }
}

async function getSpendingByCategory(transactions, month, year) {
    try {
        const result =  transactions
        .filter(({ date }) => {
            const transactionDate = new Date(date);
            return transactionDate.getMonth() === month - 1 && transactionDate.getFullYear() === year;
        })
        .reduce((acc, { category, amount }) => {
            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {}); 

        console.log("spending by category: ", result); 
        return result; 
    } catch (error) {
        console.error("Error getting spending by category:", error); 
        return {error: error.message}; 
    }
}



async function getRecurringExpenses(transactions) {
    const recurringMap = new Map();

    transactions.forEach(transaction => {
        const key = `${transaction.name}-${Math.round(transaction.amount * 100) / 100}`; // Round to 2 decimal places
        
        if (!recurringMap.has(key)) {
            recurringMap.set(key, []);
        }
        
        recurringMap.get(key).push(transaction.date);
    });

    const recurringExpenses = [];
    recurringMap.forEach((dates, key) => {
        if (dates.length > 1) { // At least two occurrences
            const sortedDates = dates.map(date => new Date(date)).sort((a, b) => a - b);
            
            const intervals = sortedDates.map((date, index) => 
                index > 0 ? date - sortedDates[index - 1] : null
            ).filter(interval => interval !== null);

            if (intervals.length === 0) return;

            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const monthlyInterval = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

            if (avgInterval >= monthlyInterval * 0.5 && avgInterval <= monthlyInterval * 1.5) {
                const [name, amount] = key.split('-');
                recurringExpenses.push({
                    name,
                    amount: parseFloat(amount),
                    frequency: 'Monthly',
                    nextPaymentDate: getNextPaymentDate(sortedDates)
                });
            }
        }
    });

    console.log("recurring map: ", recurringMap); 

    console.log("Detected Recurring Expenses:", recurringExpenses);
    return recurringExpenses;
}

// Helper function to estimate the next payment date
function getNextPaymentDate(dates) {
    const sortedDates = dates.sort((a, b) => new Date(a) - new Date(b));
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    lastDate.setMonth(lastDate.getMonth() + 1);
    return lastDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}



async function getRecurringIncomeSources() {

}

module.exports = { getAnalysisData, getSpendingByCategory, getRecurringExpenses, getRecurringIncomeSources };
