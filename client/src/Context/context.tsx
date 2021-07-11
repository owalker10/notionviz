import React, { createContext, useEffect, ReactNode } from "react";
import { getData, User as FirestoreUser } from "common";
import firebase from "firebase";
import { useHistory, useLocation } from "react-router-dom";
import useFunState, { FunState, mockState } from "fun-state";
import { auth as authService, firestore } from "../Services/Firebase";
import { getUserStore, setUserStore } from "../hooks/useStore";

interface User extends FirestoreUser {
  workspaceIcon: string | null;
}

export interface Auth {
  loggedIn: boolean;
  user: User | null;
  isLoading: boolean;
}

interface Context {
  auth: Auth;
  mode: "light" | "dark";
}

export type Mode = "dark" | "light";

const initMode = getUserStore<Mode>("previewMode", localStorage);
// Initial global state
const initialState: Context = {
  auth: {
    loggedIn: false,
    user: null,
    isLoading: false,
  },
  mode: initMode ?? "light",
};

// turns a firebase auth user into the structure the application needs using a db call
export const consumeUser = async (
  user: firebase.User | null
): Promise<User | null> => {
  console.log("CONSUME");
  if (user === null) return null;
  const dbUser: FirestoreUser | undefined = await getData(
    firestore.users,
    user.uid
  );
  if (!dbUser) return null;
  return {
    uid: user.uid,
    workspaceName: user.displayName ?? user.uid.slice(0, 8),
    workspaceIcon: user.photoURL,
  };
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
  const { currentUser } = authService;
  const location = useLocation();
  const history = useHistory();
  // this should just be if there's auth persistence from another session
  useEffect(() => {
    if (currentUser !== null) {
      state.prop("auth").prop("isLoading").set(true);
      consumeUser(currentUser).then((user) => {
        state.prop("auth").set({
          loggedIn: user !== null,
          user,
          isLoading: false,
        });
      });
    }
  }, []);

  // log a user in when redirected from the oauth flow with a valid token
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      state.prop("auth").prop("isLoading").set(true);
      queryParams.delete("token");
      authService
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
