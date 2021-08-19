import React, { createContext, useEffect, ReactNode } from "react";
import { getData, User as FirestoreUser } from "common";
import firebase from "firebase";
import { useHistory, useLocation } from "react-router-dom";
import useFunState, { FunState, mockState } from "fun-state";
import { Graph } from "common/lib/firestore";
import { auth as authService, firestore } from "../Services/Firebase";
import { getUserStore, setUserStore } from "../hooks/useStore";

export interface User extends FirestoreUser {
  workspaceIcon: string | null;
}
export interface Auth {
  loggedIn: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface Cache {
  preview: boolean;
  all: Graph[];
}

export interface Graphs extends Cache {
  isLoading: boolean;
}

interface Context {
  auth: Auth;
  mode: "light" | "dark";
  graphs: Graphs;
}

export type Mode = "dark" | "light";

const initMode = getUserStore<Mode>("previewMode", localStorage);
export const graphCache = (): Cache => {
  // console.log("getting cache", getUserStore<Cache>("graphs", sessionStorage));
  return (
    getUserStore<Cache>("graphs", sessionStorage) ?? { all: [], preview: true }
  );
};

// Initial global state
const initialState: Context = {
  auth: {
    loggedIn: false,
    user: null,
    isLoading: true,
  },
  mode: initMode ?? "light",
  graphs: {
    ...(getUserStore<Cache>("graphs", sessionStorage) ?? {
      preview: true,
      all: [],
    }),
    isLoading: false,
  },
};

// turns a firebase auth user into the structure the application needs using a db call
export const consumeUser = async (
  user: firebase.User | null
): Promise<User | null> => {
  if (user === null) return null;
  const cachedUser = getUserStore<User>("user", sessionStorage);
  if (cachedUser && cachedUser.uid === user.uid) return cachedUser;
  console.log("fetch user from database");
  const dbUser: FirestoreUser | undefined = await getData(
    firestore.users,
    user.uid
  );
  if (!dbUser) return null;
  const u = {
    uid: user.uid,
    workspaceName: user.displayName ?? user.uid.slice(0, 8),
    workspaceIcon: user.photoURL,
    passkeys: dbUser.passkeys,
  };
  setUserStore("user", sessionStorage, u);
  return u;
};

export const AppContext = createContext<{ state: FunState<Context> }>({
  state: mockState(initialState),
});

export const GlobalProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const state = useFunState<Context>(initialState);
  const { mode } = state.get();
  const location = useLocation();
  const history = useHistory();
  // this should just be if there's auth persistence from another session
  useEffect(() => {
    const unsub = authService().onAuthStateChanged((user) => {
      if (user !== null && state.prop("auth").prop("user").get() === null) {
        state.prop("auth").prop("isLoading").set(true);
        consumeUser(user).then((u) => {
          state.prop("auth").set({
            loggedIn: true,
            user: u,
            isLoading: false,
          });
        });
      } else {
        state.prop("auth").set({
          loggedIn: false,
          user: null,
          isLoading: false,
        });
      }
    });
    return unsub;
  }, []);

  // log a user in when redirected from the oauth flow with a valid token
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      state.prop("auth").prop("isLoading").set(true);
      queryParams.delete("token");
      authService()
        .signInWithCustomToken(token)
        .then((userCredential) => consumeUser(userCredential.user))
        .then((user) => {
          state.prop("auth").set({
            loggedIn: user !== null,
            user,
            isLoading: false,
          });
        });

      history.replace({ search: queryParams.toString() });
    }
  }, []);

  useEffect(() => {
    setUserStore("previewMode", localStorage, mode);
  }, [mode]);

  // for debugging :))
  useEffect(() => {
    if (process.env.NODE_ENV === "development")
      Object.assign(window, { state });
  }, [state]);

  return (
    <AppContext.Provider value={{ state }}>{children}</AppContext.Provider>
  );
};
