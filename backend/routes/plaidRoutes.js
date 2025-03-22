const express = require('express');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const { Products } = require('plaid');
const { Transaction, saveTransactionsBatch } = require('../models/Transaction.model');
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

    // Get the base url for webhook
    const WEBHOOK_URL = process.env.WEBHOOK_URL || `http://localhost:${process.env.PORT || 5001}/api/plaid/webhook`;
    
    const configs = {
      user: {
        // Use a generated UUID for a unique client_user_id.
        client_user_id: uuidv4(),
      },
      client_name: 'Money-Lens App',
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: 'en',
      webhook: WEBHOOK_URL, // Add webhook URL for transaction updates
    };

    if (PLAID_ANDROID_PACKAGE_NAME !== '') {
      configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
    }
    if (PLAID_PRODUCTS.includes(Products.Statements)) {
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

    // Fetch and store the accounts
    const accountsResponse = await client.accountsGet({
      access_token: accessToken,
    });

    const plaidAccounts = accountsResponse.data.accounts;
    const createdAccounts = [];

    for (const plaidAccount of plaidAccounts) {
      try {
        let existingAccount = await Account.findOne({
          plaid_account_id: plaidAccount.account_id
        });

        if (!existingAccount) {
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
          existingAccount.balance = plaidAccount.balances.current || 0;
          existingAccount.updated_at = Date.now();
          await existingAccount.save();
          createdAccounts.push(existingAccount);
        }
      } catch (accountError) {
        console.error('Error saving Plaid account:', accountError);
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

// Update auth route
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

// Retrieve Transactions for an Item using transactionsSync
router.get('/transactions', auth, async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;

    const user = await User.findById(req.user._id);
    if (!user?.plaidAccessToken) {
      return res.status(400).json({ error: 'No Plaid access token found' });
    }

    let cursor = null;
    let added = [];
    let modified = [];
    let removed = [];
    let hasMore = true;

    while (hasMore) {
      const syncResponse = await client.transactionsSync({
        access_token: user.plaidAccessToken,
        cursor: cursor,
      });
      const data = syncResponse.data;
      cursor = data.next_cursor;
      if (cursor === '') {
        await sleep(2000);
        continue;
      }
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      hasMore = data.has_more;

      prettyPrintResponse(syncResponse);
    }

    const compareTxnsByDateAscending = (a, b) => (a.date < b.date) - (a.date > b.date);
    const recently_added = [...added].sort(compareTxnsByDateAscending);

    const Account = require('../models/Account.model');
    const plaidAccounts = await Account.find({
      user_id: req.user._id,
      type: 'plaid',
      is_active: true,
    });
    
    const accountMapping = {};
    plaidAccounts.forEach(account => {
      if (account.plaid_account_id) {
        accountMapping[account.plaid_account_id] = account._id;
      }
    });
    
    console.log(`Processing ${recently_added.length} transactions from Plaid...`);
    
    const validTransactions = recently_added.filter(transaction => {
      const plaidAccountId = transaction.account_id;
      const internalAccountId = accountMapping[plaidAccountId];
      
      if (!internalAccountId) {
        console.log(`Warning: No matching account found for Plaid account ${plaidAccountId}`);
        return false;
      }
      
      if (!transaction.category || !Array.isArray(transaction.category) || transaction.category.length === 0) {
        transaction.category = ['Uncategorized'];
      }
      
      return true;
    });
    
    console.log('saveTransactionsBatch type:', typeof saveTransactionsBatch);
    const result = await saveTransactionsBatch(validTransactions, req.user._id, accountMapping);
    
    const savedCount = result.saved;
    const duplicateCount = result.duplicates;
    
    console.log(`Transactions: ${savedCount} saved, ${duplicateCount} duplicates prevented, ${result.errors} errors`);
    console.log(`Successfully saved ${savedCount} unique transactions`);

    res.json({
      latest_transactions: recently_added.slice(0, Math.min(10, recently_added.length)),
      message: `${savedCount} transactions saved to database (${duplicateCount} duplicates skipped)`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

// Fetch historical transactions using transactionsGet - up to 24 months
router.get('/transactions/historical', auth, async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    
    const user = await User.findById(req.user._id);
    if (!user?.plaidAccessToken) {
      return res.status(400).json({ error: 'No Plaid access token found' });
    }

    const startDate = moment().subtract(24, 'months').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');

    const Account = require('../models/Account.model');
    const plaidAccounts = await Account.find({
      user_id: req.user._id,
      type: 'plaid',
      is_active: true,
    });
    
    const accountMapping = {};
    plaidAccounts.forEach(account => {
      if (account.plaid_account_id) {
        accountMapping[account.plaid_account_id] = account._id;
      }
    });

    console.log(`Fetching historical transactions from ${startDate} to ${endDate}`);
    
    let hasMore = true;
    let offset = 0;
    const batchSize = 500;
    let totalFetched = 0;
    let allTransactions = [];
    
    while (hasMore) {
      const historicalResponse = await client.transactionsGet({
        access_token: user.plaidAccessToken,
        start_date: startDate,
        end_date: endDate,
        options: { count: batchSize, offset: offset },
      });
      
      const data = historicalResponse.data;
      const transactions = data.transactions || [];
      
      allTransactions = allTransactions.concat(transactions);
      
      hasMore = transactions.length === batchSize;
      offset += transactions.length;
      totalFetched += transactions.length;
      
      console.log(`Fetched batch of ${transactions.length} transactions, total: ${totalFetched}`);
      
      if (transactions.length > 0) {
        const validTransactions = transactions.filter(transaction => {
          const plaidAccountId = transaction.account_id;
          const internalAccountId = accountMapping[plaidAccountId];
          
          if (!internalAccountId) {
            console.log(`Warning: No matching account found for Plaid account ${plaidAccountId}`);
            return false;
          }
          
          if (!transaction.category || !Array.isArray(transaction.category) || transaction.category.length === 0) {
            transaction.category = ['Uncategorized'];
          }
          
          return true;
        });
        
        const batchResult = await saveTransactionsBatch(validTransactions, req.user._id, accountMapping);
        console.log(`Batch result: ${batchResult.saved} saved, ${batchResult.duplicates} duplicates`);
      }
    }

    res.json({
      success: true,
      total_transactions: totalFetched,
      message: `Successfully processed ${totalFetched} historical transactions`
    });
  } catch (error) {
    console.error('Error fetching historical transactions:', error);
    res.status(500).json({ error: error.toString() });
  }
});

// Webhook endpoint to handle Plaid webhooks - no auth required
router.post('/webhook', async (req, res) => {
  try {
    console.log('Received webhook from Plaid:', JSON.stringify(req.body));
    const { webhook_type, webhook_code, item_id } = req.body;

    console.log(`Plaid Webhook: ${webhook_type} - ${webhook_code} for item ${item_id}`);

    if (webhook_type === 'TRANSACTIONS') {
      if (webhook_code === 'SYNC_UPDATES_AVAILABLE') {
        console.log(`Transaction updates available for item: ${item_id}`);

        const user = await User.findOne({ plaidItemId: item_id });
        
        if (!user) {
          console.error(`No user found with plaidItemId: ${item_id}`);
          return res.status(200).json({ status: 'ok', message: 'No matching user found' });
        }

        const client = req.app.locals.plaidClient;
        
        let cursor = null;
        let added = [];
        let modified = [];
        let removed = [];
        let hasMore = true;

        while (hasMore) {
          const syncResponse = await client.transactionsSync({
            access_token: user.plaidAccessToken,
            cursor: cursor,
          });
          
          const data = syncResponse.data;
          cursor = data.next_cursor;
          
          if (cursor === '') {
            await sleep(1000);
            continue;
          }
          
          added = added.concat(data.added);
          modified = modified.concat(data.modified);
          removed = removed.concat(data.removed);
          hasMore = data.has_more;
        }

        if (added.length > 0 || modified.length > 0) {
          console.log(`Webhook sync found: ${added.length} new, ${modified.length} modified transactions`);
          
          const Account = require('../models/Account.model');
          const plaidAccounts = await Account.find({
            user_id: user._id,
            type: 'plaid',
            is_active: true,
          });
          
          const accountMapping = {};
          plaidAccounts.forEach(account => {
            if (account.plaid_account_id) {
              accountMapping[account.plaid_account_id] = account._id;
            }
          });
          
          if (added.length > 0) {
            const validTransactions = added.filter(transaction => {
              const plaidAccountId = transaction.account_id;
              const internalAccountId = accountMapping[plaidAccountId];
              
              if (!internalAccountId) {
                return false;
              }
              
              if (!transaction.category || !Array.isArray(transaction.category) || transaction.category.length === 0) {
                transaction.category = ['Uncategorized'];
              }
              
              return true;
            });
            
            const result = await saveTransactionsBatch(validTransactions, user._id, accountMapping);
            console.log(`Webhook processed: ${result.saved} saved, ${result.duplicates} duplicates`);
          }
        }
      } 
      else if (webhook_code === 'HISTORICAL_UPDATE') {
        console.log(`Historical transactions available for item: ${item_id}`);
        
        const user = await User.findOne({ plaidItemId: item_id });
        
        if (user) {
          console.log(`Scheduling historical transaction fetch for user: ${user._id}`);
          
          setTimeout(async () => {
            try {
              const client = req.app.locals.plaidClient;
              console.log(`Starting historical transaction fetch for user: ${user._id}`);
              
              const startDate = moment().subtract(24, 'months').format('YYYY-MM-DD');
              const endDate = moment().format('YYYY-MM-DD');
              
              // Historical fetching logic could be added here if needed
            } catch (err) {
              console.error('Error processing historical webhook:', err);
            }
          }, 5000);
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ status: 'ok' });
  }
});

// Disconnect Plaid account
router.post('/disconnect', auth, async (req, res) => {
  try {
    const client = req.app.locals.plaidClient;
    const user = await User.findById(req.user._id);
    const Account = require('../models/Account.model');

    if (!user?.plaidAccessToken) {
      return res.status(400).json({ error: 'No Plaid access token found' });
    }

    const accountsResponse = await client.accountsGet({
      access_token: user.plaidAccessToken,
    });
    
    const plaidAccountIds = accountsResponse.data.accounts.map(account => account.account_id);
    
    const accounts = await Account.find({
      user_id: req.user._id,
      plaid_account_id: { $in: plaidAccountIds }
    });
    
    const accountIds = accounts.map(account => account._id);
    
    const deleteResult = await Transaction.deleteMany({
      user_id: req.user._id,
      account_id: { $in: accountIds }
    });
    
    console.log(`Deleted ${deleteResult.deletedCount} transactions from disconnected accounts`);

    const accountUpdateResult = await Account.updateMany(
      { _id: { $in: accountIds } },
      { is_active: false }
    );
    
    console.log(`Updated ${accountUpdateResult.modifiedCount} Plaid accounts to inactive status`);

    await client.itemRemove({
      access_token: user.plaidAccessToken,
    });

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
