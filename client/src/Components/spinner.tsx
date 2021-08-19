import React from "react";
import { CircularProgress, makeStyles, useTheme } from "@material-ui/core";
import { gradient } from "../styles/theme";

const useStyles = makeStyles(() => ({
  root: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    strokeLinecap: "round",
    stroke: "url(#spinnerGradient)",
  },
}));

export const Spinner = (): JSX.Element => {
  const { circle } = useStyles(useTheme());
  return (
    <>
      <CircularProgress classes={{ circle }} thickness={5} />
      <svg width="0" height="0">
        <linearGradient id="spinnerGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={gradient[0]} />
          <stop offset="100%" stopColor={gradient[1]} />
        </linearGradient>
      </svg>
    </>
  );
};

export const FallbackSpinner = (): JSX.Element => {
  const { root } = useStyles(useTheme());
  return (
    <div className={root}>
      <Spinner />
    </div>
  );
};
