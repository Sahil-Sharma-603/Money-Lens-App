# Money Lens

## NOTE: Please try to make a push, to see that everyone can push (add your name to group members list)

### Group Members:

- Jashanjot Gill
- Ginelle Temull
- Una Mayberry
- Sahil Sharma
- Filip Karamanov

# About Us

Money Lens is a web application designed to simplify the process of managing personal finances. For more information about our project or plans, see our [Project Proposal](documentation/ProjectProposal.md).

# Coding Conventions

Commit log description message:
"Feature##-UserStory##-SubTask## description of task"
eg. "01-09-39 implemented login form fields and buttons for UI"
for feature #01 (Authentication System), user story #09 (Login), subtask #39 (Login UI)

Branches:
main - final submission
develop - working branch
feature - a branch for each feature

File architecture:
/front end
/dashboard
/transactions
/analysis
/backend
/config
/scripts
/docs
/tests

# Running Frontend

- Once in frontend directory, run `npm run dev`

# Running Backend

- Once in backend directory, run `node server.js`
- Node: you must .env file that has MONGO_URI=mongodb+srv://<username>:<password>@cluster0.p23io.mongodb.net/Money-Lens-MongoDB?retryWrites=true&w=majority
- Note: Replace `username` & `password` with actual credentials.
