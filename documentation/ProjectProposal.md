# Money Lens Project Proposal
### Vision:
Money Lens is a web application that will simplify interpreting and organizing personal finances by providing tools for tracking income, spending, and financial goals.
### Project Summary:
Our goal is to simplify finance management by providing users with intuitive methods of viewing and interacting with their banking information.This project aims to make managing money a simple and stress-free process. Users will be able to view and interact with their transactions, including both income and expenditures. 

The application will allow users to import their financial statements, either by connecting their bank account or by uploading them manually. Connecting a bank account allows for automatic updates on real-time transactions, while manual import allows for flexibility and the ability to add statements that may not be associated with the user’s bank. Once imported, users can categorize, edit, add, or delete transactions as well as view analytics about their finances. Analysis tools will include financial summaries by month, year, or a custom time period. Transaction categories will allow users to better understand where specifically their money is going.

Our primary stakeholders are users who would like to better manage and understand their personal finances. This could include individuals, or families who wish to see all of their financial information in one place.

The application will be considered a success if it is functionally capable of importing 1000 transactions spread across 100 users within a minute. This will ensure that the system can manage the large quantity of data that is likely associated with existing bank accounts.
### Functional Features:
- Authentication System
- Dashboard
- Importing Data via CSV
- Connecting to and Importing Data from an External Bank Account
- Editing, Adding, and Deleting Transactions
- Basic Analytics
- Search Transactions
- Set Financial Goals
### Non-functional Feature:
Import 1000 transactions from 100 users within a minute.

### Technologies:
Presentation Layer -> React

Logic Layer -> NodeJS & ExpressJS

Persistence Layer -> MongoDB
### User Stories:
#### Authentication System
- As an existing user, I want to log into my account so that I can access my financial data securely.
- As a new user, I want to register an account so that I can start tracking my finances
- As a logged-in user, I want to log out so that I can safely secure my account
- As a logged-in user, I want to change my password so that I can improve my account security
- As a user, I want to reset my password so that I can regain access to my account incase I forget my password
#### Dashboard
- As a user, I want to see a summary of my account so that I can understand my finances easily.
- As a user, I want to see my recent transactions on my account so that I can track my spending and income
- As a user, I want to be able to navigate my finances so that I can easily access different sections of the application
- As a user, I want to see when my account is syncing, so that I know my data is up-to-date
#### Importing Data via CSV
- As a user, I want to select CSV files so that I can upload my banking data
- As a user, I want to view the uploaded files so that I can confirm the data that was imported
#### Connecting to and Importing Data from an External Bank Account
- As a user, I want to select my bank account so that I can connect my account to track
- As a user, I want to choose choose how to import my data so that I can use a preferred method
#### Editing, Adding, and Deleting Transactions
- As a user, I want to create a new transaction so I can manually add data
- As a user, I want to edit a transaction so I can correct data or update details
- As a user, I want to view transaction details so that I can see all relevant information
#### Basic Analytics
- As a user, I want to view income and expenses by different periods so that I can understand my financial trends
- As a user, I want to sort my finance data by time by time periods so that I can easily find data that is relevant
- As a user, I want to view my net income so that I can evaluate my financial decisions
- As a user, I want to sort income by time period so that I can easily find data
- As a user, I want to be able to see my net income so that I can evaluate my financial position
- As a user, I want to be able to view expenses by category, so I can evaluate my financial decisions
- As a user, I want to be able to create a new category, so I can further track my expenses easily
- As a user, I want to be able to track recurring expenses, so I can further track my expenses and evaluate financial decisions.
#### Search Transactions
- As a user, I want to be able to search for transactions so that I can quickly find a specific transaction
- As a user, I want to be able to view a list of search results so that I can find a transaction that was already searched for before
#### Set Financial Goals
- As a user, I want to be able to set my savings and spending goals so that I can work toward a financial target