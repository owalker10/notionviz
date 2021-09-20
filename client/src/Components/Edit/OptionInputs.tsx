import { AnyVariable, GraphType } from "common/lib/graph";
import { FunState } from "fun-state";
import React from "react";
import { EditState, unsave } from "../../State/EditState";
import FormRow from "../FormRow";
import GenericField from "./GenericField";
import GenericSelect from "./GenericSelect";

const truncate = (s: string) => (s.length > 6 ? `${s.substring(0, 6)}...` : s);

export default (
  state: FunState<EditState>,
  axis: "x" | "y" | "group"
): JSX.Element[] => {
  const axisState = state.prop("graph").prop(axis) as FunState<AnyVariable>;
  if (!axisState.get()) return [];
  const graphType = state.prop("graph").prop("type").get();
  const varType = axisState.prop("type").get();
  const optionState = axisState.prop("options");
  const inputs = [
    // label
    <FormRow title="Label">
      <GenericField
        state={optionState.prop("label")}
        helperText="optional"
        sideEffect={() => unsave(state)}
      />
    </FormRow>,
  ];
  if (varType !== "time")
    inputs.push(
      // empty values
      <FormRow title="Empty values">
        <GenericSelect
          state={optionState.prop("empty")}
          items={[
            {
              value: "ignore" as const,
              element: "ignore",
            },
            {
              value: "include" as const,
              element: varType === "numerical" ? "count as 0" : "include",
            },
          ]}
          sideEffect={() => unsave(state)}
        />
      </FormRow>
    );
  // numeric options
  if (
    (graphType === GraphType.line && varType === "categorical") ||
    varType === "numerical"
  )
    inputs.push(
      ...[
        // number format
        <FormRow title="Format">
          <GenericSelect
            state={optionState.prop("formatting")}
            items={(["number", "percent", "dollar"] as const).map((f) => ({
              value: f,
              element: f,
            }))}
            sideEffect={() => unsave(state)}
          />
        </FormRow>,
        <FormRow title="Rounding">
          <GenericSelect
            helperText="decimal places"
            state={optionState.prop("rounding")}
            items={[
              {
                value: "none" as 0 | 1 | 2 | 3 | "none",
                element: "none",
              },
            ].concat(
              ([0, 1, 2, 3] as const).map((f) => ({
                value: f,
                element: f.toString(),
              }))
            )}
            sideEffect={() => unsave(state)}
          />
        </FormRow>,
      ]
    );
  // categorical options
  else if (varType === "categorical")
    inputs.push(
      // exclude
      <FormRow title="Exclude">
        <GenericField
          state={optionState.prop("exclude")}
          helperText={`comma-separated values of ${truncate(
            axisState.prop("property").prop("name").get()
          )}`}
          sideEffect={() => unsave(state)}
        />
      </FormRow>
    );
  return inputs;
};
