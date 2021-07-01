import * as functions from "firebase-functions";
import authService from "./auth";

exports.auth = functions.https.onRequest(authService);
