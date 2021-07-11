import { Button, withStyles } from "@material-ui/core";
import { CSSProperties } from "react";
import { injectProps } from "../utils/components";

const styles: CSSProperties = {
  textTransform: "none",
};

export const PrimaryButton = injectProps(
  withStyles({
    root: {
      ...styles,
    },
  })(Button),
  { variant: "contained", color: "primary" }
);

export const SecondaryButton = injectProps(
  withStyles({
    root: {
      ...styles,
      fontWeight: 400,
      "&:active": { backgroundColor: "rgba(0,0,0,0.10)" },
    },
  })(Button),
  { variant: "outlined" }
);
