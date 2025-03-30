// const Goals = require('../models/Goal.model'); 
const User = require('../models/User.model'); 
const Transaction = require('../models/Transaction.model'); 
const Account = require('../models/Account.model'); 

const { Goal, SubGoal } = require('../models/Goal.model');



async function getGoals(userId) {
    try {
        // Ensure the user exists
        let dbUser = await User.findById(userId);
        if (!dbUser) {
            return { error: "User not found for id", userId };
        }

        // Fetch goals with a timeout (except in test environment)
        let goals;
        try {
            // In test environment, skip the timeout promise
            if (process.env.NODE_ENV === 'test') {


                console.log("Goal Model:", Goal);
                console.log("Goal.find:", typeof Goal.find);
                
                
                goals = await Goal.find({ userId }).populate('subGoals');

            } else {
                // In non-test environments, use timeout to prevent hanging
                console.log("Goal Model:", Goal);
                    console.log("Goal.find:", typeof Goal.find);
                goals = await Promise.race([
                    
                    Goal.find({ userId }).populate('subGoals'),  // Populate SubSavingGoal
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

            updateSavingGoals(goals);
            updateSpendingGoals(goals);

            return {
                goals, 

            };
        } catch (err) {
            console.error("Error finding goals:", err);
            // goals = [];
            return [];
        }
    } catch (err) {
        console.error("Error finding goals:", err);
        return [];
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

async function updateSavingGoals(goals) {
    try {
        if (!goals || goals.length === 0) {
            return;
        }

        // Get the saving goals
        const savingsGoals = goals.filter(goal => goal.type === "Savings");

        // Iterate over each savings goal and update it
        for (const goal of savingsGoals) {
            const totalSavings = await getTotalSavingsForGoal(goal);
            await updateSubGoalAmount(totalSavings, goal);

            // Optionally, update the `updatedAt` field of the goal
            goal.updatedAt = new Date();
            await goal.save();  // Assuming goal is a Mongoose model instance
        }
    } catch (error) {
        console.error("Error updating saving goals:", error);
    }
}


async function updateSubGoalAmount(totalSavingsForGoal, goal) {
    try {
        console.log("Total Savings for to update subgoals:", totalSavingsForGoal);
        console.log("Goal:", goal);
        if (totalSavingsForGoal === 0 || !goal || !goal.subGoals || goal.subGoals.length === 0) {
            return;
        }
        const goalPortion = totalSavingsForGoal/goal.subGoals.length;

        let validSubGoals = goal.subGoals.filter(subGoal => subGoal !== null);
        console.log("Valid Subgoals:", validSubGoals);

        console.log("Goal Portion:", goalPortion);
        validSubGoals = await Promise.all(
            validSubGoals.map(async (subGoal) => {
                if (subGoal && subGoal.currentAmount === undefined) {
                    subGoal.currentAmount = 0;
                }
                subGoal.currentAmount += goalPortion;
                console.log("Subgoal current amount:", subGoal.currentAmount);
                
                // await subGoal.save(); // Ensure each subGoal is saved
                
                return subGoal; // RETURN the updated subGoal
            })
        );

        console.log("Updated Sub-Goals:", validSubGoals);
        await goal.save(); 
        console.log("Updated goal", goal);
        return goal.subGoals; // Return updated sub-goals if needed
    } catch (error) {
        console.error("Error updating subgoal amount", error);
    }
}

async function updateSpendingGoals(goals) {
    try {
        if (!goals || goals.length === 0) {
            return;
        }
        // Get the spending goals
        const spendingGoals = goals.filter(goal => goal.type === "Spending Limit");
        // Iterate over each spending goal and update it
        for (const goal of spendingGoals) {
            const totalSpending = await getTotalSpendingForGoals(goal.accountId, goal.updatedAt, goal.category);
            goal.currentAmount += totalSpending;
            // Optionally, update the `updatedAt` field of the goal


            goal.updatedAt = new Date();
            await goal.save();  // Assuming goal is a Mongoose model instance
        }
    } catch (error) {
        console.error("Error updating spending goals:", error);
    }
}


async function getTotalSavingsForGoal(goal) {
    try {
        if (!goal || !goal.accountId || goal.accountId.length === 0) {
            console.log("No accounts linked to the goal, returning 0");
            return 0;
        }

        if (!(goal.updatedAt instanceof Date)) {
            console.error("Invalid updatedAt date: Expected a Date object");
            return 0;
        }

        // Convert updatedAt to YYYY-MM-DD format for comparison
        const formattedDate = goal.updatedAt.toISOString().split('T')[0];

        let totalAmount = 0;

        try {
            if (process.env.NODE_ENV === 'test') {
                const result = await Transaction.aggregate([
                    { 
                        $match: { 
                            account_id: { $in: goal.accountId },  // Match transactions from any linked account
                            date: { $gt: formattedDate }  // Transactions after the goal was last updated
                        }
                    },
                    { $group: { _id: null, total: { $sum: "$amount" } } } // Sum all matching transactions
                ]);
                totalAmount = result.length ? result[0].total : 0;
            } else {
                const result = await Promise.race([
                    Transaction.aggregate([
                        { 
                            $match: { 
                                account_id: { $in: goal.accountId }, 
                                date: { $gt: formattedDate }
                            } 
                        },
                        { $group: { _id: null, total: { $sum: "$amount" } } }
                    ]),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Transaction lookup timed out")), 3000)
                    )
                ]);
                totalAmount = result.length ? result[0].total : 0;
            }

            goal.currentAmount += totalAmount; 
        } catch (err) {
            console.error("Error finding transactions:", err);
        }

        return totalAmount;
    } catch (err) {
        console.error("Error processing request:", err);
        return 0;
    }
}



module.exports = { getGoals, getGoal, updateSavingGoals, updateSpendingGoals, getTotalSavingsForGoal, updateSubGoalAmount };