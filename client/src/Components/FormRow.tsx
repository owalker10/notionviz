import React, { FC, PropsWithChildren } from "react";
import { makeStyles, Typography, useTheme } from "@material-ui/core";
import useMobileBreakpoint from "../hooks/useMobileBreakpoint";

const useStyles = (mobile: boolean) =>
  makeStyles((theme) => ({
    row: {
      display: "flex",
      flexDirection: mobile ? "column" : "row",
      justifyContent: "space-between",
      width: "100%",
      alignItems: mobile ? "flex-start" : "center",
      marginBottom: theme.spacing(2),
    },
    rowTitle: {
      flexShrink: 0,
      marginBottom: mobile ? theme.spacing(1) : "",
    },
  }));

const FormRow: FC<
  PropsWithChildren<{
    title: string;
    classes?: { root?: string; title?: string };
  }>
> = ({ children, title, classes }) => {
  const mobile = useMobileBreakpoint(550);
  const styles = useStyles(mobile)(useTheme());
  return (
    <div className={`${styles.row} ${classes?.root ?? ""}`}>
      <Typography className={`${styles.rowTitle} ${classes?.title ?? ""}`}>
        {title}
      </Typography>
      {children}
    </div>
  );
};

export default FormRow;
