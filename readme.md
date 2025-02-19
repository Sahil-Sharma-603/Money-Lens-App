# Money Lens

## About Us

Money Lens is a web application designed to simplify the process of managing personal finances. For more information about our project or plans, see our [Project Proposal](documentation/ProjectProposal.md).

### Group Members:

- Jashanjot Gill
- Ginelle Temull
- Una Mayberry
- Sahil Sharma
- Filip Karamanov
- Aakash Chouhan

## Coding Conventions

### Commit log description message:

"Feature##-UserStory##-SubTask## description of task"
eg. "01-09-39 implemented login form fields and buttons for UI"
for feature #01 (Authentication System), user story #09 (Login), subtask #39 (Login UI)

### Branches:

main - final submission

develop - working branch

feature - a branch for each feature

### File architecture:

/front end

/backend

/config

/scripts

/docs

/tests

### Using Docker Containers

- First build the containers with the command `docker-compose up --build -d`
- When finished using the containers, close them with the command `docker-compose down`
- The frontend runs on "localhost:3000"
- The backend runs on "localhost:5001"

### Installation & Running Frontend

- cd frontend
- `npm install --legacy-peer-dep`
- Once in frontend directory, run `npm run dev`
- Note (Important): please use "--legacy-peer-dep" flag with npm install as shown above.

### Running Backend

- cd backend
- `npm install`
- Once in backend directory, run `node server.js`
- Node: you must .env file that has MONGO_URI=mongodb+srv://<username>:<password>@cluster0.p23io.mongodb.net/Money-Lens-MongoDB?retryWrites=true&w=majority
- Note: Replace `username` & `password` with actual credentials.
