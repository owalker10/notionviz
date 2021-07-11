import { AnyProperty } from "../notion/schemas";

export enum GraphType {
  bar = "bar",
  line = "line",
  pie = "pie",
  waffle = "waffle",
  calendar = "calendar",
  heatmap = "heatmap",
}

/* 
Properties are either quantitative or qualitative
  Quantitative: Number, Date (duration), Checkbox
  Qualitative: Name, Select, Multiselect, Person, Date (start/end, day, month, week, year)

Variables can either be numerical or categorical
  Numerical: COUNT[other axis], SUM(quantitative property), AVG(quantitative property)
  Categorical: any property
  - i.e. Status + COUNT, Genre + AVG(pages) for average page count by genre, etc.
*/

type VarType = "categorical" | "numerical";

interface Variable {
  type: VarType;
}

// ex: due date: date
interface Categorical extends Variable {
  type: "categorical";
  property: AnyProperty;
}

interface Numerical extends Variable {
  type: "numerical";
  fn: "COUNT" | "AVG" | "SUM";
}

// interface Aggregator extends Numerical {
//   fn: 'COUNT' | 'SUM'
// }

// export abstract class Graph {
//   type: GraphType;
//   x: Variable;
//   y: Variable;
//   group?: Variable;

//   constructor(type: GraphType, x: Variable, y: Variable, group?: Variable) {
//     this.type = type;
//     this.x = x;
//     this.y = y;
//     this.group = group;
//   }

//   abstract plot(data: any): any; // data to datapoints

//   abstract getProps(): any;
// }

export interface Graph {
  type: GraphType;
  x: Variable;
  y: Variable;
  group?: Variable;
}

// @ts-ignore
const defaults: { [key in keyof typeof GraphType]: null } = Object.fromEntries(
  Object.keys(GraphType).map((gtype: string) => [gtype as GraphType, null])
);

const getXAlias = (type: GraphType): string =>
  ({
    [GraphType.pie]: "arcs",
    [GraphType.waffle]: "groups",
    [GraphType.calendar]: "days",
    ...defaults,
  }[type] ?? "x");

const getYAlias = (type: GraphType): string =>
  ({
    [GraphType.pie]: "sizes",
    [GraphType.waffle]: "values",
    [GraphType.calendar]: "values",
    ...defaults,
  }[type] ?? "y");

const getNivoAlias = (type: GraphType, axis: "x" | "y" | "group"): string =>
  ({
    [GraphType.bar]: {
      group: "id",
    },
    [GraphType.line]: {
      group: "id",
    },
    [GraphType.pie]: {
      x: "id",
      y: "value",
    },
    [GraphType.waffle]: {
      x: "id",
      y: "value",
    },
    [GraphType.calendar]: {
      x: "day",
      y: "value",
    },
    [GraphType.heatmap]: {
      // this one is kinda weird-- see https://nivo.rocks/heatmap/
    },
  }[type]?.[axis] ?? axis);

interface Bar extends Graph {
  type: GraphType.bar;
  group: Variable; // can require an optional
}

// use d3-array !
// https://github.com/d3/d3-array
// colors need to go in here too maybe?

// 2 categorial 1 quantitative
// graph = 'line', x_var = 'time', y_var = 'COUNT', group = 'type'
// data = []
// for g in group:
//   rows = db.where(g == db.group)
//   group_data = {}
//   for x in x_var:
//     rows = rows.where(x == db.x)
//     y = aggregate(rows) // rows.length
//     group_data.append({x, y})
//   data.append({id: g, data: group_data})
// data.sort()

// 1 categorical 1 quantitative
// graph = 'pie', x_var = 'category', y_var = 'SUM(cost)'
// data = []
// for x in x_var:
//   rows = rows.where(x == db.x)
//     y = aggregate(rows) // for row in rows: sum += cost
//     data.append({id: x, value: y})
