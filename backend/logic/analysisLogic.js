const User = require("../models/User.model.js");
const { Transaction } = require("../models/transaction.model.js");

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

         // Calculate total spent and total earned across all transactions
        let totalSpent = 0;
        let totalEarned = 0;
        transactions.forEach(t => {
            let amount = parseFloat(t.amount);
            if (amount > 0) {
                totalSpent += amount;
            } else {
                totalEarned += Math.abs(amount); // negative values are for money earned
            }
        });

        // calculate balance
        const balance = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // get interval spending data
        const monthlySpending = await getMonthlySpending(transactions);
        const weeklySpending = await getWeeklySpending(transactions);
        const yearlySpending = await getYearlySpending(transactions);

        // calculate This Month's Stats
        const currentMonthKey = new Date().toISOString().slice(0, 7); // Format: "YYYY-MM"
        const thisMonthData = monthlySpending.find(m => m.month === currentMonthKey) || { spent: 0, earned: 0 };

        // calculate This Week's Stats
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // snday as first day of week
        const weekKey = startOfWeek.toISOString().slice(0, 10); // only take date portion of Date
        const thisWeekData = weeklySpending.find(w => w.weekStarting === weekKey) || { spent: 0, earned: 0 };

        // calculate This Year's Stats
        const currentYear = today.getFullYear().toString();
        const thisYearData = yearlySpending.find(y => y.year === currentYear) || { spent: 0, earned: 0 };

        // Get the date of the oldest transaction (for averages)
        let oldestTransactionDate = transactions.length > 0 
            ? new Date(Math.min(...transactions.map(t => new Date(t.date).getTime())))
            : new Date();

        // Calculate the number of months between the first transaction and today
        const totalMonths = (today.getFullYear() - oldestTransactionDate.getFullYear()) * 12 
            + (today.getMonth() - oldestTransactionDate.getMonth()) + 1;
        const monthsCount = Math.max(totalMonths, 1); // ensure this is at least 1

        // Calculate Monthly Averages
        const monthAvg = {
            spent: monthsCount > 0 ? parseFloat((totalSpent / monthsCount).toFixed(2)) : 0,
            earned: monthsCount > 0 ? parseFloat((totalEarned / monthsCount).toFixed(2)) : 0
        };

        // Calculate yearly avg
        const totalYears = Math.max((today.getFullYear() - oldestTransactionDate.getFullYear()), 1);
        const yearAvg = {
            spent: totalYears > 0 ? parseFloat((totalSpent / totalYears).toFixed(2)) : 0,
            earned: totalYears > 0 ? parseFloat((totalEarned / totalYears).toFixed(2)) : 0
        };

        // Calculate number of days since the oldest transaction (for finding daily/weekly avg.)
        const timeDiff = today.getTime() - oldestTransactionDate.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        const dailyAvg = totalDays > 0 ? parseFloat((totalSpent / totalDays).toFixed(2)) : 0;

        // Calculate weekly avg
        const totalWeeks = Math.ceil(totalDays / 7);
        const weekAvg = {
            spent: totalWeeks > 0 ? parseFloat((totalSpent / totalWeeks).toFixed(2)) : 0,
            earned: totalWeeks > 0 ? parseFloat((totalEarned / totalWeeks).toFixed(2)) : 0
        };

        const spendingByCategory = await getSpendingByCategory(transactions, today.getMonth() + 1, today.getFullYear());
        console.log("SpendingbyCategory: ", spendingByCategory); 

        console.log("Weekly Average Spending:", weekAvg);
        console.log("Monthly Average Spending:", monthAvg);
        console.log("Yearly Average Spending:", yearAvg);

        // console.log("Monthly Spending Data:", monthlySpending);
        // console.log("Weekly Spending Data:", weeklySpending);
        // console.log("Yearly Spending Data:", yearlySpending);
        console.log("This Month:", thisMonthData);
        console.log("This Week:", thisWeekData);
        console.log("This Year:", thisYearData);

        return {
            transactions,
            balance,
            monthlySpending,
            weeklySpending,
            yearlySpending,
            thisMonth: thisMonthData,
            thisWeek: thisWeekData,
            thisYear: thisYearData,
            monthAvg,
            weekAvg,
            yearAvg,
            dailyAvg, 
            spendingByCategory
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

async function getMonthlySpending(transactions) {
    try {
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

        console.log("Monthly spending data: ", monthlySpending); 
        return monthlySpending; 
    } catch (error) {
        console.error("Error getting monthly spending data:", error); 
        return {error: error.message}; 
    }
}

async function getWeeklySpending(transactions) {
    try {
        let weeklySpending = [];
        // Get weeks for the last 12 weeks
        for (let i = 0; i < 12; i++) {
            const today = new Date();
            // Get start of week (Sunday)
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() - (7 * i));
            startOfWeek.setHours(0, 0, 0, 0);
            
            // Get end of week (Saturday)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            const weekKey = startOfWeek.toISOString().slice(0, 10);
            
            // Filter transactions for this week
            const weekTransactions = transactions.filter(t => {
                if (!t.date) return false;
                const txDate = new Date(t.date);
                return txDate >= startOfWeek && txDate <= endOfWeek;
            });
            
            // Calculate spent and earned
            const spent = weekTransactions
                .filter(t => !isNaN(parseFloat(t.amount)) && parseFloat(t.amount) > 0)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const earned = weekTransactions
                .filter(t => !isNaN(parseFloat(t.amount)) && parseFloat(t.amount) < 0)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                
            weeklySpending.push({
                weekStarting: weekKey,
                spent: isNaN(spent) ? 0 : parseFloat(spent.toFixed(2)),
                earned: isNaN(earned) ? 0 : parseFloat(earned.toFixed(2)),
                net: isNaN(spent + earned) ? 0 : parseFloat((spent + earned).toFixed(2))
            });
        }
        
        console.log("Weekly spending data: ", weeklySpending);
        return weeklySpending;
    } catch (error) {
        console.error("Error getting weekly spending data:", error);
        return {error: error.message};
    }
}

async function getYearlySpending(transactions) {
    try {
        let yearlySpending = [];
        // Get data for the last 5 years
        const currentYear = new Date().getFullYear();
        
        for (let year = currentYear; year >= currentYear - 4; year--) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999); // december 31st
            
            // Filter transactions for this year
            const yearTransactions = transactions.filter(t => {
                if (!t.date) return false;
                const txDate = new Date(t.date);
                return txDate >= startOfYear && txDate <= endOfYear;
            });
            
            // Calculate spent and earned
            const spent = yearTransactions
                .filter(t => !isNaN(parseFloat(t.amount)) && parseFloat(t.amount) > 0)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const earned = yearTransactions
                .filter(t => !isNaN(parseFloat(t.amount)) && parseFloat(t.amount) < 0)
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                
            yearlySpending.push({
                year: year.toString(),
                spent: isNaN(spent) ? 0 : parseFloat(spent.toFixed(2)),
                earned: isNaN(earned) ? 0 : parseFloat(earned.toFixed(2)),
                net: isNaN(spent + earned) ? 0 : parseFloat((spent + earned).toFixed(2))
            });
        }
        
        console.log("Yearly spending data: ", yearlySpending);
        return yearlySpending;
    } catch (error) {
        console.error("Error getting yearly spending data:", error);
        return {error: error.message};
    }
}

module.exports = { getAnalysisData, getSpendingByCategory };
