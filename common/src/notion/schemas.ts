import { Property as NotionProperty } from "@notionhq/client/build/src/api-types";

// these properties are 1:1 with Notion database properties
// there are 1 or more Variables to a property
// properties are associated with each row, variables aren't specific to one row
enum PropertyType {
  text = 'text',
  select = 'select',
  date = 'date',
}

type PropertyValue<T extends PropertyType> = 
  T extends PropertyType.date ? {start: string, end: string} :
  string;

interface Property<T extends PropertyType> {
  name: string,
  id: string,
  type: T
}

interface Cell<T extends PropertyType> extends Property<T> {
  value: PropertyValue<T>
}

export type AnyProperty = Property<PropertyType>;

export interface Database {
  title: string,

};