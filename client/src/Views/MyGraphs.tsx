import { makeStyles, TextField, useTheme } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import { Graph } from "common/lib/firestore";
import useFunState from "fun-state";
import React from "react";
import { Link, Redirect } from "react-router-dom";
import { shortUuid } from "../utils/uuid";
import { PrimaryButton } from "../Components/buttons";
import { cardDim, GraphCard } from "../Components/GraphCard";
import { useAuth } from "../hooks/useAuth";
import { useGraphs } from "../hooks/useGraphs";
import { Title } from "../styles/typography";
import { range } from "../utils/array";
import { FlexColumn, WrapGrid } from "../utils/components";
import { toWebPath } from "../utils/routes";
import { mockGraph } from "./Home";
import { ContentContainer } from "../Components/MainLayout";

const useStyles = makeStyles((theme) => ({
  content: {
    width: "100%",
    alignItems: "flex-start",
  },
  title: {
    marginBottom: theme.spacing(6),
  },
  ui_row: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    flexWrap: "wrap-reverse",
    justifyContent: "space-between",
  },
  search: {
    width: "300px",
    "& > div": {
      // the input root
      fontSize: "14px",
    },
  },
  searchIcon: {
    color: theme.palette.text.hint,
    marginRight: theme.spacing(1),
  },
  newButton: {
    // justifySelf: "flex-end",
    // marginLeft: "auto",
  },
}));

export default (): JSX.Element => {
  const { loggedIn, isLoading: authLoading } = useAuth().auth.get();
  if (!loggedIn && !authLoading) return <Redirect to={toWebPath("")} />;
  const newGraphURL = "/new";
  const styles = useStyles(useTheme());
  const { graphs, set, remove, isLoading: graphsLoading } = useGraphs({});
  const isLoading = authLoading || graphsLoading;
  // for whatever reason, using set on a function will call that function??
  const undoDelete = useFunState<(() => VoidFunction) | undefined>(undefined);
  const deleteGraph = (g: Graph) => {
    remove(g).then((undo: VoidFunction) => {
      undoDelete.set(() => undo);
    });
  };
  const search = useFunState("");
  const query = search.get().toLowerCase();
  const filteredGraphs = graphs.filter(
    (g) =>
      g.dbName.toLowerCase().includes(query) ||
      g.name.toLowerCase().includes(query)
  );
  return (
    <ContentContainer maxWidth="md">
      <FlexColumn className={styles.content}>
        <Title className={styles.title}>My Workspace&apos;s Graphs</Title>
        <div className={styles.ui_row}>
          <TextField
            variant="outlined"
            margin="dense"
            value={search.get()}
            onChange={({ target }) => search.set(target.value)}
            placeholder="Search for graphs or databases"
            className={styles.search}
            InputProps={{
              startAdornment: <SearchIcon className={styles.searchIcon} />,
            }}
          />
          <PrimaryButton
            component={Link}
            to={toWebPath(newGraphURL)}
            className={styles.newButton}
            startIcon={<AddIcon />}
          >
            New Graph
          </PrimaryButton>
        </div>
        <WrapGrid colwidth={cardDim} style={{ width: "100%" }}>
          <div style={{ gridColumn: "1 / -1" }} />
          {isLoading
            ? range(3).map((n) => <GraphCard isLoading key={n} />)
            : [
                ...filteredGraphs.map((g) => (
                  <GraphCard graph={g} key={g.id} remove={deleteGraph} />
                )),
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  onClick={() => set(mockGraph(shortUuid()))}
                  style={{
                    width: "100px",
                    height: "100px",
                    background: "black",
                  }}
                  key="black box"
                />,
              ]}
        </WrapGrid>
      </FlexColumn>
    </ContentContainer>
  );
};
