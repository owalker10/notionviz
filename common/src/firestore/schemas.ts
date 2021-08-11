import { Graph as GraphBase } from "../graph";

export interface Graph extends GraphBase {
  name: string,
  gid: number;
  db: string;
  public: boolean;
  lastSaved: string;
  props: string[] // todo
}
export interface User {
  uid: string;
  workspaceName: string;
  nextGid: number;
}

export interface Private {
  token: string;
  //secret: string;
}

export interface Feedback {
  uid: string;
  name: string;
  type: FeedbackType;
  time: Date;
  content: string;
}

enum FeedbackType {
  bug = 'bug',
  suggestion = 'feature suggestion'
}