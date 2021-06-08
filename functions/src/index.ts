import functions = require("firebase-functions");
import express = require("express");

import admin = require("firebase-admin");

require("dotenv").config();

const serviceAccount: admin.ServiceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT || "", "base64").toString(
    "ascii"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.get("/api/timestamp", (req, res) => {
  res.send(`${Date.now()}`);
});

exports.app = functions.https.onRequest(app);
