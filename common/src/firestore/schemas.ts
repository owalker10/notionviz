import { GraphType } from "../graph";

export interface Graph {
  gid: string;
  db: string;
  uid: string;
  type: GraphType;
  datapoints: number[]; // todo
  props: string[] // todo
}

export interface User {
  uid: string;
  workspaceName: string;
  accessToken: string;
  graphs: string[]; // gid's
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