import { defaultOptions, Graph as GraphBase, GraphType } from "../graph";
import { PropertyType } from "../notion/schemas";

export interface Graph extends GraphBase {
  name: string,
  id: string;
  dbName: string;
  dbId: string;
  isPublic: boolean;
  lastSaved: string;
  props: string[] // todo
}

export const defaultGraph: Graph = {
  name: '',
  id: '',
  dbName: '',
  dbId: '',
  isPublic: true,
  lastSaved: '',
  props: [],
  type: GraphType.bar,
  x: {
    type: "categorical",
    property: { name: "", id: "", type: PropertyType.Checkbox },
    id: '',
    options: defaultOptions,
  },
  y: {
    type: "numerical",
    property: { name: "", id: "", type: PropertyType.Checkbox },
    id: "",
    options: defaultOptions,
  },
  group: {
    type: "categorical",
    property: { name: "", id: "", type: PropertyType.Checkbox },
    id: '',
    options: defaultOptions,
  },
}
export interface User {
  uid: string;
  workspaceName: string;
  passkeys: Record<string, string>;
}

export interface Private {
  token: string;
  //secret: string;
}

export interface Feedback {
  uid: string;
  name: string;
  type: FeedbackType;
  time: string;
  content: string;
}

export enum FeedbackType {
  bug = 'Bug Report',
  suggestion = 'Feature Suggestion',
  question = 'Question',
  other = 'Other',
}