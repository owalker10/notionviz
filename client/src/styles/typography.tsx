/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
import { Typography, withStyles } from "@material-ui/core";
import { injectProps } from "../utils/components";

export const Title = injectProps(
  withStyles((theme) => ({
    root: {
      color: theme.palette.text.primary,
      fontWeight: 700,
      lineHeight: 1.43,
    },
  }))(Typography),
  {
    variant: "h3",
    component: "h1",
  }
);

export const EditableTitle = injectProps(
  withStyles({
    root: {
      border: "none",
      outline: "none !important",
    },
  })(Title),
  { component: "input" }
);
