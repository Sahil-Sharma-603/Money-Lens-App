const express = require('express');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { Products } = require('plaid');

const router = express.Router();

// TODO: "FIX THIS"
let ACCESS_TOKEN = null;
let ITEM_ID = null;
let PUBLIC_TOKEN = null;

// Helper for logging responses
const prettyPrintResponse = (response) => {
  console.log(JSON.stringify(response.data, null, 2));
};

// Helper to pause execution for a given number of milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Create a link token configuration endpoint
router.post('/create_link_token', async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    const PLAID_PRODUCTS = (
      process.env.PLAID_PRODUCTS || Products.Transactions
    ).split(',');
    const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
      ','
    );
    const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';
    const PLAID_ANDROID_PACKAGE_NAME =
      process.env.PLAID_ANDROID_PACKAGE_NAME || '';

    const configs = {
      user: {
        // Use a generated UUID for a unique client_user_id.
        client_user_id: uuidv4(),
      },
      client_name: 'Money-Lens App',
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: 'en',
    };

    if (PLAID_REDIRECT_URI !== '') {
      configs.redirect_uri = PLAID_REDIRECT_URI;
    }
    if (PLAID_ANDROID_PACKAGE_NAME !== '') {
      configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
    }
    if (PLAID_PRODUCTS.includes(Products.Statements)) {
      // Optionally include statements configuration.
      configs.statements = {
        start_date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
      };
    }

    const responseToken = await client.linkTokenCreate(configs);
    prettyPrintResponse(responseToken);
    res.json(responseToken.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

// Exchange a public token for an access token
router.post('/set_access_token', async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    PUBLIC_TOKEN = req.body.public_token;
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: PUBLIC_TOKEN,
    });
    prettyPrintResponse(tokenResponse);
    ACCESS_TOKEN = tokenResponse.data.access_token;
    ITEM_ID = tokenResponse.data.item_id;
    res.json({
      access_token: ACCESS_TOKEN,
      item_id: ITEM_ID,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

// Retrieve Item's accounts
router.get('/accounts', async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    const accountsResponse = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(accountsResponse);
    res.json(accountsResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

// Retrieve ACH or ETF Auth data for an Item's accounts
router.get('/auth', async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    const authResponse = await client.authGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(authResponse);
    res.json(authResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});



// //Retrieve Transactions for an Item using transactionsSync
// router.get('/transactions', async (req, res) => {
//   try {
//     const client = req.app.locals.plaidClient;
//     let cursor = null;
//     let added = [];
//     let modified = [];
//     let removed = [];
//     let hasMore = true;

//     // Iterate through each page of new transaction updates
//     while (hasMore) {
//       const syncResponse = await client.transactionsSync({
//         access_token: ACCESS_TOKEN,
//         cursor: cursor,
//       });
//       const data = syncResponse.data;
//       cursor = data.next_cursor;
//       // If no new transactions yet, wait and poll again
//       if (cursor === '') {
//         await sleep(2000);
//         continue;
//       }
//       // Aggregate results
//       added = added.concat(data.added);
//       modified = modified.concat(data.modified);
//       removed = removed.concat(data.removed);
//       hasMore = data.has_more;

//       prettyPrintResponse(syncResponse);
//     }

//     // Sort and return the 8 most recent transactions
//     const compareTxnsByDateAscending = (a, b) =>
//       (a.date > b.date) - (a.date < b.date);
//     const recently_added = [...added]
//       .sort(compareTxnsByDateAscending)
//       .slice(-8);
//     res.json({ latest_transactions: recently_added });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.toString() });
//   }
// });

// Function to get 8 latest transactions and upto 24 months data 
router.get('/transactions', async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    let cursor = null;
    let allTransactions = [];
    let hasMore = true;

    // Paginate through all available transactions
    while (hasMore) {
      const syncResponse = await client.transactionsSync({
        access_token: ACCESS_TOKEN,
        cursor: cursor,
      });
      const data = syncResponse.data;
      // Aggregate new transactions from the "added" array
      allTransactions = allTransactions.concat(data.added);
      cursor = data.next_cursor;
      hasMore = data.has_more;

      // Optional: log each sync response for debugging
      prettyPrintResponse(syncResponse);
    }

    // Filter transactions to include only those from the last 24 months
    const twentyFourMonthsAgo = moment().subtract(24, 'months');
    const filteredTransactions = allTransactions.filter((single_transaction) =>
      moment(single_transaction.date).isAfter(twentyFourMonthsAgo)
    );

    // Sort the filtered transactions by date in ascending order
    // const sortedTransactions = filteredTransactions.sort((a, b) =>
    //   (a.date > b.date) ? 1 : (a.date < b.date) ? -1 : 0
    // );
    const compareTxnsByDateAscending = (a, b) =>
      (a.date > b.date) - (a.date < b.date);
    
    const sortedTransactions = filteredTransactions.sort(compareTxnsByDateAscending);
    

    // Get the 8 most recent transactions
    const latest_transactions = sortedTransactions.slice(-8);

    // Return both the full 24-month history and the latest 8 transactions
    res.json({
      full_transactions: filteredTransactions,
      latest_transactions: latest_transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});



module.exports = router;
