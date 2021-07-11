/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
import { Typography, withStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
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

export const ContentHeader = injectProps(
  withStyles((theme) => ({
    root: {
      color: theme.palette.text.primary,
      fontWeight: 500,
      lineHeight: 1.43,
    },
  }))(Typography),
  {
    variant: "h6",
    component: "h3",
  }
);

export const PrimaryLink = injectProps(
  withStyles((theme) => ({
    root: {
      color: theme.palette.primary.main,
      fontWeight: 400,
      textDecoration: "none",
      "&:hover": {
        filter: "brightness(1.2)",
      },
    },
  }))(Typography),
  {
    component: Link,
  }
);

export const ellipsis = {
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
} as const;
