import firebase from "firebase/app";
import { asTypedDb } from "common";

const firebaseConfig = {
  apiKey: "AIzaSyAZXZLkhR40zZvlNforP4uJq45cZZjw7mU",
  authDomain: "notion-viz.firebaseapp.com",
  projectId: "notion-viz",
  storageBucket: "notion-viz.appspot.com",
  messagingSenderId: "1039173547535",
  appId: "1:1039173547535:web:c5d54482a5dee3af70157a",
  measurementId: "G-WKWGV2FCRS",
};

export default !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

if (
  process.env.NODE_ENV === "development" ||
  process.env.REACT_APP_HOST === "true"
)
  firebase.auth().useEmulator("http://localhost:9099");

export const auth = firebase.auth();
export const firestore = asTypedDb(
  firebase.firestore(),
  process.env.NODE_ENV === "development" ||
    process.env.REACT_APP_HOST === "true"
);
