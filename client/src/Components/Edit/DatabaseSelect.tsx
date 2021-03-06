import {
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  makeStyles,
} from "@material-ui/core";
import { FunState } from "fun-state";
import LoadIcon from "@material-ui/icons/Loop";
import React from "react";
import { defaultGraph } from "common/lib";
import { useAuth } from "../../hooks/useAuth";
import { EditState, spinStyle, unsave } from "../../State/EditState";

const useStyles = makeStyles(() => ({
  ...spinStyle,
}));

export default ({
  state,
  refreshDatabases,
}: {
  state: FunState<EditState>;
  refreshDatabases: VoidFunction;
}): JSX.Element => {
  const styles = useStyles();
  const auth = useAuth().auth.get();
  const uid = auth.user?.uid;
  const { databases, dbLoading } = state.get();
  return (
    <span style={{ display: "flex", alignItems: "center" }}>
      <Tooltip title="refresh databases">
        <IconButton
          size="small"
          aria-label="refresh databases"
          disabled={dbLoading || !uid}
          onClick={() => refreshDatabases()}
          color="primary"
        >
          <LoadIcon className={dbLoading ? styles.spin : ""} />
        </IconButton>
      </Tooltip>
      <Select
        variant="outlined"
        margin="dense"
        value={state.prop("graph").prop("dbId").get()}
        onChange={(e) => {
          const db = databases.find((_db) => _db.id === e.target.value);
          const oldDbId = state.prop("graph").prop("id").get();
          const { x, y, group } = defaultGraph;
          const replacementProps = oldDbId ? { x, y, group } : {};
          if (db) {
            state.prop("graph").mod((g) => ({
              ...g,
              ...replacementProps,
              dbId: db.id,
              dbName: db.name,
            }));
            unsave(state);
          }
        }}
        disabled={dbLoading}
      >
        {[...databases]
          .sort((db1, db2) => (db2.name < db1.name ? 1 : -1))
          .map((db) => (
            <MenuItem value={db.id} dense>
              {db.name}
            </MenuItem>
          ))}
      </Select>
    </span>
  );
};
