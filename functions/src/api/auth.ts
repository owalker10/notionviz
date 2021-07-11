import { asTypedDb } from "common";
import express from "express";
import admin from "firebase-admin";
import { AuthorizationCode } from "simple-oauth2";
import crypto from "crypto";
import getEnv from "../env";

const router = express.Router();

const emulated = process.env.FUNCTIONS_EMULATOR === "true";
const hostEmulated = process.env.REACT_APP_HOST === "true";

const credentials = {
  client: {
    id: getEnv("NOTION_CLIENT_ID") ?? "",
    secret: getEnv("NOTION_CLIENT_SECRET") ?? "",
  },
  auth: {
    tokenHost: "https://api.notion.com",
    tokenPath: "/v1/oauth/token",
    authorizePath: "v1/oauth/authorize",
  },
};
const db = asTypedDb(admin.firestore());
const getRedirectUri = (ref: string) =>
  // eslint-disable-next-line no-nested-ternary
  emulated && !hostEmulated
    ? `http://localhost:5001/notion-viz/us-central1/api/api/auth/callback`
    : hostEmulated
    ? `http://localhost:5000/auth/callback`
    : `${ref}auth/callback`;
const client = new AuthorizationCode(credentials);

router.get("/redirect", (req, res) => {
  req.session.back_to = req.header("Referer");
  // automatically log in to my test Notion workspace to avoid the Notion OAuth flow
  if (emulated && !hostEmulated && !process.env.NOSKIP) {
    admin
      .auth()
      .createCustomToken(process.env.TEST_UID ?? "")
      .then((token) => {
        res.redirect(`${req.session.back_to}?token=${token}`);
      })
      .catch((err) => {
        console.error("Error creating token for test account", err);
        res.redirect(`${req.session.back_to}?err=true`);
      });
  } else {
    const state = req.session.state || crypto.randomBytes(20).toString("hex");
    // const secureCookie = !emulated;
    // res.cookie("state", state.toString(), {
    //   maxAge: 3600000,
    //   secure: secureCookie,
    //   httpOnly: true,
    // });
    // console.log(getRedirectUri(req));
    req.session.state = state.toString();
    const redirectUri = client.authorizeURL({
      redirect_uri: getRedirectUri(req.session.back_to ?? ""),
      scope: "basic",
      state,
    });
    res.redirect(redirectUri);
  }
});

const createFirebaseAccount = async (
  botId: string,
  workspaceName: string,
  workspaceIcon: string | null,
  accessToken: string
) => {
  // The UID we'll assign to the user.
  const uid = botId;
  console.log(botId, workspaceName, workspaceIcon, accessToken);
  // Save the access token to the Firebase Realtime Database.
  const user = db.users.doc(uid);
  const userDatabaseTask = user.get().then((doc) => {
    if (!doc.exists) {
      user.set({
        uid,
        workspaceName,
        nextGid: 0,
      });
    }
  });
  const tokenDoc = db.private(uid).doc("token");
  const tokenDatabaseTask = tokenDoc.get().then((doc) => {
    if (!doc.exists) {
      tokenDoc.set({
        token: accessToken,
      });
    }
  });
  // Create or update the user account.
  const userCreationTask = admin
    .auth()
    .updateUser(uid, {
      displayName: workspaceName,
      photoURL: workspaceIcon,
    })
    .catch((error) => {
      // If user does not exists we create it.
      if (error.code === "auth/user-not-found") {
        return admin.auth().createUser({
          uid,
          displayName: workspaceName,
          photoURL: workspaceIcon,
        });
      }
      throw error;
    });
  // Wait for all async task to complete then generate and return a custom auth token.
  return Promise.all([
    userCreationTask,
    userDatabaseTask,
    tokenDatabaseTask,
  ]).then(() => {
    // Create a Firebase custom auth token.
    const token = admin.auth().createCustomToken(uid);
    return token;
  });
};
// function signInFirebaseTemplate(token: string, back: string) {
//   return `
//     <script src="https://www.gstatic.com/firebasejs/3.6.0/firebase.js"></script>
//     <script>
//       var token = '${token}';
//       var config = {
//         apiKey: '${process.env.FIREBASE_API_KEY}'
//       };
//       var app = firebase.initializeApp(config);
//       if (${process.env.})
//       app.auth().signInWithCustomToken(token).then(function() {
//         window.location.replace("${back}");
//       });
//     </script>`;
// }
router.get("/callback", (req, res) => {
  console.log("Received state cookie:", req.session.state);
  console.log("Received state query parameter:", req.query.state);
  if (!req.session.state) {
    res
      .status(400)
      .send(
        "State cookie not set or expired. Maybe you took too long to authorize. Please try again."
      );
  } else if (req.session.state !== req.query.state) {
    res.status(400).send("State validation failed");
  }
  client
    .getToken({
      code: req.query.code?.toString() ?? "",
      redirect_uri: getRedirectUri(req.session.back_to ?? ""),
    })
    .then((results) => {
      console.log("Auth code exchange result received:", results);
      // res.send(200);
      const response = results.token;
      // We have an Instagram access token and the user identity now.
      const accessToken = response.access_token;
      const workspaceName = response.workspace_name;
      const workspaceIcon = response.workspace_icon;
      const botId = response.bot_id; // this is unique to every workspace! yay!
      // todo throw if these are undefined
      // Create a Firebase account and get the Custom Auth Token.
      createFirebaseAccount(
        botId,
        workspaceName,
        workspaceIcon,
        accessToken
      ).then((firebaseToken) => {
        console.log(firebaseToken);
        res.redirect(`${req.session.back_to}?token=${firebaseToken}`);
        // res.send(
        //   signInFirebaseTemplate(firebaseToken, req.session.back_to ?? "/")
        // );
      });
    });
});

export default router;
