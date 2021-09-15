import { MenuItem, Select } from "@material-ui/core";
import { GraphType } from "common/lib/graph";
import { FunState } from "fun-state";
import React from "react";
import { EditState } from "../../State/EditState";

export default ({ state }: { state: FunState<EditState> }): JSX.Element => {
  return (
    <Select
      variant="outlined"
      margin="dense"
      value={state.prop("graph").prop("type").get()}
      onChange={(e) => {
        const input = e.target.value;
        if (Object.values(GraphType).includes(input as GraphType))
          state
            .prop("graph")
            .prop("type")
            .set(e.target.value as GraphType);
      }}
    >
      {[...Object.values(GraphType)].map((t) => (
        <MenuItem value={t} dense>
          {t}
        </MenuItem>
      ))}
    </Select>
  );
};
