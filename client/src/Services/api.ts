import {
  AnyProperty,
  Database,
  DatabaseListPayload,
  DatabaseQueryPayload,
  Row,
} from "common/lib";
import { getUserStore, setUserStore } from "../hooks/useStore";
import { auth } from "./Firebase";

const localApiUrl = "http://localhost:5001/notion-viz/us-central1/api/api";

export const endpoint = (slug: string): string =>
  `${
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_HOST !== "true"
      ? localApiUrl
      : ""
  }${slug}`;

type FetchDatabaseReturn<Schema extends boolean> = {
  rows: Row[];
  schema: Schema extends true ? AnyProperty[] : never;
  id: string;
};

export const fetchDatabase = async <Schema extends boolean>(
  uid: string,
  graphId: string,
  dbId: string,
  schema: Schema, // if true, schema property contains Notion database properties
  passkey?: string,
  cacheBypass = false
): Promise<FetchDatabaseReturn<Schema>> => {
  // will only cache one db at a time
  const cachedDb = getUserStore<FetchDatabaseReturn<Schema>>(
    "database",
    sessionStorage
  );
  if (
    cachedDb &&
    cachedDb.rows &&
    (cachedDb.schema || !schema) &&
    cachedDb.id === dbId &&
    !cacheBypass
  )
    return cachedDb;

  const idToken = await auth().currentUser?.getIdToken(true);
  const payload: DatabaseQueryPayload = {
    uid,
    graphId,
    passkey,
    idToken,
    schema,
    dbId,
  };
  const db = await fetch(endpoint("/notion/query"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => res.json());
  setUserStore("database", sessionStorage, db);
  return db;
};

// fetch all available Notion databases (with localstorage cache)
export const listDatabases = async (
  uid: string,
  cacheBypass = false
): Promise<Database[]> => {
  const cachedDbs = getUserStore<Database[]>("databases", sessionStorage);
  if (cachedDbs && cachedDbs.length > 0 && !cacheBypass) return cachedDbs;
  const idToken = await auth().currentUser?.getIdToken(true);
  if (!idToken) return [];
  const payload: DatabaseListPayload = {
    uid,
    idToken,
  };
  const dbs: Database[] = await fetch(endpoint("/notion/databases"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => res.json());
  setUserStore("databases", sessionStorage, dbs);
  return dbs;
};
