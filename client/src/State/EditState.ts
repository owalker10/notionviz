import { defaultGraph, Graph } from "common/lib/firestore/schemas";
import { AnyProperty, Database, Row } from "common/lib/notion/schemas";

// todo: error
export interface EditState {
  graph: Graph;
  saved: boolean;
  created: boolean;
  databases: Database[];
  dbLoading: boolean;
  schema: AnyProperty[];
  data: Row[];
  dataLoading: boolean;
}

export const initEditState: EditState = {
  graph: defaultGraph,
  saved: true,
  created: false,
  databases: [],
  dbLoading: false,
  schema: [],
  data: [],
  dataLoading: true,
};

export const spinStyle = {
  spin: {
    animation: "$spin 1s linear 0s infinite",
  },
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
} as const;
