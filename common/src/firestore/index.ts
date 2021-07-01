/// <reference lib="dom" />
import firebase from "firebase"
import { User, Graph, Feedback } from "./schemas";
import admin from "firebase-admin";

// firestore and firebase-admin have different types which is really annoying

type FirestoreAdmin = FirebaseFirestore.Firestore;
type FirestoreClient = firebase.firestore.Firestore
type AdminCollection<T> = FirebaseFirestore.CollectionReference<T>;
type ClientCollection<T> = firebase.firestore.CollectionReference<T>;

const converter = <T, F extends FirestoreClient | FirestoreAdmin>() => {
  type Snap = F extends FirestoreAdmin ? FirebaseFirestore.QueryDocumentSnapshot : firebase.firestore.QueryDocumentSnapshot;
  return ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: Snap) =>
    snap.data() as T
  })
}

const isNotAdmin = (db: FirestoreClient | FirestoreAdmin): db is FirestoreClient => db instanceof firebase.firestore.Firestore;

type Col<F,T> = F extends FirestoreClient ? ClientCollection<T> :
F extends FirestoreAdmin ? AdminCollection<T>
: never;

interface TypedFirestore<F> {
  users: Col<F, User>;
  graphs: Col<F, Graph>;
  feedback: Col<F, Feedback>;
}

const asTypedDbInner = (db: FirestoreClient | FirestoreAdmin, local: boolean = true): TypedFirestore<typeof db> => {
  if (isNotAdmin(db) && local) db.useEmulator("localhost",8080);
  const Collection = isNotAdmin(db)
  ? (<T>(collectionPath: string) => db.collection(collectionPath).withConverter<T>(converter<T,typeof db>()))
  : (<T>(collectionPath: string) => db.collection(collectionPath).withConverter(converter<T, typeof db>()))

  return {
    users: Collection<User>('users'),
    graphs: Collection<Graph>('graphs'),
    feedback: Collection<Feedback>('feedback'),
  };
}

// thanks obama this is so gross
export const asTypedDb = <F extends FirestoreClient | FirestoreAdmin>(db: F, local: boolean = true) => asTypedDbInner(db, local) as TypedFirestore<F>;
export * from './schemas';
export const getData = async <T>(col: ClientCollection<T> | AdminCollection<T>, id: string): Promise<T | undefined> => {
  return await col.doc(id).get().then(doc=>doc.exists ? doc.data() : undefined);
}