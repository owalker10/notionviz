/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import * as functions from "firebase-functions";
import express from "express";
import cookieParser from "cookie-parser";
import session from "firebase-cookie-session"; // to edit session cookie interface see the .d.ts file
import getEnv from "../env";
import AuthRoutes from "./auth";
import NotionRoutes from "./notion";

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
app.use("/notion", NotionRoutes);

const main = express();
main.use("/api", app);
export default functions.https.onRequest(main);
