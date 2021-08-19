import { makeStyles, Snackbar, useTheme } from "@material-ui/core";
import CopyIcon from "@material-ui/icons/Assignment";
import { Alert } from "@material-ui/lab";
import React, { FocusEvent, MouseEvent, useState } from "react";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: "flex",
    fontSize: "14px",
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: "3px",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.secondary.main,
    height: "35px",
  },
  input: {
    padding: theme.spacing(1),
    border: "none",
    fontFamily: theme.typography.fontFamily,
    background: "none",
    fontSize: "inherit",
    color: "inherit",
    outline: "none",
    flexGrow: 1,
  },
  button: {
    border: "inherit",
    borderRadius: "inherit",
    color: "inherit",
    backgroundColor: "inherit",
    height: "calc(100% + 2px)",
    margin: "-1px",
    flexGrow: 0,
    "&:hover": {
      filter: "brightness(0.95)",
      cursor: "pointer",
    },
    "&:active": {
      filter: "brightness(0.90)",
    },
    transition: "color 0.2s",
    "& > svg": {
      verticalAlign: "middle",
    },
  },
}));

export default ({
  text,
  className,
}: {
  text: string;
  className?: string;
}): JSX.Element => {
  const styles = useStyles(useTheme());
  const selectOnFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
    e.currentTarget.setSelectionRange(0, 99999); /* For mobile devices */
  };
  const [success, setSuccess] = useState(false);
  const copy = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (navigator.clipboard)
      navigator.clipboard.writeText(text).then(() => {
        setSuccess(true);
      });
  };
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <input
        value={text}
        readOnly
        onFocus={selectOnFocus}
        className={styles.input}
      />
      <button type="button" className={styles.button} onClick={copy}>
        <CopyIcon />
      </button>
      <Snackbar
        open={success}
        autoHideDuration={2000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="info">
          Text copied to clipboard.
        </Alert>
      </Snackbar>
    </div>
  );
};
