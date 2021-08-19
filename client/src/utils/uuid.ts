import short from "short-uuid";

export const shortUuid = (): short.SUUID => short.generate();
export const uuid = (): short.UUID => short.uuid();
