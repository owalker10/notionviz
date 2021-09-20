import React from "react";
import {
  Dialog,
  Drawer,
  Divider as MuiDivider,
  makeStyles,
  Typography,
  useTheme,
  Select,
  MenuItem,
  TextField,
  Snackbar,
} from "@material-ui/core";
import useFunState, { FunState } from "fun-state";
import { FeedbackType } from "common/lib/firestore";
import { Alert } from "@material-ui/lab";
import { PrimaryButton, SecondaryButton } from "./buttons";
import { FlexColumn, injectProps } from "../utils/components";
import FormRow from "./FormRow";
import useMobileBreakpoint from "../hooks/useMobileBreakpoint";
import { firestore } from "../Services/Firebase";
import { useAuth } from "../hooks/useAuth";

// tab and form that allows users to submit feedback (creates a Firebase document and emails the service account)

const breakpoint = 550;

const useStyles = (mobile: boolean) =>
  makeStyles((theme) => ({
    tab: {
      position: "fixed",
      backgroundColor: theme.palette.grey[100],
      border: `1px solid ${theme.palette.divider}`,
      color: theme.palette.text.secondary,
      bottom: "-2px",
      right: theme.spacing(2),
      padding: theme.spacing(1),
      borderRadius: "2px",
      fontSize: "12px",
      height: "35px",
      cursor: "pointer",
      "&:hover": {
        height: "45px",
        boxShadow: "0px -3px 9px rgba(0, 0, 0, 0.10)",
        color: theme.palette.text.primary,
      },
      transition: "all 0.4s",
    },
    content: {
      padding: "32px 42px",
    },
    rows: {
      width: "100%",
      padding: `${theme.spacing(3)}px 0`,
    },
    title: {
      fontWeight: 500,
      fontSize: "18px",
      alignSelf: "flex-start",
      marginBottom: theme.spacing(1),
    },
    typeSelect: {
      minWidth: "20ch",
    },
    textAreaContainer: {
      flexDirection: "column !important" as "column",
      alignItems: "flex-start !important" as "flex-start",
    },
    textArea: {
      width: "100%",
    },
    buttons: {
      display: "grid",
      gridTemplateColumns: "auto auto",
      columnGap: theme.spacing(2),
      alignSelf: mobile ? "center" : "flex-end",
    },
  }));

const Divider = injectProps(MuiDivider, { style: { width: "100%" } });

interface FormState {
  open: boolean;
  type: FeedbackType | "";
  feedback: string;
  result: "success" | "error" | undefined;
}

const initialState: FormState = {
  open: false,
  type: "",
  feedback: "",
  result: undefined,
};

const validate = (state: FunState<FormState>) => {
  const { type, feedback } = state.get();
  return (
    Object.values(FeedbackType).includes(type as FeedbackType) &&
    feedback.length > 10
  );
};

export default (): JSX.Element => {
  const { user } = useAuth().auth.get();
  const uid = user?.uid;
  if (!uid) return <></>;
  const mobile = useMobileBreakpoint(breakpoint);
  const ResponsiveContainer = mobile ? Drawer : Dialog;
  const styles = useStyles(mobile)(useTheme());
  const state = useFunState(initialState);
  const { result } = state.get();
  const responsiveProps =
    ResponsiveContainer === Drawer
      ? ({
          anchor: "bottom",
        } as const)
      : { PaperProps: { style: { minWidth: "min(100%, 500px)" } } };
  const feedbackTypes = Object.values(FeedbackType);
  const valid = validate(state);

  const submit = () => {
    if (!valid) return;
    firestore.feedback
      .add({
        uid,
        name: user?.workspaceName ?? uid,
        type: state.prop("type").get() as FeedbackType,
        time: new Date(Date.now()).toISOString(),
        content: state.prop("feedback").get(),
      })
      .then(() =>
        state.mod((s) => ({
          ...s,
          type: initialState.type,
          feedback: initialState.feedback,
          open: false,
          result: "success",
        }))
      )
      .catch((err) => {
        state.mod((s) => ({ ...s, open: false, result: "error" }));
        console.error(err);
      });
  };
  return (
    <>
      <button
        type="button"
        className={styles.tab}
        onClick={(e) => {
          e.preventDefault();
          state.prop("open").set(true);
        }}
      >
        Feedback?
      </button>
      <ResponsiveContainer
        open={state.prop("open").get()}
        onClose={() => state.prop("open").set(false)}
        {...responsiveProps}
      >
        <FlexColumn className={styles.content}>
          <Typography className={styles.title}>
            Leave feedback for NotionViz&apos;s creator
          </Typography>
          <Divider />
          <div className={styles.rows}>
            <FormRow title="Type">
              <Select
                className={styles.typeSelect}
                variant="outlined"
                margin="dense"
                value={state.prop("type").get()}
                onChange={(e) =>
                  state.prop("type").set(e.target.value as FeedbackType)
                }
              >
                {feedbackTypes.map((type) => (
                  <MenuItem value={type} dense>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormRow>
            <FormRow
              title="Feedback"
              classes={{ root: styles.textAreaContainer }}
            >
              <TextField
                multiline
                className={styles.textArea}
                variant="outlined"
                margin="dense"
                rows={4}
                placeholder="If you'd like to be contacted with a response, leave an email!"
                value={state.prop("feedback").get()}
                onChange={(e) => state.prop("feedback").set(e.target.value)}
              />
            </FormRow>
          </div>
          <div className={styles.buttons}>
            <SecondaryButton
              onClick={() => {
                state.prop("open").set(false);
              }}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={submit} disabled={!valid}>
              Submit
            </PrimaryButton>
          </div>
        </FlexColumn>
      </ResponsiveContainer>
      <Snackbar
        open={Boolean(result)}
        autoHideDuration={4000}
        onClose={() => state.prop("result").set(undefined)}
      >
        <Alert
          onClose={() => state.prop("result").set(undefined)}
          severity={result}
        >
          {result === "success"
            ? "Feedback submitted. Thanks!"
            : "Error submitting feedback, see console for more info."}
        </Alert>
      </Snackbar>
    </>
  );
};
