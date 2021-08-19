/* eslint-disable import/first */
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import getEnv from "./env";

// https://firebase.google.com/docs/functions/organize-functions

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

// doesn't like "require" for some reason
import api from "./api";
import onFeedback from "./mail";

exports.api = functions.https.onRequest(api);
exports.onFeedback = onFeedback;
