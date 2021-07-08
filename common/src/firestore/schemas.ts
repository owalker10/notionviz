import { GraphType } from "../graph";

export interface Graph {
  gid: string;
  db: string;
  type: GraphType;
  public: boolean;
  lastOpened: Date;
  datapoints: number[]; // todo
  props: string[] // todo
}

export interface User {
  uid: string;
  workspaceName: string;
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