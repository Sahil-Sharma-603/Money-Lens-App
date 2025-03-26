// const Goals = require('../models/Goal.model'); 
const User = require('../models/User.model'); 
const Transaction = require('../models/Transaction.model'); 
const Account = require('../models/Account.model'); 
const Goal = require('../models/Goal.model');


// async function getGoals(userId){
//     try {
//         // ensure the user exists
//         let dbUser = await User.findById(userId);
//         if (!dbUser) {
//             return { error: "User not found" };
//         }

//         // Find user by ID without a timeout in tests
//         try {
//             // In test environment, skip the timeout promise
//             if (process.env.NODE_ENV === 'test') {
//                 dbUser = await User.findById(userId);
//             } else {
//                 // In non-test environments, use timeout to prevent hanging
//                 dbUser = await Promise.race([
//                     User.findById(userId),
//                     new Promise((_, reject) => 
//                         setTimeout(() => reject(new Error("User lookup timed out")), 3000)
//                     )
//                 ]);
//             }

//             if (!dbUser) {
//                 console.log(`User not found for id: ${userId}`);
//                 return {};
//             }
//         } catch (err) {
//             console.error("Error finding user:", err);
//             return {};
//         }

//         // Fetch goals with a timeout (except in test environment)
//         let goals;
//         try {
//             // In test environment, skip the timeout promise
//             if (process.env.NODE_ENV === 'test') {
//                 goals = await Goal.find({ user_id: userId });
//             } else {
//                 // In non-test environments, use timeout to prevent hanging
//                 goals = await Promise.race([
//                     Goal.find({ user_id: userId }),
//                     new Promise((_, reject) => 
//                         setTimeout(() => reject(new Error("Goal lookup timed out")), 3000)
//                     )
//                 ]);
//             }
//             console.log("Goals found: ", goals); 
//             if (!goals || !Array.isArray(goals)) {
//                 console.log("No goals found or invalid goal data");
//                 goals = [];
//             }
//         } catch (err) {
//             console.error("Error finding goals:", err);
//             goals = [];
//         }
//     } catch (err) {
//         console.error("Error finding goals:", err);
//     }
// }; 

async function getGoals(userId) {
    try {
        // Ensure the user exists
        let dbUser = await User.findById(userId);
        if (!dbUser) {
            return { error: "User not found" };
        }

        // Fetch goals with a timeout (except in test environment)
        let goals;
        try {
            // In test environment, skip the timeout promise
            if (process.env.NODE_ENV === 'test') {
                goals = await Goal.find({ userId }).populate('savingSubGoals.goals'); // Populate savingSubGoals field
            } else {
                // In non-test environments, use timeout to prevent hanging
                goals = await Promise.race([
                    Goal.find({ userId }).populate('savingSubGoals.goals'),  // Populate savingSubGoals
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Goal lookup timed out")), 3000)
                    )
                ]);
            }

            if (!goals || !Array.isArray(goals)) {
                console.log("No goals found or invalid goal data");
                goals = [];
            }

            console.log("Goals found: ", goals);
            return goals;
        } catch (err) {
            console.error("Error finding goals:", err);
            goals = [];
        }
    } catch (err) {
        console.error("Error finding goals:", err);
    }
};

async function getGoal(goalId){

    try {

        // Check if goalId is valid
        if (!goalId) {
            console.log("No goalId provided, returning empty object");
            return {}; 
        }

        let goal; 
        // In test environment, skip the timeout promise
        if (process.env.NODE_ENV === 'test') {
            goal = await Goal.find({ Goal_id: goalId });
        } else {
            // In non-test environments, use timeout to prevent hanging
            goal = await Promise.race([
                Goal.find({ Goal_id: goalId }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Goal lookup timed out")), 3000)
                )
            ]);
        }

        if (!goal) {
            console.log("No goals found or invalid goal data");
            goal = {};
        }
    } catch (err) {
        console.error("Error finding goals:", err);
        goal = {};
    }
}

// //getSavings(accountId, Goal.updatedAt)
// async function getSavingsForGoals(accountId, fromDate){
//     try {

//         // Check if goalId is valid
//         if (!accountId) {
//             console.log("No accountId provided, returning empty object");
//             return {}; 
//         }

//         // Convert fromDate to YYYY-MM-DD format
//         const formattedDate = fromDate.toISOString().split('T')[0];

//         // Fetch transactions with a timeout (except in test environment)
//         let transactions;
//         try {
//             // In test environment, skip the timeout promise
//             if (process.env.NODE_ENV === 'test') {
//                 transactions = await Transaction.find({
//                     account_id: accountId,
//                     date: { $gt: formattedDate },
//                 });
//             } else {
//                 transactions = await Promise.race([
//                     Transaction.find({
//                         account_id: accountId,
//                         date: { $gt: formattedDate },
//                     }),
//                     new Promise((_, reject) =>
//                         setTimeout(() => reject(new Error("Transaction lookup timed out")), 3000)
//                     )
//                 ]);
//             }

//             if (!transactions || !Array.isArray(transactions)) {
//                 console.log("No transactions found or invalid transactions data");
//                 transactions = [];
//             }
//         } catch (err) {
//             console.error("Error finding transactions:", err);
//             transactions = [];
//         }
//     } catch (err) {
//         console.error("Error finding goals:", err);
//         goal = {};
//     }

//     if (transactions.length == 0) {
//         return 0; 
//     }

//     let newTransactions = transactions.filt


// }; 

async function getTotalSavingsForGoals(accountId, fromDate) {
    try {
        if (!accountId) {
            console.log("No accountId provided, returning 0");
            return 0;
        }

        if (!(fromDate instanceof Date)) {
            console.error("Invalid fromDate: Expected a Date object");
            return 0;
        }

        // Convert fromDate to YYYY-MM-DD format
        const formattedDate = fromDate.toISOString().split('T')[0];

        let totalAmount = 0;
        try {
            if (process.env.NODE_ENV === 'test') {
                const result = await Transaction.aggregate([
                    { $match: { account_id: accountId, date: { $gt: formattedDate } } },
                    { $group: { _id: null, total: { $sum: "$amount" } } }
                ]);
                totalAmount = result.length ? result[0].total : 0;
            } else {
                const result = await Promise.race([
                    Transaction.aggregate([
                        { $match: { account_id: accountId, date: { $gt: formattedDate } } },
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ]),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Transaction lookup timed out")), 3000)
                    )
                ]);
                totalAmount = result.length ? result[0].total : 0;
            }
        } catch (err) {
            console.error("Error finding transactions:", err);
        }

        return totalAmount;
    } catch (err) {
        console.error("Error processing request:", err);
        return 0;
    }
}

async function getTotalSpendingForGoals(accountId, fromDate) {
    try {
        if (!accountId) {
            console.log("No accountId provided, returning an empty object");
            return {};
        }

        if (!(fromDate instanceof Date)) {
            console.error("Invalid fromDate: Expected a Date object");
            return {};
        }

        // Convert fromDate to YYYY-MM-DD format
        const formattedDate = fromDate.toISOString().split('T')[0];

        let totalByCategory = {};
        try {
            if (process.env.NODE_ENV === 'test') {
                const result = await Transaction.aggregate([
                    { $match: { account_id: accountId, date: { $gt: formattedDate } } },
                    { $unwind: "$category" }, // Unwind the categories array
                    { $group: { _id: "$category", total: { $sum: "$amount" } } },
                ]);
                result.forEach((categoryData) => {
                    totalByCategory[categoryData._id] = categoryData.total;
                });
            } else {
                const result = await Promise.race([
                    Transaction.aggregate([
                        { $match: { account_id: accountId, date: { $gt: formattedDate } } },
                        { $unwind: "$category" }, // Unwind the categories array
                        { $group: { _id: "$category", total: { $sum: "$amount" } } },
                    ]),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Transaction lookup timed out")), 3000)
                    )
                ]);

                result.forEach((categoryData) => {
                    totalByCategory[categoryData._id] = categoryData.total;
                });
            }
        } catch (err) {
            console.error("Error finding transactions:", err);
        }

        return totalByCategory;
    } catch (err) {
        console.error("Error processing request:", err);
        return {};
    }
}



//getSpending([account.id]], Goal.updatedAt)
async function getSpendingForGoals(accountIds, fromDate) {
    try {
        let aggregatedSpending = {};

        // Call getTotalSpendingForGoals for each accountId and aggregate the results by category
        for (let accountId of accountIds) {
            const totalByCategory = await getTotalSpendingForGoals(accountId, fromDate);

            // Aggregate spending by category across all accounts
            for (let category in totalByCategory) {
                if (aggregatedSpending[category]) {
                    aggregatedSpending[category] += totalByCategory[category];
                } else {
                    aggregatedSpending[category] = totalByCategory[category];
                }
            }
        }

        return aggregatedSpending;
    } catch (err) {
        console.error("Error processing spending for goals:", err);
        return {};
    }
}


async function addSubGoalToGoal(goalId, subgoalData) {
    try {
      const goal = await Goal.findById(goalId);
      if (!goal) {
        console.log("Goal not found");
        return;
      }
  
      // Add new goal to the goals array
      goal.savingSubGoals.push(subgoalData);
  
      // Save the updated user document
      await goal.save();
      console.log("Subgoal added successfully:", subgoalData);
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  }
  



module.exports = { getGoals, getGoal, getTotalSpendingForGoals, getSpendingForGoals, addSubGoalToGoal, getTotalSavingsForGoals };