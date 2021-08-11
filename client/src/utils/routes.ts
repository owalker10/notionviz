export const webPath = "web";
export const embedPath = "embed";
export const toWebPath = (path: string): string => `/${webPath}${path}`;
export const toEmbedPath = (path: string): string => `/${embedPath}${path}`;
