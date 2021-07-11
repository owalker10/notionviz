import { useContext } from "react";
import { AppContext, Mode } from "../Context/context";

export const useMode = (): {
  mode: Mode;
  toggleMode: VoidFunction;
} => {
  const state = useContext(AppContext).state.prop("mode");
  const toggleMode = () => {
    state.mod((mode) => (mode === "light" ? "dark" : "light"));
  };
  return { mode: state.get(), toggleMode };
};
