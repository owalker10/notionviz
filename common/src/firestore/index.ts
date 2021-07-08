/// <reference lib="dom" />
import firebase from "firebase"
import { User, Graph, Feedback, Private } from "./schemas";
import admin from "firebase-admin";

// firestore and firebase-admin have different types which is really annoying and results in a disgusting file so I apologize in advanced
//
// firestore schema looks like this:
// database
// |
// |--- "user" collection (User)
// |     |--- "graphs" subcollection (Graph)
// |     |--- "private" subcollection (documents are keys in Private)
// |
// |--- "feedback collection" (Feedback)
//
// ** for the private subcollection, there is one document corresponding to each member in the Private interface
//    and each of those documents contain one member of the same name as the document
//    i.e   private(uid).doc("token").get().token

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

// subcollection of a document
type SubFactory<F,T> = (docid: string) => Col<F,T>

type PrivateDoc<K extends keyof Private> = {[k in K]: Private[k]}

// restricting the docid and keys so that only .doc(k).get().data().k is allowed for k in keyof Private
// we're replacing the signature of .doc() to do this
type PrivateCol<F> = (doc: string)
  => (Omit<Col<F,any>,'doc'>
      & { doc: <K extends keyof Private>(id: K) => firebase.firestore.DocumentReference<PrivateDoc<K>> | FirebaseFirestore.DocumentReference<PrivateDoc<K>> })

type UserCol<F> = Col<F, User> & {
    private: PrivateCol<F>,
    graphs: SubFactory<F,Graph>
};

interface TypedFirestore<F> {
  users: Col<F, User>;
  feedback: Col<F, Feedback>;
  private: PrivateCol<F>;
  graphs: SubFactory<F,Graph>;
}

// this might be the worst thing I've ever written
const asTypedDbInner = (db: FirestoreClient | FirestoreAdmin, local: boolean = true): TypedFirestore<typeof db> => {
  if (isNotAdmin(db) && local) db.useEmulator("localhost",8080);
  const Collection = isNotAdmin(db)
  ? (<T>(collectionPath: string) => db.collection(collectionPath).withConverter<T>(converter<T,typeof db>()))
  : (<T>(collectionPath: string) => db.collection(collectionPath).withConverter(converter<T, typeof db>()))

  const SubCollection = <T>(collection: ClientCollection<any> | AdminCollection<any>, subpath: string) => {
    return (isNotAdmin(db)
  ?  (doc: string) => (collection as ClientCollection<any>).doc(doc).collection(subpath).withConverter<T>(converter<T,typeof db>())
  : (doc: string) => (collection as AdminCollection<any>).doc(doc).collection(subpath).withConverter(converter<T,typeof db>())
  );}

  const users = Collection<User>('users');
  const feedback = Collection<Feedback>('feedback');
  const priv: PrivateCol<typeof db> = SubCollection<Private>(users,'private');

  return {
    users,
    feedback,
    private: SubCollection<Private>(users,'private'),
    graphs: SubCollection<Graph>(users,'graphs'),
  };
}

// thanks obama this is so gross
export const asTypedDb = <F extends FirestoreClient | FirestoreAdmin>(db: F, local: boolean = true) => asTypedDbInner(db, local) as TypedFirestore<F>;
export * from './schemas';
export const getData = async <T>(col: ClientCollection<T> | AdminCollection<T>, id: string): Promise<T | undefined> => {
  return await col.doc(id).get().then(doc=>doc.exists ? doc.data() : undefined);
}