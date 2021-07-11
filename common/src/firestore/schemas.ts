import { Graph as GraphBase } from "../graph";

export interface Graph extends GraphBase {
  gid: string;
  db: string;
  public: boolean;
  lastSaved: string;
  props: string[] // todo
}
export interface User {
  uid: string;
  workspaceName: string;
  nextGid: 0;
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