import { getData } from "common/lib";
import { Graph } from "common/lib/firestore/schemas";
import { FunState } from "fun-state";
import { useContext, useEffect } from "react";
import { AppContext, graphCache, Graphs, Cache, User } from "../State/context";
import { firestore } from "../Services/Firebase";
import { useAuth } from "./useAuth";
import { setUserStore } from "./useStore";

// interface for accessing and modifying graphs
// data lives in firestore but is cached in session storage
// can get all graphs, the most recent N graphs, or one graph by graph id

// todo: use localstorage with expiration instead of session storage?
// todo: make sure dbName gets updated when graph is fetched from Notion

const sortBySavedDescending = (graphs: Graph[]) =>
  graphs.sort((g1, g2) => g2.lastSaved.localeCompare(g1.lastSaved));

const fetchGraphs = async (
  uid: string,
  startAfter: Graph["lastSaved"],
  limit?: number
): Promise<Cache> => {
  console.log(startAfter, limit);
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

const fetchGraph = async (uid: string, gid: string): Promise<Graph | null> => {
  return getData<Graph>(firestore.graphs(uid), gid.toString()).then(
    (graph) => graph ?? null
  );
};

// create or update
const setGraph = async (state: FunState<Graphs>, graph: Graph, user: User) => {
  console.log(graph);
  const all = state.prop("all").get();
  const { id } = graph;
  state.prop("all").mod((original) => {
    const graphs = [...original];
    const idx = all.findIndex((g) => g.id === graph.id);
    if (idx > -1) {
      graphs[idx] = graph;
    } else {
      graphs.push(graph);
    }
    sortBySavedDescending(graphs);
    console.log("graphs", graphs);
    return graphs;
  });
  setUserStore("graphs", localStorage, state.get());
  return firestore.graphs(user.uid).doc(id.toString()).set(graph);
};

const deleteGraph = async (
  state: FunState<Graphs>,
  graph: Graph,
  user: User
) => {
  const all = state.prop("all").get();
  const { id } = graph;
  const idx = all.findIndex((g) => g.id === graph.id);

  state.prop("all").mod((original) => {
    const newAll = [...original];
    newAll.splice(idx, 1);
    return newAll;
  });
  return firestore
    .graphs(user.uid)
    .doc(id.toString())
    .delete()
    .then(() => {
      setUserStore("graphs", localStorage, state.get());

      const restore = () => {
        setGraph(state, graph, user);
      };

      return restore;
    });
};

const cacheResults = (results: Cache) =>
  setUserStore("graphs", localStorage, {
    all: results.all,
    preview: results.preview,
  });

const emptyPromise = <T>(val?: T) => new Promise<T>(val ? () => val : () => {});

export const useGraphs = ({
  limit,
  gid,
}: {
  limit?: number;
  gid?: string;
}): {
  graphs: Graph[];
  set: (g: Graph) => Promise<void>;
  remove: (g: Graph) => Promise<VoidFunction>;
  isLoading: boolean;
} => {
  const { auth } = useAuth();
  const { user } = auth.get();
  const state = useContext(AppContext).state.prop("graphs");

  const { all: allGraphs } = state.get();

  // fetch from firestore
  useEffect(() => {
    // this should do nothing after the first time the cache is fetched
    if (user) state.mod((s) => ({ ...s, ...graphCache() }));
    const { all, preview } = state.get();
    // gid is specified so we want 1 graph
    if (user && gid) {
      if (gid === "none") return;
      const graph = all.find((g) => g.id === gid);
      if (!graph) {
        state.prop("isLoading").set(true);
        console.log("fetch one");
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
              cacheResults(state.get());
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
        console.log("fetch many");
        fetchGraphs(
          user.uid,
          startAfter,
          limit ? limit - all.length : undefined
        ).then((graphs) => {
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
          cacheResults(state.get());
        });
      }
    }
  }, [limit, gid, user?.uid]);

  // useEffect(() => {
  //   console.log("changed", state);
  // }, [state]);

  // for debugging :))
  useEffect(() => {
    if (process.env.NODE_ENV === "development")
      Object.assign(window, { graphs: state });
  }, [state]);

  const graphs = gid
    ? allGraphs.filter((g) => g.id === gid)
    : allGraphs.slice(0, limit);

  const set = (graph: Graph) => {
    if (user) {
      return setGraph(state, graph, user);
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
    remove,
    isLoading: state.prop("isLoading").get(),
  };
};
