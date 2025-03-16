const express = require('express');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { Products } = require('plaid');
const { saveTransaction } = require('../models/transaction.model');
const User = require('../models/User.model');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

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
    const publicToken = req.body.public_token;
    const Account = require('../models/Account.model');

    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = tokenResponse.data.access_token;
    const itemId = tokenResponse.data.item_id;

    // Store tokens in user document
    await User.findByIdAndUpdate(req.user._id, {
      plaidAccessToken: accessToken,
      plaidItemId: itemId,
    });

    // Now fetch and store the accounts
    const accountsResponse = await client.accountsGet({
      access_token: accessToken,
    });

    const plaidAccounts = accountsResponse.data.accounts;
    const createdAccounts = [];

    // Save each account from Plaid
    for (const plaidAccount of plaidAccounts) {
      try {
        // Check if this account already exists by plaid_account_id
        let existingAccount = await Account.findOne({
          plaid_account_id: plaidAccount.account_id
        });

        if (!existingAccount) {
          // Create a new account
          const newAccount = new Account({
            user_id: req.user._id,
            name: plaidAccount.name,
            type: 'plaid',
            balance: plaidAccount.balances.current || 0,
            currency: plaidAccount.balances.iso_currency_code || 'USD',
            institution: req.body.institution || '',
            plaid_account_id: plaidAccount.account_id,
            plaid_item_id: itemId,
            plaid_mask: plaidAccount.mask || '',
            plaid_subtype: plaidAccount.subtype || '',
          });

          await newAccount.save();
          createdAccounts.push(newAccount);
        } else {
          // Update the existing account
          existingAccount.balance = plaidAccount.balances.current || 0;
          existingAccount.updated_at = Date.now();
          await existingAccount.save();
          createdAccounts.push(existingAccount);
        }
      } catch (accountError) {
        console.error('Error saving Plaid account:', accountError);
        // Continue with other accounts even if one fails
      }
    }

    res.json({
      status: 'success',
      message: 'Access token and accounts stored successfully',
      accounts: createdAccounts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

// Update accounts route
router.get('/accounts', auth, async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    const user = await User.findById(req.user._id);

    if (!user?.plaidAccessToken) {
      return res.status(400).json({ error: 'No Plaid access token found' });
    }

    const accountsResponse = await client.accountsGet({
      access_token: user.plaidAccessToken,
    });

    res.json(accountsResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

// Update auth route similarly
router.get('/auth', auth, async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    const user = await User.findById(req.user._id);

    if (!user?.plaidAccessToken) {
      return res.status(400).json({ error: 'No Plaid access token found' });
    }

    const authResponse = await client.authGet({
      access_token: user.plaidAccessToken,
    });

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

    // Get user's access token
    const user = await User.findById(req.user._id);
    if (!user?.plaidAccessToken) {
      return res.status(400).json({ error: 'No Plaid access token found' });
    }

    let cursor = null;
    let added = [];
    let modified = [];
    let removed = [];
    let hasMore = true;

    // Iterate through each page of new transaction updates
    while (hasMore) {
      const syncResponse = await client.transactionsSync({
        access_token: user.plaidAccessToken,
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

    // The enhanced saveTransaction function now checks for duplicates based on 
    // transaction_id and also date+name+amount combination, so we can pass all
    // transactions directly to it
    
    // Get the accounts mapping first
    const Account = require('../models/Account.model');
    const plaidAccounts = await Account.find({
      user_id: req.user._id,
      type: 'plaid',
      is_active: true,
    });
    
    // Create a mapping from Plaid account_id to our internal account _id
    const accountMapping = {};
    plaidAccounts.forEach(account => {
      if (account.plaid_account_id) {
        accountMapping[account.plaid_account_id] = account._id;
      }
    });
    
    // Save transactions to database with proper account references using batch processing
    console.log(`Processing ${recently_added.length} transactions from Plaid...`);
    
    // Filter out transactions without a matching account
    const validTransactions = recently_added.filter(transaction => {
      const plaidAccountId = transaction.account_id;
      const internalAccountId = accountMapping[plaidAccountId];
      
      if (!internalAccountId) {
        console.log(`Warning: No matching account found for Plaid account ${plaidAccountId}`);
        return false;
      }
      
      // Ensure each transaction has a category (Plaid sometimes returns null)
      if (!transaction.category || !Array.isArray(transaction.category) || transaction.category.length === 0) {
        transaction.category = ['Uncategorized'];
      }
      
      return true;
    });
    
    // Use the new batch processing function for better performance
    const { saveTransactionsBatch } = require('../models/transaction.model');
    const result = await saveTransactionsBatch(validTransactions, req.user._id, accountMapping);
    
    const savedCount = result.saved;
    const duplicateCount = result.duplicates;
    
    console.log(`Transactions: ${savedCount} saved, ${duplicateCount} duplicates prevented, ${result.errors} errors`);

    console.log(`Successfully saved ${savedCount} unique transactions`);

    res.json({
      latest_transactions: recently_added.slice(0, Math.min(10, recently_added.length)), // Just send a preview of transactions
      message: `${savedCount} transactions saved to database (${duplicateCount} duplicates skipped)`,
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

router.post('/disconnect', auth, async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    const user = await User.findById(req.user._id);
    const { Transaction } = require('../models/transaction.model');
    const Account = require('../models/Account.model');

    if (!user?.plaidAccessToken) {
      return res.status(400).json({ error: 'No Plaid access token found' });
    }

    // First, get all accounts for the Plaid connection
    const accountsResponse = await client.accountsGet({
      access_token: user.plaidAccessToken,
    });
    
    // Extract Plaid account IDs
    const plaidAccountIds = accountsResponse.data.accounts.map(account => account.account_id);
    
    // Find our internal accounts that correspond to these Plaid accounts
    const accounts = await Account.find({
      user_id: req.user._id,
      plaid_account_id: { $in: plaidAccountIds }
    });
    
    const accountIds = accounts.map(account => account._id);
    
    // Remove all transactions associated with these accounts
    const deleteResult = await Transaction.deleteMany({
      user_id: req.user._id,
      account_id: { $in: accountIds }
    });
    
    console.log(`Deleted ${deleteResult.deletedCount} transactions from disconnected accounts`);

    // Mark accounts as inactive or delete them based on preference
    // Here we'll mark them as inactive
    const accountUpdateResult = await Account.updateMany(
      { _id: { $in: accountIds } },
      { is_active: false }
    );
    
    console.log(`Updated ${accountUpdateResult.modifiedCount} Plaid accounts to inactive status`);

    // Remove the Item from Plaid
    await client.itemRemove({
      access_token: user.plaidAccessToken,
    });

    // Clear Plaid credentials from user document
    await User.findByIdAndUpdate(req.user._id, {
      $unset: {
        plaidAccessToken: 1,
        plaidItemId: 1,
      },
    });

    res.json({
      status: 'success',
      message: `Account disconnected successfully. Removed ${deleteResult.deletedCount} associated transactions.`,
    });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    res.status(500).json({ error: error.toString() });
  }
});

module.exports = router;
