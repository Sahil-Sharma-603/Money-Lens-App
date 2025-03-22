# MoneyLens Acceptance Tests
### Features:
- Authentification
- Dashboard
- Importing data via CSV
- Importing data via External Bank Account
- Editing, adding, and deleting transactions
- Analytics
- Search & Filter Transactions
- Financial Goals

# Authentification

### Prerequisites
- User has valid email address
- User has internet access
- User is not currently logged into MoneyLens

## Test 1: User Sign Up
User Story: As a new user, I want to create an account so that I can start using MoneyLens to manage my finances.

### Test Steps:
1. Navigate to the MoneyLens application login screen
2. Click on "Sign Up" or "Don't have an account?" link
3. Complete the registration form with valid information:
   - First Name: [valid first name]
   - Last Name: [valid last name]
   - Email: [valid email address]
   - Password: [password meeting security requirements]
   - Confirm Password: [matching password]
4. Click the "Sign Up" button
5. Check email inbox for verification email from Firebase/MoneyLens
6. Open the verification email and click the verification link
7. Verify redirect to MoneyLens application with confirmation message

### Expected Results:
- Account is created successfully
- Verification email is received
- Email verification completes successfully
- User can proceed to login

## Test 2: User Login
User Story: As a registered user, I want to log into my account so that I can access my financial information.

### Test Steps:
1. Navigate to the MoneyLens application login screen
2. Enter registered email address in the Email field
3. Enter correct password in the Password field
4. (Optional) Check "Remember me" if desired
5. Click the "Sign In" button

### Expected Results:
- User is successfully logged in
- User is redirected to the Dashboard
- User's financial information is displayed correctly
- Navigation menu shows all available features

# Dashboard
### Prerequisites for all dashboard tests
- User has an active MoneyLens account
- User is logged into the application
## Test 1: Account Summary
User Story: As a user, I want to see a summary of my account so that I can understand my finances easily.

### Test Steps:
1. When logged in, click the 'Dashboard' button on the left navigation menu
2. Verify that recent transactions, balance, and account summary chart are shown

### Expected Results
- User can see their balance, some stats about their account, their recent transactions, and a filterable chart of their earnings/expenses.

## Test 2: Recent Transactions
User Story: As a user, I want to see my recent transactions on my account so that I can track my spending and income.

### Test Steps:
1. When logged in, click the 'Dashboard' button on the left navigation menu
2. Verify that recent transactions are shown in the list on the right of the screen. Positive transactions (earnings) are coloured blue and negative transactions (spending) are coloured pink.
### Expected Results
- User can see their recent 20 transactions listed in order of recency.

## Test 3: Navigation
User Story: As a user, I want to be able to navigate my finances so that I can easily access different sections of the application.

### Test Steps:
1. When logged in, click the 'Dashboard' button on the left navigation menu
2. Ensure the dashboard page is loaded. The top left of the view should say "Hello [name]"
3. Click on the 'Transactions' button on the left navigation menu.
4. Ensure the transactions page is loaded. The function to search and filter transactions should be visible
5. Click on the 'Analytics' button on the left navigation menu.
6. Ensure the analytics page is loaded. A pie chart with a category breakdown should be visible.
7. Click on the 'Goals' button on the left navigation menu.
8. Ensure the goals page is loaded. There should be a button that lets you create a new goal.

### Expected Results:
- The user can navigate between dashboard, transactions, analytics, and goal pages at will.
# Importing data via CSV
# Importing data via External Bank Account

### Prerequisites for all bank connection tests
- User has an active MoneyLens account
- User is logged into the application
- User has online banking credentials for their financial institution

## Test 1: Connect Bank Account via Plaid
User Story: As a user, I want to connect my bank account through Plaid so that I can automatically import my financial data.

### Test Steps:
1. When logged in, click the 'Bank Settings' button on the left navigation menu
2. Verify that the Bank Account Connection page loads correctly
3. Click the "Connect Bank" button
4. Wait for the Plaid interface to load
5. Click "Continue" in the Plaid modal
6. Select either "Continue as guest" or "Add phone number" for authentication
7. Click "Continue"
8. Search for or select your bank from the provided list
9. Enter test credentials:
   - Username: user_good
   - Password: pass_good
10. Click "Submit" or "Continue"
11. Select which accounts to link when prompted
12. Click "Continue" or "Connect"

### Expected Results:
- New connected bank account appears under "Connected Bank Accounts" section
- Account name, last four digits, type, and current balance are displayed correctly
- Connection status shows as active

## Test 2: View Imported Transactions
User Story: As a user, I want to see my bank transactions automatically imported so that I can track my finances without manual entry.

### Test Steps:
1. After connecting a bank account via Plaid, click the 'Transactions' button on the left navigation menu
2. Verify that transactions from the connected account appear in the transactions list
3. Confirm transaction details (dates, amounts, descriptions) match those from the bank account

### Expected Results:
- Bank transactions appear in the transactions list
- Transaction details are accurate and complete
- Most recent transactions appear at the top of the list

# Editing and deleting transactions
### Prerequisites for all editing/deleting tests
- User has an active MoneyLens account
- User is logged into the application

## Test 1: Edit Transaction
User story: As a user, I want to edit a transaction so I can correct data or update details.
### Test Steps:
1. When logged in, click the 'Transactions' button on the left navigation menu
2. Verify there are transactions on the right. If not, connect a bank account or import via CSV (see relevant tests)
3. Click little green button on the right of a transaction
4. Edit the transaction name
5. Click save changes
6. Verify that the name of the transaction has changed in the list

### Expected Results:
- User can edit a transaction and this data will be saved.

## Test 3: Delete Transaction
User story: As a user, I want to delete transactions that are no longer relevant.
### Test Steps:
1. When logged in, click the 'Transactions' button on the left navigation menu
2. Verify there are transactions on the right. If not, connect a bank account or import via CSV (see relevant tests)
3. Click little red trash button next to a transaction
4. Wait for browser confirmation popup
5. Click 'okay' to verify deletion
6. Close confirmation popup
7. Verify transaction is no longer listed.

### Expected Results:
- User can delete transactions.

# Analytics
### Prerequisites for all analytics tests
- User has an active MoneyLens account
- User is logged into the application

## Test 1: View Income & Expenses by Period
User story: As a user, I want to view income and expenses by different periods so that I can understand my financial trends.
### Test Steps:
1. When logged in, navigate to the analytics page by clicking 'analytics' on the left navigation bar
2. Verify that a bar chart is visible in the bottom left of the view.
3. Click the button in the upper right of the bar chart component (by default, it will say 'Past Year', but it may say 'Past Month' or another time period if a different one is selected)
4. Choose a different time period (ex. 'Last 12 weeks')
5 Verify that the barchart adjusts to show spending and earning for this time period
### Expected Results:
- User can view expenses and spending in a chart based on a specified time period.

## Test 2: View Net Income
User story: As a user, I want to view my net income so that I can evaluate my financial decisions.
### Test Steps:
- When logged in, navigate to the dashboard page by clicking 'dashboard' on the left navigation bar
- Verify that the number specified under 'Account Balance' is correct
### Expected Results:
- User can view their account balance.

## Test 3: View Expenses by Category
User story: As a user, I want to be able to view expenses by category, so I can evaluate my financial decisions.
### Test Steps:
1. When logged in, navigate to the analytics page by clicking 'analytics' on the left navigation bar
2. Verify that a pie chart showing expenses by category is visible

### Expected Results:
- User can see their expenses broken down by category.

## Test 4: Track Recurring Expenses
User story: As a user, I want to be able to track recurring expenses, so I can further track my expenses and evaluate financial decisions.

### Test Steps:
1. When logged in, navigate to the analytics page by clicking 'analytics' on the left navigation bar
2. Verify that a list labeled 'Recurring expenses' is visible and lists any existing recurring expenses.

### Expected Results:
- User can see any expenses that have been marked as recurring, as well as the date they renew on and the charge amount.

# Search & Filter Transactions
### Prerequisites for all searching tests
- User has an active MoneyLens account
- User is logged into the application

## Test 1: Search Transations
User Story: As a user, I want to be able to search for transactions so that I can quickly find a specific transaction.

### Test Steps:
1. When logged in, click the 'Transactions' button on the left navigation menu
2. Verify there is a field labeled 'Search Transactions'
3. Type input into this field (ex. "Uber")
4. Click 'Get Transactions'
5. Verify transaction list has changed to reflect seach results
### Expected Results
- User should see a list of results corresponding to their search.

## Test 2: View Transactions
User story: As a user, I want to be able to view a list of search results so that I can find a transaction that was already searched for before.

### Test Steps:
1. When logged in, click the 'Transactions' button on the left navigation menu
2. Verify there is a list of transactions on the right hand side. 
### Expected Results
- User should see a list of transactions

# Financial Goals
### Prerequisites for all goal tests
- User has an active MoneyLens account
- User is logged into the application

## Test 1: Create a New Financial Goal
User Story: As a user, I want to create a new financial goal so that I can track my progress toward savings targets.

### Test Steps:
1. When logged in, click the 'Goals' button on the left navigation menu
2. Verify that the goals page is loaded with a list of existing goals (if any)
3. Click the "Add New Goal" button in the top right corner
4. Complete the form with the following required information:
   - Goal Title: [meaningful name]
   - Goal Type: Select "Savings Goal" from dropdown
   - Category: Select "Savings" from dropdown
   - Target Amount: Enter desired target amount
   - Current Amount: Enter starting amount if any
   - Target Date: Select future completion date
   - Description: Add optional details about goal purpose
5. Click "Save Goal" button

### Expected Results:
- New goal appears in the goals list with correct title and details
- Progress bar shows accurate percentage based on current/target amounts
- Category and remaining days are displayed correctly

## Test 2: Edit an Existing Financial Goal
User Story: As a user, I want to modify my financial goals so that I can adjust my targets as my priorities change.

### Test Steps:
1. When logged in, click the 'Goals' button on the left navigation menu
2. Locate an existing goal in the list
3. Click the "Edit" button next to the selected goal
4. Modify one or more fields in the form:
   - Change goal title
   - Update target amount
   - Adjust target date
   - Modify description
5. Click "Save Goal" button

### Expected Results:
- Goal displays updated information in the goals list
- Progress indicators recalculate based on new target values
- Days remaining updates if target date was modified

## Test 3: Add Money to a Financial Goal
User Story: As a user, I want to add money to my financial goals so that I can track my progress toward completion.

### Test Steps:
1. When logged in, click the 'Goals' button on the left navigation menu
2. Locate a goal in the list that hasn't reached its target
3. Click the "Add Money" button next to the selected goal
4. Enter an amount to add in the popup dialog
5. Click "Confirm" or "Add" button

### Expected Results:
- Current amount increases by the added value
- Progress bar updates to reflect new percentage
- If goal is completed, visual indicator shows 100% completion

## Test 4: Delete a Financial Goal
User Story: As a user, I want to delete financial goals that are no longer relevant so I can keep my goals list organized.

### Test Steps:
1. When logged in, click the 'Goals' button on the left navigation menu
2. Locate the goal to be removed
3. Click the "Delete" button next to the selected goal
4. Confirm deletion when prompted with confirmation dialog
5. Verify the goal is removed from the list

### Expected Results:
- Goal is completely removed from the goals list
- No trace of deleted goal remains in the interface
- Goal count decreases by one