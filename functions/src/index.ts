import functions = require("firebase-functions");
import express = require("express");

import admin = require("firebase-admin");

require("dotenv").config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT || "";
console.log("service account", serviceAccount !== "");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.get("/api/timestamp", (req, res) => {
  res.send(`${Date.now()}`);
});

exports.app = functions.https.onRequest(app);
