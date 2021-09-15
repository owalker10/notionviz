import { Property as NotionProperty } from "@notionhq/client/build/src/api-types";

export interface Database {
  id: string,
  name: string,
  last_edited_time: string,
}

// these properties are 1:1 with Notion database properties
// there are 1 or more Variables to a property
// properties are associated with each row, variables aren't specific to one row
export enum PropertyType {
  Text = 'rich_text',
  Select = 'select',
  Multiselect = 'multi_select',
  Date = 'date',
  People = 'people',
  Number = 'number',
  Checkbox = 'checkbox',
  CreatedTime = 'created_time',
}

// defined value types for each property type
export interface PropertyValue {
  rich_text: string;
  select: string;
  multi_select: string[];
  date: Date; // these are all ISO with or without time (time has UTC offset i.e. -04:00)
  people: string[], // needs to be converted
  number: number,
  checkbox: boolean,
  created_time: Date;
}

export interface Options extends Record<PropertyType, {}> {
  select: { options: Array<{id: string, name: string, color: Color}> };
  multiselect: Options['select']; 
  number: { format: 'number' | 'number_with_commas' | 'percent' | 'dollar'} ;
}

export interface Property<T extends PropertyType> {
  name: string,
  id: string,
  type: T,
}

export interface Cell<T extends PropertyType> {
  type: T,
  value: PropertyValue[T]
}

export type Row = Record<string,Cell<PropertyType>>;

export enum Color {
  Red = 'red',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
  Pink = 'pink',
  Brown = 'brown',
  Gray = 'gray',
  Default = 'default'
}

export const validFormats = ['number', 'number_with_commas', 'percent', 'dollar'];

export type AnyProperty = Property<PropertyType>;