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
# Editing, adding, and deleting transactions
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
# Financial Goals