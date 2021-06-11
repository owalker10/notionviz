import * as functions from "firebase-functions";
import express from "express";
import crypto from "crypto";
import { AuthorizationCode, ModuleOptions } from "simple-oauth2";

const credentials: ModuleOptions = {
  client: {
    id: process.env.NOTION_CLIENT_ID ?? "",
    secret: process.env.NOTION_CLIENT_SECRET ?? "",
  },
  auth: {
    tokenHost: "https://api.notion.com",
    tokenPath: "/v1/oauth/authorize",
  },
};

const app = express();

// middleware here! including cookies

app.get("/redirect", (req, res) => {
  const client = new AuthorizationCode(credentials);
  const state = req.cookies.state || crypto.randomBytes(20).toString("hex");
  const secureCookie = req.get("host")?.indexOf("localhost:") !== 0;
  res.cookie("state", state.toString(), {
    maxAge: 3600000,
    secure: secureCookie,
    httpOnly: true,
  });
  const redirectUri = client.authorizeURL({
    redirect_uri: `${req.protocol}://${req.get("host")}/auth/callback`,
    scope: "basic",
    state,
  });
  res.redirect(redirectUri);
});

export default functions.https.onRequest(app);
