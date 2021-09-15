/* eslint-disable consistent-return */
import {
  asTypedDb,
  convertList,
  convertQuery,
  convertSchemas,
  DatabaseListPayload,
  DatabaseQueryPayload,
  getData,
  Graph,
} from "common";
import express from "express";
import admin from "firebase-admin";
import { list, read, schema } from "common/lib/notion/functions-only";
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
  const {
    graphId, // either graphId or dbId must be defined
    dbId, // only want this coming from authenticated client (aka has idToken)
    uid,
    idToken,
    passkey,
    schema: needSchema,
  } = req.body as DatabaseQueryPayload;
  if (!uid) return res.status(400).send(new Error("No uid specified."));
  if (!dbId && !graphId)
    return res
      .status(400)
      .send(new Error("No database id or graph id specified."));
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

  let myDbId = "";

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
    if (!dbId)
      return res.status(400).send(new Error("No database id specified."));
    myDbId = dbId;

    // if it's coming from an embed and the graph is not public, the request needs a passkey
  } else {
    const graph: Graph | undefined = graphId
      ? await getData(db.graphs(uid), graphId)
          .then((g) => {
            if (!g) throw new Error("Graph not found");
            return g;
          })
          .catch((err) => {
            res.status(404).send(err);
            return undefined;
          })
      : undefined;
    if (!graph || !graphId)
      return res.status(400).send(new Error("No graph id specified."));
    // check passkey
    if (!graph.isPublic) {
      if (!passkey) res.status(403).send(new Error("no passkey specified"));
      const truePasskey = user?.passkeys[graphId];
      if (!truePasskey)
        res.status(500).send(new Error("error verifying passkey"));
      if (truePasskey !== passkey)
        res.status(403).send(new Error("invalid passkey"));
      myDbId = graph.dbId;
    }
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
  const pages = await read(myDbId, notionToken);
  const rows = convertQuery(pages);
  if (needSchema) {
    const properties = await schema(myDbId, notionToken);
    const dbSchema = convertSchemas(properties);
    return res.json({
      rows,
      id: myDbId,
      schema: dbSchema,
    });
  }
  return res.json({ rows });
});

router.post("/databases", async (req, res) => {
  console.log(req.body);
  const { uid, idToken } = req.body as DatabaseListPayload;
  if (!uid) res.status(400).send(new Error("No uid specified."));

  const tokenUid = await admin
    .auth()
    .verifyIdToken(idToken)
    .then((dec) => dec.uid);
  if (tokenUid !== uid)
    res
      .status(403)
      .send(new Error("requested user does not match requester uid"));

  const notionToken = await db
    .private(uid)
    .doc("token")
    .get()
    .then((snap) => snap.data()?.token);
  if (!notionToken)
    // eslint-disable-next-line consistent-return
    return res.status(500).send(new Error("Error fetching data from Notion"));

  const notionDatabases = await list(notionToken);
  const databases = convertList(notionDatabases);
  return res.json(databases);
});

export default router;
