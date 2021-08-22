import { FunState } from "fun-state";
import { useContext } from "react";
import { AppContext, Auth } from "../Context/context";
import { endpoint } from "../Services/api";
import { auth as authService } from "../Services/Firebase";
import { clearUserStore } from "./useStore";

export const useAuth = (): {
  logout: VoidFunction;
  auth: FunState<Auth>;
} => {
  const authState = useContext(AppContext).state.prop("auth");
  const logout = () => {
    clearUserStore();
    authState.prop("isLoading").set(true);
    authService().signOut();
  };

  return { auth: authState, logout };
};

export const authRedirectURL = endpoint("/auth/redirect");
