import { FunState } from "fun-state";
import { useContext } from "react";
import { AppContext, Auth } from "../Context/context";
import { localAuthUrl } from "../Services/api";
import { auth as authService } from "../Services/Firebase";
import { clearUserStore } from "./useStore";

export const useAuth = (): {
  logout: VoidFunction;
  auth: FunState<Auth>;
  incrementGid: VoidFunction;
} => {
  const authState = useContext(AppContext).state.prop("auth");
  const logout = () => {
    clearUserStore();
    authState.prop("isLoading").set(true);
    authService().signOut();
  };
  const incrementGid = () =>
    authState
      .prop("user")
      .mod((u) => (u ? { ...u, nextGid: u.nextGid + 1 } : u));
  return { auth: authState, logout, incrementGid };
};

export const authRedirectURL = `${
  process.env.NODE_ENV === "development" &&
  process.env.REACT_APP_HOST !== "true"
    ? localAuthUrl
    : ""
}/auth/redirect`;
