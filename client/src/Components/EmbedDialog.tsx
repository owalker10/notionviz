import React, { ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  Divider as MuiDivider,
  makeStyles,
  Typography,
  useTheme,
  Switch,
  Drawer,
} from "@material-ui/core";
import { Graph } from "common/lib/firestore";
import useFunState, { FunState } from "fun-state";
import { FlexColumn, injectProps } from "../utils/components";
import CopyText from "./CopyText";
import { toEmbedPath } from "../utils/routes";
import { useAuth } from "../hooks/useAuth";
import { useGraphs } from "../hooks/useGraphs";
import useMobileBreakpoint from "../hooks/useMobileBreakpoint";
import FormRow from "./FormRow";

const breakpoint = 550;

const useStyles = (mobile: boolean) =>
  makeStyles((theme) => ({
    wrapper: {
      fontSize: "11px",
      // textAlign: "left",
    },
    title: {
      fontWeight: 500,
      fontSize: "18px",
      alignSelf: "flex-start",
      marginBottom: theme.spacing(1),
    },
    subtitle: {
      alignSelf: "flex-start",
      marginBottom: theme.spacing(1),
      fontSize: "14px",
    },
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
    content: {
      width: "100%",
      padding: `${theme.spacing(2)}px 0`,
    },
    copyText: {
      flexGrow: 1,
      maxWidth: "300px",
      width: mobile ? "100%" : "",
    },
    passkeyMessage: {
      color: theme.palette.text.hint,
    },
  }));

const Divider = injectProps(MuiDivider, { style: { width: "100%" } });

export default ({
  graph,
  state,
}: {
  graph: Graph | undefined;
  state: FunState<boolean>;
}): JSX.Element => {
  if (!graph) return <></>;
  const mobile = useMobileBreakpoint(breakpoint);
  const { auth } = useAuth();
  const { set } = useGraphs({ limit: -1 });
  const publicChecked = useFunState(graph.isPublic);
  const togglePublic = (e: ChangeEvent<HTMLInputElement>) => {
    const isPublic = e.currentTarget.checked;
    publicChecked.set(isPublic);
    set({ ...graph, isPublic });
  };
  const uid = auth.prop("user").get()?.uid ?? "error";
  const styles = useStyles(mobile)(useTheme());
  const embedLink =
    window.location.href.split(window.location.pathname)[0] +
    toEmbedPath(`/${uid}/${graph.id}`);
  const passkey = auth.prop("user").get()?.passkeys?.[graph.id] ?? "error";
  const rows = [
    {
      text: "Embed URL",
      component: <CopyText text={embedLink} className={styles.copyText} />,
    },
    {
      text: "Public",
      component: (
        <Switch checked={publicChecked.get()} onChange={togglePublic} />
      ),
    },
  ];
  if (!graph.isPublic)
    rows.push({
      text: "Passkey",
      component: <CopyText text={passkey} className={styles.copyText} />,
    });
  const content = (
    <FlexColumn>
      <Typography className={styles.title}>Embed into Notion.</Typography>
      <Typography className={styles.subtitle}>
        Copy the URL into an /embed block
        {!graph.isPublic ? " and enter the passkey" : ""}.
      </Typography>
      <Divider />
      <div className={styles.content}>
        {rows.map(({ text, component }) => (
          // <div className={styles.row}>
          //   <Typography className={styles.rowTitle}>{text}</Typography>
          //   {component}
          // </div>
          <FormRow title={text}>{component}</FormRow>
        ))}
      </div>
      <Typography className={styles.passkeyMessage}>
        {/* todo: link */}
        Graphs that aren&apos;t public require a passkey to view (
        <a href="www.google.com">Learn more</a>)
      </Typography>
    </FlexColumn>
  );
  const props = {
    open: state.get(),
    onClose: () => state.set(false),
  };
  return mobile ? (
    <Drawer {...props} anchor="bottom">
      <div style={{ padding: "32px 42px" }}>{content}</div>
    </Drawer>
  ) : (
    <Dialog {...props}>
      <DialogContent style={{ padding: "32px 42px" }}>{content}</DialogContent>
    </Dialog>
  );
};
