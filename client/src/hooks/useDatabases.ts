import { Database } from "common/lib/notion";
import { FunState } from "fun-state";
import { useEffect } from "react";
import { listDatabases } from "../Services/api";

interface State {
  databases: Database[];
  dbLoading: boolean;
}

export const useDatabases = <S extends State>(
  uid: string | undefined,
  state: FunState<S>
): VoidFunction => {
  useEffect(() => {
    if (uid) {
      state.prop("dbLoading").set(true);
      listDatabases(uid)
        .then(state.prop("databases").set)
        .finally(() => state.prop("dbLoading").set(false));
    }
  }, [uid]);

  // refresh
  return () => {
    if (uid) {
      state.prop("dbLoading").set(true);
      listDatabases(uid, true)
        .then(state.prop("databases").set)
        .finally(() => state.prop("dbLoading").set(false));
    }
  };
};
