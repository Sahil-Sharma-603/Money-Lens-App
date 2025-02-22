const express = require('express');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { Products } = require('plaid');
const { saveTransaction } = require('../models/transaction.model');
const auth = require('../middleware/auth.middleware');

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
router.post('/create_link_token', auth, async (req, res) => {
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
        start_date: moment().subtract(730, 'days').format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD'),
      };
    }
    if (PLAID_PRODUCTS.includes(Products.Transactions)) {
      configs.transactions = {
        days_requested: 730,
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
router.post('/set_access_token', auth, async (req, res) => {
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
router.get('/accounts', auth, async (req, res) => {
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
router.get('/auth', auth, async (req, res) => {
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

//Retrieve Transacstions for an Item using transactionsSync
router.get('/transactions', auth, async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    let cursor = null;
    let added = [];
    let modified = [];
    let removed = [];
    let hasMore = true;

    // Iterate through each page of new transaction updates
    while (hasMore) {
      const syncResponse = await client.transactionsSync({
        access_token: ACCESS_TOKEN,
        cursor: cursor,
      });
      const data = syncResponse.data;
      cursor = data.next_cursor;
      // If no new transactions yet, wait and poll again
      if (cursor === '') {
        await sleep(2000);
        continue;
      }
      // Aggregate results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      hasMore = data.has_more;

      prettyPrintResponse(syncResponse);
    }

    // Sort transactions by date
    const compareTxnsByDateAscending = (a, b) =>
      (a.date < b.date) - (a.date > b.date);
    const recently_added = [...added].sort(compareTxnsByDateAscending);

    // Save all transactions to database
    const savePromises = recently_added.map((transaction) =>
      saveTransaction(transaction, req.user._id)
    );
    await Promise.all(savePromises);

    console.log(`Successfully saved ${recently_added.length} transactions`);

    res.json({
      latest_transactions: recently_added,
      message: `${recently_added.length} transactions saved to database`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

// // Fetch historical transactions using transactionsGet
// router.get('/transactions/historical', auth, async (req, res) => {
//   try {
//     const client = req.app.locals.plaidClient;

//     // Define the date range for historical transactions (up to 24 months)
//     const startDate = moment().subtract(24, 'months').format('YYYY-MM-DD');
//     const endDate = moment().format('YYYY-MM-DD');

//     // Fetch historical transactions
//     const historicalResponse = await client.transactionsGet({
//       access_token: ACCESS_TOKEN,
//       start_date: startDate,
//       end_date: endDate,
//     });

//         // Log the values for debugging
//       console.log('ACCESS_TOKEN:', ACCESS_TOKEN);
//       console.log('startDate:', startDate, 'endDate:', endDate);

//     prettyPrintResponse(historicalResponse);
//     res.json(historicalResponse.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.toString() });
//   }
// });

// // Webhook to handle SYNC_UPDATES_AVAILABLE
router.post('/webhook', auth, async (req, res) => {
  try {
    const { webhook_type, webhook_code, item_id } = req.body;

    if (
      webhook_type === 'TRANSACTIONS' &&
      webhook_code === 'SYNC_UPDATES_AVAILABLE'
    ) {
      console.log(`New transactions available for item: ${item_id}`);

      // Fetch new transactions
      const transactionsResponse = await fetch(
        'http://localhost:5001/api/plaid/transactions',
        {
          method: 'GET',
        }
      );
      const transactionsData = await transactionsResponse.json();
      console.log('New transactions:', transactionsData);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

module.exports = router;
