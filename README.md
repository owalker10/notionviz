# NotionViz

## Create custom data visualizations from Notion databases.

NotionViz is a web application built on React, Express, and Firebase.

This project is a work-in progress.
* status: Backend set up, working on frontend.

Features:
* integration with Notion API (oath2 flow, database requests)
* responsive, mobile-friendly pages and interfaces
* authentication persistence
* responsive data visualization web components with [nivo.rocks](https://nivo.rocks/)
* code-splitting between editor and embed pages to reduce load times
* TypeScript fun :))

Todo:
- [x] UI/UX design
- [x] authentication with Firebase and Notion oauth
- [x] implement React hooks + context to pull from Firestore
- [x] "Home" page
- [x] "My Graphs" page
- [x] feedback UI & set up nodemailer to email on creation of "feedback" Firestore documents
- [ ] implement graph editing on frontend
- [ ] implement graph embed on frontend
- [x] implement passkey verification on backend for private graphs
- [ ] implement Notion API wrapper in backend
- [ ] create documentation and examples