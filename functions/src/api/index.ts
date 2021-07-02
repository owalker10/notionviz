/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import * as functions from "firebase-functions";
import express from "express";
import cookieParser from "cookie-parser";
import session from "firebase-cookie-session"; // to edit session cookie interface see the .d.ts file
import admin from "firebase-admin";
import getEnv from "../env";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const serviceAccount = JSON.parse(
  Buffer.from(getEnv("FIREBASE_SERVICE_ACCOUNT") || "", "base64").toString(
    "ascii"
  )
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// all routes have to be imported after admin is initialized
// eslint-disable-next-line import/first
import AuthRoutes from "./auth";

const emulated = process.env.FUNCTIONS_EMULATOR === "true";

const app = express();
app.use(cookieParser());
app.use(
  session({
    secret: getEnv("SESSION_SECRET") ?? "",
    cookie: { secure: !emulated },
    saveUninitialized: false,
    resave: false,
  })
);
app.use("/auth", AuthRoutes);

const main = express();
main.use("/api", app);
export default functions.https.onRequest(main);
