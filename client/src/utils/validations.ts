import { GraphType } from "common/lib/graph";
import { Database } from "common/lib/notion/schemas";

export const isValidGraphType = (t: string): t is GraphType =>
  Object.values(GraphType).includes(t as GraphType);

export const isValidDb = (id: string, dbs: Database[]): boolean =>
  dbs.map((db) => db.id).includes(id);
