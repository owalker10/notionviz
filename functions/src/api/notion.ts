import { asTypedDb, DatabaseQueryPayload, getData, Graph } from "common";
import express from "express";
import admin from "firebase-admin";
import { read } from "common/lib/notion/functions-only";
import cors from "cors";
// import getEnv from "../env";

const router = express.Router();
router.use(express.json());

const emulated = process.env.FUNCTIONS_EMULATOR === "true";
if (emulated) router.use(cors()); // cors doesn't like localhost
// const hostEmulated = process.env.REACT_APP_HOST === "true";

const db = asTypedDb(admin.firestore());

// https://firebase.google.com/docs/auth/admin/verify-id-tokens
// todo: proper error codes

router.post("/query", async (req, res) => {
  console.log(req.body);
  const { graphId, uid, idToken, passkey } = req.body as DatabaseQueryPayload;
  if (!graphId) res.status(400).send(new Error("No graph id specified."));
  if (!uid) res.status(400).send(new Error("No uid specified."));
  const graph: Graph | undefined = await getData(db.graphs(uid), graphId)
    .then((g) => {
      if (!g) throw new Error("Graph not found");
      return g;
    })
    .catch((err) => {
      res.status(404).send(err);
      return undefined;
    });
  if (!graph) return;
  const user = await getData(db.users, uid)
    .then((u) => {
      if (!u) throw new Error("user not found");
      return u;
    })
    .catch((err) => {
      res.status(404).send(err);
      return undefined;
    });
  if (!user) return;

  // check permissions

  // if this is coming from the client, the request should give a tokenId that should belong to the uid specified
  if (idToken) {
    const tokenUid = await admin
      .auth()
      .verifyIdToken(idToken)
      .then((dec) => dec.uid);
    if (tokenUid !== uid)
      res
        .status(403)
        .send(new Error("requested user does not match requester uid"));

    // if it's coming from an embed and the graph is not public, the request needs a passkey
  } else if (!graph?.isPublic) {
    if (!passkey) res.status(403).send(new Error("no passkey specified"));
    const truePasskey = user?.passkeys[graphId];
    if (!truePasskey)
      res.status(500).send(new Error("error verifying passkey"));
    if (truePasskey !== passkey)
      res.status(403).send(new Error("invalid passkey"));
  }

  // passed the vibe check
  const notionToken = await db
    .private(uid)
    .doc("token")
    .get()
    .then((snap) => snap.data()?.token);
  if (!notionToken)
    // eslint-disable-next-line consistent-return
    return res.status(500).send(new Error("Error fetching data from Notion"));

  // send the database data
  // eslint-disable-next-line consistent-return
  return read(graph.dbId, notionToken).then((pages) => res.json(pages));
});

export default router;
