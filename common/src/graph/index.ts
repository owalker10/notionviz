import { AnyProperty, Property, PropertyType } from "../notion/schemas";

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

export type VarType = "categorical" | "numerical" | "time";

interface VarOptions {
  label: string;
  exclude: string; // comma separated
  empty: 'ignore' | 'include';
  formatting: 'number' | 'percent' | 'dollar';
  rounding: 0 | 1 | 2 | 3 | 'none';
}

export const defaultOptions: VarOptions = {
  label: '',
  exclude: '',
  empty: 'ignore',
  formatting: 'number',
  rounding: 'none',
}

export interface Variable<T extends VarType> {
  type: T;
  property: AnyProperty;
  id: string;
  options: VarOptions;
}

export type AnyVariable = Variable<VarType>;

export interface Categorical extends Variable<"categorical"> {
  type: "categorical";
}

export interface Numerical extends Variable<"numerical"> {
  type: "numerical";
  fn: Function;
}

export interface Time extends Variable<"time"> {
  type: "time";
  property: Property<PropertyType.CreatedTime> | Property<PropertyType.Date>;
  scale: TimeScale;
}

export enum TimeScale {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}

export enum Function {
  CountAll = "Count all",
  CountValues = "Count values",
  CountUniqueValues = "Count unique values",
  CountEmpty = "Count empty",
  CountNotEmpty = "Count not empty",
  PercentEmpty = "Percent empty",
  PercentNotEmpty = "Percent not empty",
  // numerical only
  Sum = "Sum",
  Average = "Average",
  Median = "Median",
  Min = "Min",
  Max = "Max",
  Range = "Range"
}

const isCategoricalFunction = (f: Function) => !["Sum", "Average", "Median", "Min", "Max", "Range"].includes(f)

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
  x: AnyVariable;
  y: AnyVariable;
  group: AnyVariable;
}

// @ts-ignore
const defaults: { [key in keyof typeof GraphType]: null } = Object.fromEntries(
  Object.keys(GraphType).map((gtype: string) => [gtype as GraphType, null])
);

export const getXAlias = (type: GraphType): string =>
  ({
    ...defaults,
    [GraphType.pie]: "arcs",
    [GraphType.waffle]: "groups",
    [GraphType.calendar]: "days",
  }[type] ?? "x-axis");

export const getYAlias = (type: GraphType): string =>
  ({
    ...defaults,
    [GraphType.pie]: "sizes",
    [GraphType.waffle]: "values",
    [GraphType.calendar]: "values",
  }[type] ?? "y-axis");

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

const axes = {
  [GraphType.bar]: {
    x: "categorical",
    y: "numerical",
    groupOptional: "categorical",
  },
  [GraphType.line]: {
    x: "numerical",
    y: "numerical",
    group: "categorical",
    optional: true,
  },
  [GraphType.pie]: {
    x: "categorical",
    y: "numerical",
  },
  [GraphType.waffle]: {
    x: "categorical",
    y: "numerical",
  },
  [GraphType.calendar]: {
    x: "time",
    y: "numerical",
  },
  [GraphType.heatmap]: {
    x: "categorical",
    y: "categorical",
    group: "numerical",
  }
} as const;

export const getAxisVariable = (type: GraphType): {
  x: VarType,
  y: VarType,
  group?: VarType,
  optional: boolean,
} => ({
  x: axes[type].x,
  y: axes[type].y,
  group: (axes[type] as any).group ?? undefined as VarType | undefined,
  optional: (axes[type] as any).optional ?? false as boolean
});

interface Bar extends Graph {
  type: GraphType.bar;
  x: Categorical;
  y: Numerical;
  group: Categorical; // can require an optional
}

// turn on Notion property into all possible graph variables
export const propertyToVariables = (property: AnyProperty): AnyVariable[] => {
  const options = defaultOptions;
  const vars: Array<Omit<AnyVariable, 'id'>> = [];
  if (property.type === PropertyType.Date || property.type === PropertyType.CreatedTime){
    Object.values(TimeScale).map(scale => vars.push({ type: 'time', scale, property, options} as Omit<AnyVariable, 'id'>))
  }
  vars.push({ type: 'categorical', property, options});
  const functions = Object.values(Function).map(fn => ({ type: 'numerical' as const, fn, property, options}));
  if (property.type !== PropertyType.Number)
    vars.push(...functions.filter(f => isCategoricalFunction(f.fn)))
  else vars.push(...functions);
  return vars.map(v => ({
    ...v,
    id: v.property.id+'+'+Object.values(v).filter(prop => typeof prop === 'string').join('+'),
  }));
}

export const getVariables = (variables: AnyVariable[], type: GraphType, axis: 'x' | 'y' | 'group') => {
  // special cases
  if (type === GraphType.line && axis === 'x'){
    // return variables.filter(v => ['time', 'numerical'].includes(v.type));
    const timeVars = variables.filter(v => v.type === 'time');
    const numericalIds = variables.filter(v => v.type === 'numerical').map(v => v.property.id);
    const categoricalVarsThatAreNumbers = variables.filter(v => v.type === 'categorical' && numericalIds.includes(v.property.id));
    return timeVars.concat(categoricalVarsThatAreNumbers);
  }
  if (type === GraphType.calendar && axis === 'x'){
    return variables.filter(v => v.type === 'time' && (v as Time).scale === TimeScale.Day)
  }
  // otherwise generally follows the axes labels
  const varType = (axes[type] as any)[axis] as VarType | undefined;
  return variables.filter(v => v.type === varType)
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
