import { useContext } from "react";
import { AppContext, Auth } from "../Context/context";
import { localAuthUrl } from "../Services/api";
import { auth as authService } from "../Services/Firebase";

export const useAuth = (): { logout: VoidFunction; auth: Auth } => {
  const { state, dispatch } = useContext(AppContext);
  if (state === undefined) {
    throw new Error("useAuth must be used within a ContextProvider");
  }
  const logout = () => {
    authService.signOut().then(() => {
      dispatch({ type: "LOGOUT", payload: undefined });
    });
  };
  return { auth: state.auth, logout };
};

export const authRedirectURL = `${
  process.env.NODE_ENV === "development" &&
  process.env.REACT_APP_HOST !== "true"
    ? localAuthUrl
    : ""
}/auth/redirect`;
