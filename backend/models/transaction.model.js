const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    address: String,
    city: String,
    country: String,
    lat: Number,
    lon: Number,
    postal_code: String,
    region: String,
    store_number: String,
  },
  { _id: false }
);

const paymentMetaSchema = new mongoose.Schema(
  {
    by_order_of: String,
    payee: String,
    payer: String,
    payment_method: String,
    payment_processor: String,
    ppd_id: String,
    reason: String,
    reference_number: String,
  },
  { _id: false }
);

const personalFinanceCategorySchema = new mongoose.Schema(
  {
    confidence_level: String,
    detailed: String,
    primary: String,
  },
  { _id: false }
);

const counterpartySchema = new mongoose.Schema(
  {
    confidence_level: String,
    entity_id: String,
    logo_url: String,
    name: String,
    phone_number: String,
    type: String,
    website: String,
  },
  { _id: false }
);

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  account_owner: String,
  amount: {
    type: Number,
    required: true,
  },
  authorized_date: String,
  authorized_datetime: String,
  category: {
    type: [String],
    required: true,
  },
  category_id: String,
  check_number: String,
  counterparties: [counterpartySchema],
  date: {
    type: String,
    required: true,
  },
  datetime: String,
  iso_currency_code: {
    type: String,
    required: true,
  },
  location: locationSchema,
  logo_url: String,
  merchant_entity_id: String,
  merchant_name: String,
  name: String,
  payment_channel: String,
  payment_meta: paymentMetaSchema,
  pending: {
    type: Boolean,
    default: false,
  },
  pending_transaction_id: String,
  personal_finance_category: personalFinanceCategorySchema,
  personal_finance_category_icon_url: String,
  transaction_code: String,
  transaction_id: {
    type: String,
    required: true,
    unique: true,
  },
  transaction_type: {
    type: String,
    required: true,
  },
  unofficial_currency_code: String,
  website: String,
});

// Create the Transaction model
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// Create indexes to speed up duplicate checks and common queries
// Skip transaction_id since it's already indexed as unique in the schema definition
transactionSchema.index({ user_id: 1, date: 1, amount: 1, name: 1 });
transactionSchema.index({ user_id: 1, account_id: 1, date: -1 });

/**
 * Optimized function to save a single transaction
 */
const saveTransaction = async (transactionData, userId, accountId = null) => {
  try {
    // Combined query to check for duplicates both by ID and by details
    // This uses one query instead of two sequential queries
    const duplicateQuery = {
      $or: [
        { transaction_id: transactionData.transaction_id },
        {
          user_id: userId,
          date: transactionData.date,
          amount: transactionData.amount,
          name: transactionData.name
        }
      ]
    };
    
    const existingTransaction = await Transaction.findOne(duplicateQuery);
    
    if (existingTransaction) {
      // For production, reduce logging to improve performance
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          'Transaction already exists (skipping):',
          `${transactionData.date} | ${transactionData.name} | ${transactionData.amount}`
        );
      }
      return null;
    }

    // Use provided accountId if available, otherwise use the one from transactionData
    const account_id = accountId || transactionData.account_id;
    
    if (!account_id) {
      throw new Error('Account ID is required for saving transactions');
    }

    // Create and save new transaction with userId and account_id
    const transaction = new Transaction({
      ...transactionData,
      user_id: userId,
      account_id: account_id,
    });
    
    // Save transaction without waiting for console logs
    const savePromise = transaction.save();
    
    // Start account balance update without blocking (we'll await both promises later)
    const Account = require('./Account.model');
    const accountPromise = Account.findById(account_id)
      .then(account => {
        if (account) {
          return account.updateBalance(transactionData.amount);
        }
        return null;
      })
      .catch(err => {
        console.error('Error updating account balance:', err);
        // Don't let account errors fail the transaction save
        return null;
      });
    
    // Wait for both operations to complete
    const [savedTransaction] = await Promise.all([savePromise, accountPromise]);
    
    // For production, reduce logging to improve performance
    if (process.env.NODE_ENV !== 'production') {
      console.log('Transaction saved successfully');
    }
    
    return savedTransaction;
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

/**
 * Optimized function to save multiple transactions in batch
 * Use this when importing many transactions at once (Plaid sync or CSV import)
 */
const saveTransactionsBatch = async (transactionsArray, userId, accountIdMap = null) => {
  if (!transactionsArray || !transactionsArray.length) {
    return { saved: 0, duplicates: 0, errors: 0 };
  }
  
  try {
    // Step 1: Extract all transaction IDs and transaction details for duplicate checking
    const transactionIds = transactionsArray.map(t => t.transaction_id);
    const detailsQueries = transactionsArray.map(t => ({
      user_id: userId,
      date: t.date,
      amount: t.amount,
      name: t.name
    }));
    
    // Step 2: Find all existing transactions that would be duplicates
    const existingByIds = await Transaction.find({ transaction_id: { $in: transactionIds }}, 'transaction_id');
    const existingByDetails = await Transaction.find({ $or: detailsQueries }, 'date amount name');
    
    // Create sets of existing transaction IDs and key combinations for fast lookup
    const existingIdSet = new Set(existingByIds.map(t => t.transaction_id));
    const existingDetailsSet = new Set(existingByDetails.map(t => `${t.date}|${t.name}|${t.amount}`));
    
    // Step 3: Filter out duplicates
    const uniqueTransactions = [];
    const account_updates = {};
    
    for (const txn of transactionsArray) {
      // Skip if transaction_id exists or date+name+amount combo exists
      if (existingIdSet.has(txn.transaction_id) || 
          existingDetailsSet.has(`${txn.date}|${txn.name}|${txn.amount}`)) {
        continue;
      }
      
      // Get account ID (from map or directly from transaction)
      const account_id = (accountIdMap && txn.account_id) 
        ? accountIdMap[txn.account_id] || txn.account_id
        : txn.account_id;
        
      if (!account_id) {
        console.warn(`Skipping transaction with missing account ID: ${txn.name}`);
        continue;
      }
      
      // Ensure required fields are present
      if (!txn.category) {
        // Add default category if missing
        txn.category = ['Uncategorized'];
      }
      
      // Ensure transaction has all required fields
      const transactionToSave = {
        ...txn,
        user_id: userId,
        account_id: account_id,
        // Set default values for required fields if not present
        date: txn.date || new Date().toISOString().split('T')[0],
        amount: txn.amount || 0,
        category: txn.category || ['Uncategorized'],
        iso_currency_code: txn.iso_currency_code || 'USD',
        transaction_type: txn.transaction_type || (txn.amount < 0 ? 'DEBIT' : 'CREDIT'),
        transaction_id: txn.transaction_id || `manual-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
      };
      
      // Prepare transaction for insertion with proper account and user IDs
      uniqueTransactions.push(transactionToSave);
      
      // Track account balance updates
      if (!account_updates[account_id]) {
        account_updates[account_id] = 0;
      }
      account_updates[account_id] += Number(txn.amount);
    }
    
    // Step 4: Insert all unique transactions in one operation
    let insertResult = { insertedCount: 0 };
    if (uniqueTransactions.length > 0) {
      try {
        insertResult = await Transaction.insertMany(uniqueTransactions, { 
          ordered: false,
          // Continue on error to insert as many valid transactions as possible
          rawResult: true
        });
      } catch (error) {
        // If some documents failed but others succeeded (common in bulk operations)
        if (error.insertedDocs && error.insertedDocs.length > 0) {
          console.warn(`Partial success in batch insert: ${error.insertedDocs.length} inserted, ${uniqueTransactions.length - error.insertedDocs.length} failed`);
          insertResult.insertedCount = error.insertedDocs.length;
        } else {
          console.error('Error in batch insert:', error.message);
          throw error;
        }
      }
    }
    
    // Step 5: Update account balances in parallel
    const Account = require('./Account.model');
    const accountUpdatePromises = Object.entries(account_updates).map(([accountId, totalAmount]) => {
      return Account.findById(accountId)
        .then(account => {
          if (account) {
            account.balance += totalAmount;
            account.updated_at = Date.now();
            return account.save();
          }
          return null;
        })
        .catch(err => {
          console.error(`Error updating account ${accountId} balance:`, err);
          return null;
        });
    });
    
    // Wait for all account updates to complete
    await Promise.all(accountUpdatePromises);
    
    // Return summary of operations
    return {
      saved: insertResult.insertedCount || uniqueTransactions.length,
      duplicates: transactionsArray.length - uniqueTransactions.length,
      errors: 0
    };
  } catch (error) {
    console.error('Error in batch transaction save:', error);
    return {
      saved: 0,
      duplicates: 0,
      errors: transactionsArray.length
    };
  }
};

module.exports = {
  Transaction,
  saveTransaction,
  saveTransactionsBatch,
};
