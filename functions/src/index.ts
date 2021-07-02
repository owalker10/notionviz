import * as functions from "firebase-functions";
import api from "./api";

exports.api = functions.https.onRequest(api);
