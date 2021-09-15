import { CheckboxPropertyValue, CreatedTimePropertyValue, Database as NotionDB, DatePropertyValue, MultiSelectPropertyValue, NumberPropertyValue, Page, PeoplePropertyValue, RichTextPropertyValue, SelectPropertyValue } from "@notionhq/client/build/src/api-types";
import { Cell, Database, Property, PropertyType, PropertyValue, Row } from "./schemas";

export const cellIsType = <T extends PropertyType>(cell: Cell<PropertyType>, type: T): cell is Cell<T> => cell.type === type;
export const propertyIsType = <T extends PropertyType>(prop: Property<PropertyType>, type: T): prop is Property<T> => prop.type === type;

export const convertList = (dbs: NotionDB[]): Database[] => dbs.map(db => ({
  name: db.title.map(el => el.plain_text).join(''),
  id: db.id,
  last_edited_time: db.last_edited_time,
}));

export const convertQuery = (pages: Page[]) => 
  pages.map(page => {
    const row: Row = {};
    Object.entries(page.properties).map(([name, prop]) => {
      const type = prop.type;
      let val: PropertyValue[PropertyType] = '';
      switch (type){
        case PropertyType.Checkbox: val = (prop as CheckboxPropertyValue).checkbox; break;
        case PropertyType.CreatedTime: val = new Date((prop as CreatedTimePropertyValue).created_time); break;
        case PropertyType.Date: {
          const end = (prop as DatePropertyValue).date.end;
          val = new Date((prop as DatePropertyValue).date.start);
          break;
        }
        case PropertyType.Multiselect: val = (prop as MultiSelectPropertyValue).multi_select.map(option => option.name); break;
        case PropertyType.Number: val = (prop as NumberPropertyValue).number; break;
        case PropertyType.People: val = (prop as PeoplePropertyValue).people.map(person => person.name ?? '').filter(name => Boolean(name)); break;
        case PropertyType.Select: val = (prop as SelectPropertyValue).select.name; break;
        case PropertyType.Text: val = (prop as RichTextPropertyValue).rich_text.map(el => el.plain_text).join(''); break;
        
      }
      const castedType = type as PropertyType;
      if (Object.values(PropertyType).includes(castedType))
        row[name] = {type: castedType, value: val}
    })
    return row;
  })

export const convertSchemas = (props: NotionDB['properties']): Property<PropertyType>[] => Object.entries(props).map(([name, data]) => ({
  name,
  type: data.type as PropertyType,
  id: data.id,
})).filter(prop => Object.values(PropertyType).includes(prop.type))

export * from "./schemas";