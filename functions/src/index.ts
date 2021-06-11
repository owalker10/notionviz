import * as functions from "firebase-functions";
import admin from "firebase-admin";
import authService from "./auth";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const serviceAccount: admin.ServiceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT || "", "base64").toString(
    "ascii"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.auth = functions.https.onRequest(authService);
