import { useContext } from "react";
import { AppContext } from "../Context/context";

export const useMode = (): ["light" | "dark", VoidFunction] => {
  const { state, dispatch } = useContext(AppContext);
  if (state === undefined) {
    throw new Error("useMode must be used within a ContextProvider");
  }
  const toggleMode = () => {
    dispatch({ type: "TOGGLE_MODE", payload: undefined });
  };
  return [state.mode, toggleMode];
};
