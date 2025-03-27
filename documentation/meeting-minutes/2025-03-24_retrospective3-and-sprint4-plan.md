# Retrospective of Sprint 3

## What went well

- The features worked as designed
- We're able to get 24 months transactions versus the initial 2 months that were fetched
- CI/CD was implemented and deployed locally and created images on DockerHub
- Development went smoother after experience gained from sprint 2

## What didn't go well 

- Tests were last minute and took a while to get right
- Changed testing to use mongodb memory server instead of the jest mock function
  to allow for test coverage reports. Getting this to work took quite a bit of troubleshooting 

# Sprint 4 Planning

 ## Features: 
 
- 2FA - Filip
- Goals - link a savings goal to a savings account and have mini-goals within the saving goal for
  specific things and divided by percentage - Aakash
- Show/hide sidebar - Una
- Filtering transactions by account on transactions page - Jashan ✅
- Transactions: sum selected transactions - Jashan ✅
- Manual input account balance - Jashan
- Custom scroll bar - Jashan

## Bug Fixes: 

- Refinish UI for cohesiveness - Una 
- Add alerts for feedback for user - Sahil
- Check recurring expenses on analytics (not loading??) - Ginelle 
- Add new goal -> change constant 0 in number fields, remove arrow adjusters - Filip
- Goals - amount limit error - badge errors - Filip
- Goals - calendar - no past dates only current/future
- Horizontal scroll bar - Una
- Remove console logs - Everyone/Ginelle 
- Move search and transaction list under the Transactions header - Una
- Make sure transactions are accurately a debit/credit (CSV import) - Jashan ✅
- Sidebar selected page - change to be like the hover for a selected page - Una
- percentages on category chart, UI container - Una
- recurring expenses - container scroll bar - Una
- recurring expenses - removed N/A items - Ginelle 
- CI unit testing - Jashan/Sahil

Regression Testing: 

- On CI, complete regression testing - Sahil

Testing: 

- Unit, integration, acceptance - everyone

Comment Code: everyone

Security Scanner: (SonarCloud) - Sahil

Load Testing: (manual or in CI) 

- JMeter??
- Discuss other options in class tomorrow 

Check Documentation - Ginelle 
