import { DatabaseQueryPayload } from "common/lib";
import { auth } from "./Firebase";

const localApiUrl = "http://localhost:5001/notion-viz/us-central1/api/api";

export const endpoint = (slug: string): string =>
  `${
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_HOST !== "true"
      ? localApiUrl
      : ""
  }${slug}`;

export const fetchDatabase = async (
  uid: string,
  graphId: string,
  passkey?: string
) => {
  const idToken = await auth().currentUser?.getIdToken(true);
  const payload: DatabaseQueryPayload = {
    uid,
    graphId,
    passkey,
    idToken,
  };
  return fetch(endpoint("/notion/query"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => res.json());
};
