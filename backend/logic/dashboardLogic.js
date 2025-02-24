import { mongo } from "./backend/server.js"; 
import { getAuth } from "firebase/auth";

const User =  "./models/User.model.js"
const Transactions =  "./models/transaction.model.js"



// get user and transactions from db 
const auth = getAuth(); 
const user = auth.currentUser; 
var todaySpending = 0; 
var recentList; 
var balance = 0; 
var monthlySpending; 
var oneYearAgo; 

if (user != null) {
    const dbUser = await User.findOne({'firebaseUid': user.uid}).exec(); 
    if ( dbUser != null ) {
        const transactions = await dbUser.select('transactions').exec(); 
        const recentTransactions = await transactions.sort('datetime', 'asc').limit(20).exec();
        const todayTransactions = await transactions.where('date').equals(formatDateISO(Date.now())).exec(); 
        
        oneYearAgo = Date.now().getFullYear() - 1; 
        oneYearAgo =+ "-" + (Date.now().getUTCMonth() + 1) + "-" + Date.now().getDate(); 

        const yearTransactions = await transactions.where('date').gte(oneYearAgo).lte(formatDateISO(Date.now())).exec(); 

        //sum today's transactions
        if (todayTransactions){
            todayTransactions.forEach(element => {
                todaySpending =+ element.amount; 
            });
        }

        // take transaction details for recent list
        recentTransactions.forEach(element => {
            recentList =+ {
                "amount": element.amount, 
                "name": element.name, 
                "category": element.category[1]
                
            }
        }); 

        // finding monthly spending totals
        var monthAmount = 0; 
        var currentMonth; 
        var currentYear; 
        var start; 
        var end; 
        var monthlyTransactions; 

        // getUTCMonth is month-1 => 11 is December
        // start getting spending in the previous year first
        currentMonth = Date.now().getUTCMonth(); 
        currentYear = Date.now().getFullYear() -1;
        for (var i = 0; i<12; i++){
            monthAmount = 0; 
            //set date range
            start = currentYear + "-" + (currentMonth+1) + "-" + 1; 
            currentMonth = (currentMonth+1)%12; 
            if(currentMonth%12 ==0){
                currentYear++; 
            }
            end = currentYear + "-" + (currentMonth+1) + "-" + 1;

            //get month of transactions
            monthlyTransactions = await transactions.where('date').gte(start).lt(end).exec();  
            monthlyTransactions.forEach(element => {
                monthAmount =+ element.amount; 
            });

            //add monthly data
            monthlySpending =+ {"month": currentMonth, "amount": monthAmount}; 
             
        }
        

    } else {
        console.log('no user in db'); 
    }

} else {
    console.log('no current user'); 
}

const formatDateISO = (date) => {
    // Convert the date to ISO string
    const isoString = date.toISOString();
    // Split at the "T" character to get the date part
    const formattedDate = isoString.split("T")[0];
    return formattedDate;
};

function getDashboardRecentTransactions(){
    return recentList; 
}; 

function getDashboardMonthlySpending(){
    return monthlySpending; 
}

function getDashboardTodaysSpending(){
    return todaySpending; 
}

function getDashboardAccountBalance(){
    return balance; 
}