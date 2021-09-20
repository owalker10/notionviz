import { Graph } from "common/lib/firestore/schemas";
import {
  Function,
  GraphType,
  Numerical,
  Time,
  TimeScale,
} from "common/lib/graph";
import { PropertyType, PropertyValue, Row } from "common/lib/notion/schemas";
import { ResponsiveBar } from "@nivo/bar";
import React from "react";
import {
  countEmpty,
  countNotEmpty,
  median,
  notEmpty,
  sum,
} from "../../utils/graph";

// MVP graph renderer (just does simple bar graphs for now)

type AnyValue = PropertyValue[PropertyType];

const add = (
  keys: string[],
  value: AnyValue | undefined,
  map: Record<string, (AnyValue | undefined)[]>
) => {
  console.log(keys, value, map);
  // todo: cases by graph type?
  // todo: convert empty values ("",[]) to undefined
  keys.forEach((k) => {
    if (!Object.keys(map).includes(k)) {
      // eslint-disable-next-line no-param-reassign
      map[k] = [];
    }
    map[k].push(value);
  });
};

export default ({
  graph,
  data,
}: {
  graph: Graph;
  data: Row[];
}): JSX.Element => {
  console.log(graph.type, data);
  if (graph.type === GraphType.bar) {
    const { x, y } = graph;
    const graphData: Record<string, (AnyValue | undefined)[]> = {};
    data.forEach((row) => {
      const prop = row[x.property.name];
      if (prop) {
        const val = prop.value;
        if (
          prop.type === PropertyType.Multiselect ||
          prop.type === PropertyType.People
        ) {
          add(val as string[], row[y.property.name]?.value, graphData);
        } else if (
          prop.type === PropertyType.Checkbox ||
          prop.type === PropertyType.Number
        )
          add(
            [(val as boolean | number).toString()],
            row[y.property.name]?.value,
            graphData
          );
        else if (
          prop.type === PropertyType.CreatedTime ||
          prop.type === PropertyType.Date
        ) {
          const time = x as Time;
          const date = prop.value as Date;
          switch (time.scale) {
            case TimeScale.Day:
              add(
                [`${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`],
                row[y.property.name]?.value,
                graphData
              );
              break;
            case TimeScale.Month:
              add(
                [date.getMonth().toString()],
                row[y.property.name]?.value,
                graphData
              );
              break;
            case TimeScale.Year:
              add(
                [date.getFullYear().toString()],
                row[y.property.name]?.value,
                graphData
              );
              break;
            default:
              break;
          }
        } else add([val as string], row[y.property.name]?.value, graphData);
      } else if (x.options.empty === "include")
        add([""], row[y.property.name]?.value, graphData);
    });
    console.log("graphData", graphData);

    const aggregate = Object.fromEntries(
      Object.entries(graphData).map(([key, values]) => {
        switch ((y as Numerical).fn) {
          case Function.CountAll:
            return [key, values.length];
          case Function.CountValues:
            if (
              [PropertyType.Multiselect, PropertyType.People].includes(
                y.property.type
              )
            )
              return [key, countNotEmpty((values as string[]).flat())];
            return [key, countNotEmpty(values)];
          case Function.CountUniqueValues:
            // eslint-disable-next-line no-case-declarations
            let vals = values;
            if (
              [PropertyType.Multiselect, PropertyType.People].includes(
                y.property.type
              )
            )
              vals = values.flat();
            if (
              y.property.type === PropertyType.CreatedTime ||
              y.property.type === PropertyType.Date
            )
              vals = vals.map((d) => (d as Date).toString());
            return [key, new Set(vals).size];
          case Function.CountEmpty:
            return [key, countEmpty(values)];
          case Function.CountNotEmpty:
            return [key, countNotEmpty(values)];
          case Function.PercentEmpty:
            return [key, (countEmpty(values) / values.length) * 100];
          case Function.PercentNotEmpty:
            return [key, (countNotEmpty(values) / values.length) * 100];
          case Function.Sum:
            return [key, sum(notEmpty(values) as number[])];
          case Function.Average:
            return [
              key,
              sum(notEmpty(values) as number[]) / countNotEmpty(values),
            ];
          case Function.Median:
            return [key, median(notEmpty(values) as number[])];
          case Function.Min:
            return [key, Math.min(...(notEmpty(values) as number[]))];
          case Function.Max:
            return [key, Math.max(...(notEmpty(values) as number[]))];
          case Function.Range:
            return [
              key,
              Math.max(...(notEmpty(values) as number[])) -
                Math.min(...(notEmpty(values) as number[])),
            ];
          default:
            return ["", ""];
        }
        return ["", ""];
      }) as [string, number][]
    );

    const barData = Object.entries(aggregate).map(([key, num]) => ({
      [x.property.name]: key,
      [y.property.name]: num,
    }));

    console.log("barData", barData);

    return (
      <ResponsiveBar
        data={barData}
        keys={[y.property.name]}
        indexBy={x.property.name}
        colors={{ scheme: "nivo" }}
        padding={0.3}
        margin={{ top: 40, right: 20, bottom: 50, left: 50 }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: x.property.name,
          legendPosition: "middle",
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: y.property.name,
          legendPosition: "middle",
          legendOffset: -40,
        }}
      />
    );
  }
  return <></>;
};
