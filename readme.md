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

### Project Structure

```bash
Money-Lens-App/
├── backend/
│   ├── logic/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│
├── /documentation
│   ├── architecture/
│   │   ├── sequence-diagrams/
│   ├── meeting-minutes/
│   ├── resources/
│
├── frontend/
│   ├── public/
│   ├── src/app/
│   │   ├── assets/
│   │   │   ├── styles/
│   │   │   ├── utilities
│   │   ├── components/
│   │   ├── config/
│   │   ├── pages/
│   │   │   ├── analytics/
│   │   │   ├── dashboard/
│   │   │   │   ├── components/
│   │   │   ├── forgot-password/
│   │   │   ├── goals/
│   │   │   ├── plaid-setup/
│   │   │   ├── signup/
│   │   │   ├── transactions/
│
└── tests/
    ├── unit/
    ├── integration/
    ├── acceptance/
```

### Running the App

#### 1: Using Docker Containers

- First build the containers with the command `docker-compose up --build -d`
- When finished using the containers, close them with the command `docker-compose down`
- The frontend runs on "localhost:3000"
- The backend runs on "localhost:5001"

#### 2: Running Manually

##### Installation & Running Frontend

- cd frontend
- `npm install --legacy-peer-dep`
- Once in frontend directory, run `npm run dev`
- Note (Important): please use "--legacy-peer-dep" flag with npm install as shown above.

##### Running Backend

- cd backend
- `npm install`
- Once in backend directory, run `node server.js`. Note: Won't reload by itself.
- Once in backend directory, run `npm start` for auto-reload.
- Node: you must .env file that has MONGO_URI=mongodb+srv://<username>:<password>@cluster0.p23io.mongodb.net/Money-Lens-MongoDB?retryWrites=true&w=majority
- Note: Replace `username` & `password` with actual credentials.

##### Running Tests

See our ![test plan](/documentation/architecture/Money-Lens_Test-Plan.pdf) for more details. 

Unit and Integration: 
- cd tests
- `npm install --save-dev jest supertest @jest/globals`
- `npx jest --coverage` to show coverage or `npx jest` for just test suite summary


### Test Account for Sign ins

For the Money Lens app: 

user: ginelletemull@gmail.com

password: test123

For Plaid account connection: 

user: user_good

password: pass_good