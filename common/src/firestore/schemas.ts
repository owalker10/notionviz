import { Graph as GraphBase } from "../graph";

export interface Graph extends GraphBase {
  name: string,
  id: string;
  dbName: string;
  dbId: string;
  isPublic: boolean;
  lastSaved: string;
  props: string[] // todo
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