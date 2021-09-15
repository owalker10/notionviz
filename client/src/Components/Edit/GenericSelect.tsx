import React from "react";
import { FunState } from "fun-state";
import { FormHelperText, MenuItem, Select } from "@material-ui/core";

export default <T, K extends keyof T>({
  state,
  items,
  propertyKey,
  helperText,
  disabled,
}: {
  state: FunState<T>;
  items: { value: T; element: JSX.Element | string }[];
  propertyKey?: T[K] extends string ? K : never;
  helperText?: string;
  disabled?: boolean;
}): JSX.Element => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <Select
        variant="outlined"
        margin="dense"
        disabled={disabled}
        value={
          propertyKey
            ? items
                .map((i) => i.value)
                .find((t) => state.get()[propertyKey] === t[propertyKey])?.[
                propertyKey
              ] ?? ""
            : state.get()
        }
        onChange={(e) => {
          state.set(
            (propertyKey
              ? items
                  .map((i) => i.value)
                  .find((t) => t[propertyKey] === e.target.value)
              : e.target.value) as T
          );
        }}
      >
        {items.map(({ value, element }) => (
          <MenuItem
            value={
              propertyKey ? value[propertyKey] : (value as unknown as string)
            }
            dense
          >
            {element}
          </MenuItem>
        ))}
      </Select>
      {helperText ? (
        <FormHelperText style={{ marginLeft: "2px" }}>
          {helperText}
        </FormHelperText>
      ) : null}
    </div>
  );
};
