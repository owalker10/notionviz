import { getAxisVariable, GraphType } from "common/lib/graph";
import { Graph } from "common/lib/firestore";
import { Database } from "common/lib/notion/schemas";

export const isValidGraphType = (t: string): t is GraphType =>
  Object.values(GraphType).includes(t as GraphType);

export const isValidDb = (id: string, dbs: Database[]): boolean =>
  dbs.map((db) => db.id).includes(id);

export const isValidGraph = (graph: Graph): string | null => {
  if (!isValidGraphType(graph.type)) return "graph type";
  const { group, optional } = getAxisVariable(graph.type);
  if (!graph.name) return "graph name";
  if (!graph.dbId) return "database id";
  if (typeof graph.isPublic !== "boolean") return "isPublic";
  // props: string[];
  if (!graph.x.id) return "x id";
  if (!graph.y.id) return "y id";
  if (group && !optional && !graph.group.id) return "group id";
  return null;
};
