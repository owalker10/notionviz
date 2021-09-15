import { Typography } from "@material-ui/core";
import { defaultGraph } from "common/lib";
import {
  getVariables,
  AnyVariable,
  Numerical,
  Time,
  GraphType,
} from "common/lib/graph";
import { FunState } from "fun-state";
import React from "react";
import GenericSelect from "./GenericSelect";

// todo: change subtitle color based on category color
const MenuItemText = ({ variable }: { variable: AnyVariable }): JSX.Element => {
  const title = <Typography>{variable.property.name}</Typography>;
  const subtitleStyle = { fontSize: ".9rem" };
  switch (variable.type) {
    case "categorical":
      return title;
    case "numerical":
      return (
        <div>
          {title}
          <Typography color="textSecondary" style={subtitleStyle}>
            {(variable as Numerical).fn}
          </Typography>
        </div>
      );
    case "time":
      return (
        <div>
          {title}
          <Typography color="textSecondary" style={subtitleStyle}>
            {(variable as Time).scale}
          </Typography>
        </div>
      );
    default:
      return <></>;
  }
};

export default ({
  state,
  type,
  variables,
  axis,
  loading,
  optional,
}: {
  state: FunState<AnyVariable>;
  type: GraphType;
  variables: AnyVariable[];
  axis: "x" | "y" | "group";
  loading: boolean;
  optional?: boolean;
}): JSX.Element => {
  const items = getVariables(variables, type, axis).map((v) => ({
    value: v, // todo: time scale
    element: <MenuItemText variable={v} />,
  }));
  if (optional)
    items.unshift({
      value: defaultGraph[axis],
      element: <></>,
    });
  return (
    <GenericSelect
      state={state}
      items={items}
      propertyKey="id"
      disabled={loading}
    />
  );
};
