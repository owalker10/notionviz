export interface DatabaseQueryPayload {
  idToken?: string;
  passkey?: string;
  uid: string;
  graphId?: string;
  dbId?: string;
  schema?: boolean;
}

export interface DatabaseListPayload {
  idToken: string;
  uid: string;
}