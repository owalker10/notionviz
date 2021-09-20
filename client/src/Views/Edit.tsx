import React, { ChangeEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import useFunState, { FunState } from "fun-state";
import {
  IconButton,
  makeStyles,
  Typography,
  useTheme,
} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import LoadIcon from "@material-ui/icons/Loop";
import CodeIcon from "@material-ui/icons/Code";
import { Graph } from "common/lib/firestore/schemas";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { ContentContainer } from "../Components/MainLayout";
import { useGraphs } from "../hooks/useGraphs";
import { FlexColumn, injectProps } from "../utils/components";
import DefaultFormRow from "../Components/FormRow";
import { useAuth } from "../hooks/useAuth";
import { EditableTitle, Title } from "../styles/typography";
import { useDatabases } from "../hooks/useDatabases";
import {
  isValidDb,
  isValidGraph,
  isValidGraphType,
} from "../utils/validations";
import { PrimaryButton, SecondaryButton } from "../Components/buttons";
import useTitle from "../hooks/useTitle";
import DatabaseSelect from "../Components/Edit/DatabaseSelect";
import { EditState, initEditState, unsave } from "../State/EditState";
import GraphTypeSelect from "../Components/Edit/GraphTypeSelect";
import ControlPanel from "../Components/Edit/ControlPanel";
import { fetchDatabase } from "../Services/api";
import { shortUuid } from "../utils/uuid";
import GenericGraph from "../Components/Graphs/GenericGraph";

const useStyles = makeStyles((theme) => ({
  newContainer: {
    "& > :first-child": {
      marginBottom: theme.spacing(2),
    },
    "& > p": {
      marginBottom: theme.spacing(6),
    },
    margin: "auto 0",
    "& > :last-child": {
      marginTop: theme.spacing(4),
    },
  },
  spin: {
    animation: "$spin 1s linear 0s infinite",
  },
  "@keyframes spin": {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
  titleWrapper: {
    display: "flex",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: theme.spacing(2),
  },
  unsavedDot: {
    height: "16px",
    width: "16px",
    marginRight: theme.spacing(2),
    borderRadius: "100px",
    backgroundColor: theme.palette.primary.main,
    display: "inline-block",
  },
  buttonWrapper: {
    display: "grid",
    marginBottom: theme.spacing(6),
    gridTemplateColumns: "auto auto auto 1fr",
    columnGap: theme.spacing(1),
    width: "100%",
    "& > :last-child": {
      marginLeft: "auto",
    },
  },
  content: {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    width: "100%",
    // graph preview
    "& > :first-child": {
      flexShrink: 0,
    },
  },
  showButton: {
    position: "absolute",
    right: "-35px",
    top: "3px",
  },
}));

const FormRow = injectProps(DefaultFormRow, {
  titleColor: "textSecondary",
});

// const refreshDatabases = (
//   state: FunState<EditState>,
//   uid: string | undefined
// ) => {
//   if (uid) {
//     state.prop("dbLoading").set(true);
//     listDatabases(uid, true)
//       .then(state.prop("databases").set)
//       .finally(() => state.prop("dbLoading").set(false));
//   }
// };

// todo: combobox

const NewView = ({
  state,
  refreshDatabases,
}: {
  state: FunState<EditState>;
  refreshDatabases: VoidFunction;
}) => {
  const styles = useStyles(useTheme());
  const { graph, databases } = state.get();
  const valid =
    isValidGraphType(graph.type) && isValidDb(graph.dbId, databases);
  return (
    <FlexColumn className={styles.newContainer}>
      <Title>New Graph</Title>
      <Typography color="textSecondary">
        To get started, select a graph type and a database.
      </Typography>
      <FlexColumn style={{ width: "100%" }}>
        <FormRow title="Graph Type">
          <GraphTypeSelect state={state} />
        </FormRow>
        <FormRow title="Database">
          <DatabaseSelect state={state} refreshDatabases={refreshDatabases} />
        </FormRow>
      </FlexColumn>
      <PrimaryButton
        onClick={() => {
          state.prop("created").set(true);
          state.prop("saved").set(false);
        }}
        disabled={!valid}
      >
        Create
      </PrimaryButton>
    </FlexColumn>
  );
};

const EditView = ({
  state,
  refreshDatabases,
}: {
  state: FunState<EditState>;
  refreshDatabases: VoidFunction;
}) => {
  const styles = useStyles(useTheme());
  const { graph, data } = state.get();
  const saved = state.prop("saved").get();
  const { user } = useAuth().auth.get();
  const { set } = useGraphs({ limit: -1 });
  // arguments for database fetch
  const args = [
    user?.uid ?? "",
    graph.id,
    graph.dbId,
    true, // schema
    undefined, // passkey
    false, // cacheBypass
  ] as const;
  useEffect(() => {
    if (user?.uid && graph.dbId) {
      state.prop("dataLoading").set(true);
      fetchDatabase(...args)
        .then(({ schema, rows }) => {
          console.log(args, schema);
          state.mod((s) => ({
            ...s,
            schema,
            data: rows,
          }));
        })
        .finally(() => {
          state.prop("dataLoading").set(false);
        });
    }
  }, [...args]);

  // todo: error handling
  const save = () => {
    const invalidProp = isValidGraph(graph);
    if (!invalidProp) {
      const graphToSave: Graph = {
        ...graph,
        id: graph.id || shortUuid(),
        lastSaved: new Date(Date.now()).toISOString(),
      };
      set(graphToSave); // firebase write
      state.prop("graph").set(graphToSave);
      state.prop("saved").set(true);
    } else console.log(invalidProp, graph);
  };

  console.log(data);

  return (
    <FlexColumn style={{ width: "100%" }}>
      <div className={styles.titleWrapper}>
        <span className={styles.unsavedDot} />
        <EditableTitle
          value={graph.name}
          placeholder="Untitled"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            state.prop("graph").prop("name").set(e.target.value);
            unsave(state);
          }}
        />
      </div>
      <div className={styles.buttonWrapper}>
        {/* todo: validation */}
        <PrimaryButton startIcon={<SaveIcon />} disabled={saved} onClick={save}>
          Save
        </PrimaryButton>
        <PrimaryButton startIcon={<CodeIcon />} disabled={!saved}>
          Embed
        </PrimaryButton>
        {/* todo: make this icon spin and also do stuff */}
        <SecondaryButton startIcon={<LoadIcon />}>
          Refresh Notion data
        </SecondaryButton>
      </div>
      <div className={styles.content}>
        <div
          style={{
            width: "300px",
            height: "300px",
            backgroundColor: "#F7F6F3",
            resize: "both",
            overflow: "auto",
            padding: "5px",
          }}
        >
          {/* <p>{JSON.stringify(graph.x)}</p>
          <p>{JSON.stringify(graph.y)}</p> */}
          <GenericGraph graph={graph} data={data} />
        </div>
        <IconButton
          size="small"
          className={styles.showButton}
          onClick={() => state.prop("collapsed").set(false)}
        >
          <ChevronLeftIcon />
        </IconButton>

        <ControlPanel state={state} refreshDatabases={refreshDatabases} />
      </div>
    </FlexColumn>
  );
};

// todo: list invalid inputs on a tooltip over the save button
export default (): JSX.Element => {
  const { gid } = useParams<{ gid: string }>();
  const { auth } = useAuth();
  const { graphs, isLoading } = useGraphs({ gid: gid ?? "none" });
  // todo: if gid && not graph[gid] && not isLoading return 404
  const dbGraph = graphs[0];
  const state = useFunState<EditState>(initEditState);
  const { graph, saved, created } = state.get();
  const newGraph = !dbGraph && !isLoading && !created;
  // const newGraph = false && created;
  useTitle(newGraph ? "Create Graph" : "Edit Graph");

  // update graph from firestore
  useEffect(() => {
    if (dbGraph && !graph.id) {
      console.log("dbgraph", dbGraph);
      state.prop("graph").set(dbGraph);
    }
  }, [isLoading]);
  const uid = auth.prop("user").get()?.uid;

  const refreshDatabases = useDatabases(uid, state);

  // "Are you sure?" for unsaved graphs
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    if (!saved && !newGraph) {
      window.addEventListener("beforeunload", onUnload);
      return () => window.removeEventListener("beforeunload", onUnload);
    }
    return () => {};
  }, [saved, newGraph]);

  return (
    <ContentContainer maxWidth="xl" style={{ overflowX: "hidden" }}>
      {newGraph ? (
        <NewView state={state} refreshDatabases={refreshDatabases} />
      ) : (
        <EditView state={state} refreshDatabases={refreshDatabases} />
      )}
    </ContentContainer>
  );
};

// resize: both;
// overflow: auto;
