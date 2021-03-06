# NotionViz (work in progress)

## Create custom data visualizations from Notion databases.

![image](https://user-images.githubusercontent.com/36974651/133950852-2112f1b0-da92-488e-9161-aa11e0f4a37b.png)

![image](https://user-images.githubusercontent.com/36974651/133950746-9aa1f3f4-8e14-4e87-8915-27f1b3d5faea.png)

![image](https://user-images.githubusercontent.com/36974651/133951518-d4011987-b0f8-4bca-bfc6-d039f512ae09.png)

NotionViz is a web application built on React, Express, and Firebase.

This project is a work-in progress.
* status: backend set up, working on frontend.

### Features:
* integration with Notion API (oath2 flow, database requests)
* responsive, mobile-friendly pages and interfaces
* responsive data visualization web components with [nivo.rocks](https://nivo.rocks/)
* code-splitting between editor and embed pages to reduce load times
* functional React components and hook-based state/data management
* TypeScript fun :))

### Todo:
- [x] UI/UX design
- [x] authentication with Firebase and Notion oauth
- [x] implement React hooks + context to pull from Firestore
- [x] "Home" page
- [x] "My Graphs" page
- [x] feedback UI & set up nodemailer to email on creation of "feedback" Firestore documents
- [ ] implement graph editing on frontend
- [ ] implement graph embed on frontend
- [x] implement passkey verification on backend for private graphs
- [X] implement Notion API wrapper in backend
- [ ] create documentation and examples

### Repository structure:
- `/client`: React code and assets for the frontend
- `/functions`: Firebase Functions code (including Express API) for the backend
- `/common`: functionality and interfaces shared between frontend and backend
