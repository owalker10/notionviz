import React, { createContext, useReducer, useEffect, ReactNode } from "react";
import { getData, User as FirestoreUser } from "common";
import firebase from "firebase";
import { useHistory, useLocation } from "react-router-dom";
import { auth as authService, firestore } from "../Services/Firebase";

interface User extends FirestoreUser {
  workspaceIcon: string | null;
}

export interface Auth {
  loggedIn: boolean;
  user: User | null;
}

interface Context {
  auth: Auth;
  mode: "light" | "dark";
}
type ActionType = "LOGIN" | "LOGOUT" | "TOGGLE_MODE";

type ActionPayload = {
  LOGIN: { user: User | null };
  LOGOUT: undefined;
  TOGGLE_MODE: undefined;
};

interface Action<T extends ActionType> {
  type: T;
  payload: ActionPayload[T];
}

const initMode = localStorage.getItem("previewMode");
// Initial global state
const initialState = {
  auth: {
    loggedIn: false,
    user: null,
  },
  mode: (initMode === "dark" ? "dark" : "light") as "dark" | "light",
};

// turns a firebase auth user into the structure the application needs using a db call
export const consumeUser = async (
  user: firebase.User | null
): Promise<User | null> => {
  console.log("CONSUME");
  if (user === null) return null;
  console.log("users:", firestore.users);
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

const reducer = <T extends ActionType>(
  state: Context,
  action: Action<T>
): Context => {
  switch (action.type) {
    case "LOGIN": {
      const user = action.payload?.user ?? null;
      return {
        ...state,
        auth: {
          loggedIn: user !== null,
          user,
        },
      };
    }
    case "LOGOUT":
      return {
        ...state,
        auth: {
          loggedIn: false,
          user: null,
        },
      };
    case "TOGGLE_MODE":
      return {
        ...state,
        mode: state.mode === "light" ? "dark" : "light",
      };
    default:
      return state;
  }
};

export const AppContext = createContext<{
  state: Context;
  dispatch: <A extends ActionType>(a: Action<A>) => void;
}>({
  state: initialState,
  dispatch: () => null,
});

export const GlobalProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { mode } = state;
  const { currentUser } = authService;
  const location = useLocation();
  const history = useHistory();
  // this should just be if there's auth persistence from another session
  useEffect(() => {
    if (currentUser !== null) {
      consumeUser(currentUser).then((user) => {
        dispatch({
          type: "LOGIN",
          payload: { user },
        });
      });
    }
  }, []);

  // log a user in when redirected from the oauth flow with a valid token
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      queryParams.delete("token");
      authService
        .signInWithCustomToken(token)
        .then((userCredential) => consumeUser(userCredential.user))
        .then((user) => {
          dispatch({
            type: "LOGIN",
            payload: { user },
          });
        });

      history.replace({ search: queryParams.toString() });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("previewMode", JSON.stringify(mode));
  }, [mode]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
