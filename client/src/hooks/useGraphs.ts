import { getData } from "common/lib";
import { Graph } from "common/lib/firestore/schemas";
import useFunState, { FunState } from "fun-state";
import { useEffect } from "react";
import { User } from "../Context/context";
import { firestore } from "../Services/Firebase";
import { useAuth } from "./useAuth";
import { getUserStore, setUserStore } from "./useStore";

// todo
// - session storage

interface Cache {
  preview: boolean;
  all: Graph[];
}

export interface Graphs extends Cache {
  isLoading: boolean;
}

const sortBySavedDescending = (graphs: Graph[]) =>
  graphs.sort((g1, g2) => g2.lastSaved.localeCompare(g1.lastSaved));

const fetchGraphs = async (
  uid: string,
  startAfter: Graph["lastSaved"],
  limit?: number
): Promise<Cache> => {
  let query = firestore.graphs(uid).orderBy("lastSaved", "desc");
  if (startAfter) query = query.startAfter(startAfter);
  if (limit) query = query.limit(limit);
  return query
    .get()
    .then((snap) => snap.docs.map((doc) => doc.data()))
    .then((graphs) => ({
      all: graphs,
      preview: Boolean(limit),
    }));
};

const fetchGraph = async (uid: string, gid: number): Promise<Graph | null> => {
  // const cachedGraphs = getUserStore<Graphs>("graphs", sessionStorage);
  // const cachedGraph =
  //   cachedGraphs && cachedGraphs?.all?.filter((g) => g.gid === gid)?.[0];
  // if (cachedGraph) return cachedGraph;
  return getData<Graph>(firestore.graphs(uid), gid.toString()).then(
    (graph) => graph ?? null
  );
};

// create or update
const setGraph = async (state: FunState<Graphs>, graph: Graph, user: User) => {
  const all = state.prop("all").get();
  const { gid } = graph;
  state.prop("all").mod((original) => {
    const graphs = [...original];
    const idx = all.findIndex((g) => g.gid === graph.gid);
    if (idx > -1) {
      graphs[idx] = graph;
    } else {
      graphs.push(graph);
    }
    sortBySavedDescending(graphs);
    return graphs;
  });
  setUserStore("graphs", sessionStorage, { ...state.get(), all });
  return firestore.graphs(user.uid).doc(gid.toString()).set(graph);
};

const deleteGraph = async (
  state: FunState<Graphs>,
  graph: Graph,
  user: User
) => {
  const all = state.prop("all").get();
  const { gid } = graph;
  const idx = all.findIndex((g) => g.gid === graph.gid);
  all.splice(idx, 1);

  return firestore
    .graphs(user.uid)
    .doc(gid.toString())
    .delete()
    .then(() => {
      state.prop("all").set(all);
      setUserStore("graphs", sessionStorage, { ...state.get(), all });

      const restore = () => {
        setGraph(state, graph, user);
      };

      return restore;
    });
};

export enum GraphAction {
  FetchGraph = "fetchGraph",
  FetchGraphs = "fetchGraphs",
  SetGraph = "setGraph",
  DeleteGraph = "deleteGraph",
}

const initState = {
  preview: true,
  all: [],
};

const initCachedState = (user: User | null): Cache =>
  user ? getUserStore<Cache>("graphs", sessionStorage) ?? initState : initState;

const emptyPromise = <T>(val?: T) => new Promise<T>(val ? () => val : () => {});

export const useGraphs = ({
  limit,
  gid,
}: {
  limit?: number;
  gid?: number;
}): {
  graphs: Graph[];
  set: (g: Graph) => Promise<void>;
  delete: (g: Graph) => Promise<VoidFunction>;
  isLoading: boolean;
} => {
  const { auth, incrementGid } = useAuth();
  const { user } = auth.get();
  const state = useFunState<Graphs>({
    ...initCachedState(user),
    isLoading: false,
  });

  const { all, preview } = state.get();

  // fetch from firestore
  useEffect(() => {
    // gid is specified so we want 1 graph
    if (user && gid) {
      const graph = all.filter((g) => g.gid === gid)[0];
      if (!graph) {
        state.prop("isLoading").set(true);
        fetchGraph(user.uid, gid)
          .then((newGraph) => {
            if (newGraph) {
              state.mod((s) => {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                const { all: all_, preview: preview_ } = s;
                sortBySavedDescending(all_);
                return {
                  all: all_.concat(newGraph),
                  preview: preview_,
                  isLoading: false,
                };
              });
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    } else if (user) {
      // if the list is partial and 1. we want more than we have or 2. we want all
      if (preview && ((limit && all.length < limit) || !limit)) {
        const startAfter = all[all.length - 1]?.lastSaved ?? "";
        state.prop("isLoading").set(true);
        fetchGraphs(user.uid, startAfter, limit).then((graphs) => {
          state.mod((s) => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { all: all_ } = s;
            sortBySavedDescending(all_);
            return {
              all: all_.concat(graphs.all),
              preview: graphs.preview,
              isLoading: false,
            };
          });
        });
      }
    }
  }, [limit, gid, user?.uid]);

  useEffect(() => {
    console.log("changed", state);
  }, [state]);

  // for debugging :))
  useEffect(() => {
    if (process.env.NODE_ENV === "development")
      Object.assign(window, { graphs: state });
  }, [state]);

  const graphs = gid ? all.filter((g) => g.gid === gid) : all.slice(0, limit);

  const set = (graph: Graph) => {
    if (user) {
      // eslint-disable-next-line consistent-return
      return setGraph(state, graph, user).then(() => {
        if (user.nextGid === graph.gid) {
          return firestore.users
            .doc(user.uid)
            .update({ nextGid: user.nextGid + 1 })
            .then(() => {
              incrementGid();
            });
        }
      });
    }
    return emptyPromise<void>();
  };

  // returns an "undo" function
  const remove = (graph: Graph) => {
    if (user) {
      return deleteGraph(state, graph, user);
    }
    return emptyPromise(() => {});
  };

  return {
    graphs,
    set,
    delete: remove,
    isLoading: state.prop("isLoading").get(),
  };
};
