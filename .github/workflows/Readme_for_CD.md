-- Required: Run Docker Desktop on your machine

-- SetUp process for first time users for testing deploymnent locally

Step 1) Go to your repo `setting`.
Step 2) On left panel choose `Actions`.
Step 3) Under Actions tab choose `Runners`.
Step 4) Click on `New self-hosted runner` on the top right corner.
Step 5) Choose the setting according to your machine.
Step 6) Open terminal and run all the command under `download` section.
Step 7) Run the next section commands `configure`.

The terminal will show that `Listening for Jobs`.

-- After Setup 

Everytime if anyone want to test using deployment you need to go to above `actions-runner` folder in terminal and start the server.

For Windows:  `./run.cmd`
For Mac: `./run.sh`

The terminal will show that `Listening for Jobs`.

Any changes in the develop branch will run the build the docker images, push the docker images to docker hub and deploy the system.

-- To test it 

`http://localhost:3000/`
