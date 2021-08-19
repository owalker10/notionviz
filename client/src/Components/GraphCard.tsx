/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import React, { FC, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  ListItemIcon,
  makeStyles,
  MenuItem,
  Typography,
  useTheme,
  Snackbar,
  Button,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { GraphType } from "common/lib/graph";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { Link } from "react-router-dom";
import CodeIcon from "@material-ui/icons/Code";
import DeleteIcon from "@material-ui/icons/Delete";
import CloseIcon from "@material-ui/icons/Close";
import { Graph } from "common/lib/firestore/schemas";
import useFunState, { FunState } from "fun-state";
import BarIcon from "../assets/graph-icons/bar.svg";
import { ContentHeader, ellipsis } from "../styles/typography";
import { SkeletonText, SkeletonWithContent } from "./skeleton";
import { FlexColumn } from "../utils/components";
import Menu from "./Menu";
import { toWebPath } from "../utils/routes";
import { useGraphs } from "../hooks/useGraphs";
import EmbedDialog from "./EmbedDialog";

export const cardDim = "200px";

const useStyles = makeStyles((theme) => ({
  card: {
    width: cardDim,
    height: cardDim,
    position: "relative",
    boxShadow:
      "0px 10px 20px rgba(0, 0, 0, 0.08), 0px 0px 5px rgba(0, 0, 0, 0.08)",
    backgroundColor: theme.palette.grey[100],
    transition: "all 0.2s",
    marginBottom: "2px",
    "&:hover": {
      filter: "brightness(0.98)",
      marginTop: "2px",
      marginBottom: 0,
      boxShadow:
        "0px 5px 10px rgba(0, 0, 0, 0.1), 0px 0px 5px rgba(0, 0, 0, 0.20)",
    },
  },
  header: {
    position: "absolute",
    right: 0,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  icon: {
    width: "60px",
    height: "75px",
  },
  text: {
    alignItems: "flex-start",
    "& > p": {
      ...ellipsis,
      maxWidth: "100%",
    },
    fontSize: "14px",
  },
  name: {
    display: "flex",
    alignItems: "flex-end",
    textAlign: "left",
    height: "2.86em",
    overflow: "hidden",
    "& > *": {
      maxHeight: "100%",
    },
  },
  from: {
    fontSize: "14px",
    "& span": {
      color: theme.palette.text.hint,
    },
  },
  create: {
    border: `1px solid ${theme.palette.grey[200]}`,
    borderRadius: "4px",
    color: theme.palette.grey[300],
    width: cardDim,
    height: cardDim,
    backgroundColor: "white",
    justifyContent: "center",
    transition: "all 0.2s",
    "&:hover": {
      filter: "brightness(0.95)",
    },
  },
  plus: {
    width: "100px",
    height: "100px",
    position: "relative",
    marginBottom: theme.spacing(2),
    "&::before,&::after": {
      position: "absolute",
      content: "' '",
      height: "1px",
      width: "100%",
      backgroundColor: theme.palette.grey[300],
      right: 0,
      top: "50%",
    },
    "&::after": {
      width: "1px",
      height: "100%",
      right: "50%",
      top: 0,
    },
  },
}));

export const GraphCard: FC<{
  graph?: Graph;
  remove?: (g: Graph) => void;
  isLoading?: boolean;
}> = ({ graph, remove, isLoading }) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const embedDialogOpen = useFunState(false);
  const {
    id,
    type,
    name,
    db: databaseName,
  } = graph ?? { id: -1, type: GraphType.bar, name: "", db: "" };
  return (
    <>
      <Card variant="outlined" className={styles.card}>
        <CardHeader
          className={styles.header}
          action={
            <IconButton
              size="small"
              aria-label="settings"
              disabled={isLoading}
              style={{ color: theme.palette.text.hint }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVertIcon />
            </IconButton>
          }
        />
        <Link to={toWebPath(`/edit/${id}`)} style={{ textDecoration: "none" }}>
          <CardContent className={styles.content}>
            <SkeletonWithContent
              className={styles.icon}
              isLoading={isLoading ?? false}
            >
              <img src={BarIcon} alt={type} />
            </SkeletonWithContent>
            <FlexColumn className={styles.text}>
              <ContentHeader className={styles.name}>
                <span>
                  <SkeletonText isLoading={isLoading ?? false} width="8ch">
                    {name}
                  </SkeletonText>
                </span>
              </ContentHeader>

              <Typography className={styles.from} color="textSecondary">
                <SkeletonText isLoading={isLoading ?? false} width="16ch">
                  <span>From&nbsp;</span>
                  {databaseName}
                </SkeletonText>
              </Typography>
            </FlexColumn>
          </CardContent>
        </Link>
      </Card>
      <Menu
        MenuListProps={{ dense: true }}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={() => embedDialogOpen.set(true)}>
          <ListItemIcon>
            <CodeIcon fontSize="small" />
          </ListItemIcon>
          <Typography>Embed</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (remove && graph) remove(graph);
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography>Delete</Typography>
        </MenuItem>
      </Menu>
      <EmbedDialog graph={graph} state={embedDialogOpen} />
    </>
  );
};

export const CreateGraph: FC<{ to: string }> = ({ to }) => {
  const styles = useStyles(useTheme());
  return (
    <Link style={{ textDecoration: "none" }} to={to}>
      <FlexColumn className={styles.create}>
        <div className={styles.plus} />
        New Graph
      </FlexColumn>
    </Link>
  );
};

export const DeleteSnackbar: FC<{
  undo: FunState<(() => VoidFunction) | undefined>;
}> = ({ undo }) => {
  const f = undo.get();
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      open={Boolean(undo.get())}
      autoHideDuration={6000}
      onClose={() => undo.set(undefined)}
    >
      <Alert
        variant="filled"
        severity="error"
        icon={<DeleteIcon />}
        onClose={() => undo.set(undefined)}
        action={
          <Button
            color="secondary"
            size="small"
            onClick={() => {
              if (f) f()();
              undo.set(undefined);
            }}
          >
            undo
          </Button>
        }
      >
        Graph deleted
      </Alert>
    </Snackbar>
  );
};
