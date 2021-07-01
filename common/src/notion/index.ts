// https://developers.notion.com/docs/working-with-databases
// https://www.npmjs.com/package/@notionhq/client
import { APIErrorCode, APIResponseError, Client } from '@notionhq/client';
import { DatabasesQueryResponse, SearchResponse } from '@notionhq/client/build/src/api-endpoints';
import { Database as NotionDB, Page as NotionPage } from '@notionhq/client/build/src/api-types';
import { ClientOptions } from '@notionhq/client/build/src/Client';

let client = new Client();

export const config = (auth: string, options: ClientOptions) => { client = new Client({...options, auth}); }

// both of these functions can error!

// list databases (with pagination)
export const list = async () => {
  let has_more = true;
  let start_cursor = undefined;
  const databases: NotionDB[] = [];
  while (has_more) {
    const results: SearchResponse = await client.search({
      filter: { property: 'object', value: 'database'},
      start_cursor,
    })
    databases.concat(results.results as NotionDB[]); // todo change this to schemas.ts Database
    has_more = results.has_more;
    start_cursor = results.next_cursor ?? undefined;
  }
  return databases;
}

// read database (with pagination)
export const read = async (database_id: string) => {
  let has_more = true;
  let start_cursor = undefined;
  const pages: NotionPage[] = []; // todo change this to schemas.ts Page
  while (has_more) {
    const results: DatabasesQueryResponse = await client.databases.query({
      database_id,
      start_cursor,
    })
    pages.concat(results.results as NotionPage[]); // change this to schemas.ts Database
    has_more = results.has_more;
    start_cursor = results.next_cursor ?? undefined;
  }
  return pages;
}


export const isAPIResponseError = APIResponseError.isAPIResponseError
export { APIErrorCode };