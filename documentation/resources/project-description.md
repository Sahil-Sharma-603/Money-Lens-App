# Project Description

## Project Requirements

Web application with # of team members core features
Software system with: 
- server end and front end
- 6 core features
- min capacity requirement (non-functional feature)
- no limits on reusing external frameworks, libraries, services
    - logic of core features much be implemented ourselves
DevOps lifecycle: 
- CI (auto-build, regression test, code review)
- CD (pipeline using Docker)
- Integrate security analysis into CI pipeline
- Load testing 

## Sprint 1 Deliverables (5%)
[Proposal Template](https://universityofmanitoba.desire2learn.com/d2l/le/content/608346/viewContent/4178580/View)
- form team and select liaisons
- propose project
- set up GitHub environment
- work on requirements elicitation with customer(TA)
- Set up meeting with TA as early as possible

## Sprint 2 Deliverables (5%)
[Test Plan Template](https://universityofmanitoba.desire2learn.com/d2l/le/content/608346/viewContent/4178581/View)
- system design
    - sequence diagrams for each core feature: https://www.geeksforgeeks.org/unified-modeling-language-uml-sequence-diagrams/
- meeting minutes for at least 2 >15 min meetings (wiki page)
- development (at least 50% core features)
- develop testing plan
- testing (regression- can be setup in build file depending on build tool)
- continuous integration (triggered when a commit is pushed to a major branch)
    - Enable:
    1) auto build
    2) code review (peer review by at least one other team member)
    3) regression test (run all test cases, 100% backend coverage)
        - at least 10 unit tests for each implemented feature
- working system and get feedback from TA

## Technique Sharing Seminar (%5)

Share knowledge and experience among teams. 
Possible Topics: technology, design choice, challenges and solutions, lessons learned

12 mins (10 mins presentation, 2 min Q&A)

Evaluated on usefulness of seminar, and quality of presentation and slides.
7:3 ratio of evaluation from other teams:instructor 

## Sprint 3 Deliverables (5%)

- development (finish all core features)
    - work well in docker container
    - local machine, lab machine or live server
- meetings- at least 2 >15 mins meetings
- design and architecture documentation consistend with code
- code is highly readable with sufficient comments
- complete unit, integration, aceeptance testing as planned.
    - If the acceptance testing is manual, list the steps (in text) for each user story. 
    - at least 10 unit tests per feature (can be backend and frontend, but 100% backend coverage)
- continuous deployment pipeline enables: 
    1) containerize your system using Docker
    2) push the generated docker image to Docker Hub automatically. 

    - Can use any tool for CD. Jenkins and GitHub Actions introduced in class. 
    Note that, you don't have to trigger CD pipeline for each commit, which is probably too heavy. Triggering it for each sprint is fine. 
    - system dockerized, create and push docker image to docker hub automatically
- working system and get feedback from TA

## Sprint 4 Deliverables (5%)

- fix bugs
- add additional features
- directory and package structure
    - files with similar functionality are organized in packages
- code is highly readable and has sufficient comments
- coding style enforced (follow naming and coding conventions that the team defines)
- CI/CD works well without bugs
    - CD can be manually or automatically triggered
- final project demo

- load testing (not mandatory)
    - use tool like JMeter to perform loading testing and pass loading capacity requirements. 
- integrate security scanner in CI (eg. SonarCloud)
    - scan source code and get a report

## Final Project Presentation (10%)

~18-20 min presentation with 2 mins Q&A

1) Recap of project (1 min)
2) Demo of project (5-7 mins)
3) Discussion of the development process (6-7 mins)
    - avoid topic overlap from technique seminar

### Presentation Marking

"Market-based"
Scaled [5,10] - first place ranked team gets 10, last ranked gets 5
Ranking: 10-(rank-1)*(5/5)
7:3 ratio of evaluation from other teams:instructor

Evaluated based on: 
1) The project itself (implementation, impression on "market")
2) Presentation (quality of slides, presentation skill)

## Final Project Release Report Deliverable (20%)

[Project Release Report Template](https://universityofmanitoba.desire2learn.com/d2l/le/content/608346/viewContent/4178579/View)

- documentation: (must match GitHub repo)
    - release
    - proposal 
    - design
    - testing reports
    - meeting record
    - issues

### Final Report Marking 
Ranking system [12, 20] 20-(rank-1)*(8/(number of teams-1)) - evaluated by TA and instructor

Evaluated based on: 
- technical content
- clarity of exposition
- overal perception of the project relative to others

## Peer Evaluation
eg. 8/10 peers, 50/60 project, then final project grade is 50*0.8= 48/60