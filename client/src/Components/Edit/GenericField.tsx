import { makeStyles, TextField, useTheme } from "@material-ui/core";
import { FunState } from "fun-state";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.secondary.main,
  },
}));

export default ({
  state,
  helperText,
}: {
  state: FunState<string>;
  helperText?: string;
}): JSX.Element => {
  const { root } = useStyles(useTheme());
  return (
    <TextField
      // className={root}
      variant="outlined"
      margin="dense"
      helperText={helperText}
      value={state.get()}
      onChange={(e) => state.set(e.target.value)}
      InputProps={{
        className: root,
      }}
    />
  );
};
