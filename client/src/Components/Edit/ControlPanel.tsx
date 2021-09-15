import {
  Chip,
  Divider as MuiDivider,
  useTheme,
  makeStyles,
  Switch,
  Paper,
  IconButton,
  Typography,
} from "@material-ui/core";
import { FunState } from "fun-state";
import React, { FC, useMemo } from "react";
import {
  getAxisVariable,
  getXAlias,
  getYAlias,
  propertyToVariables,
} from "common/lib/graph";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { ContentHeader } from "../../styles/typography";
import { EditState } from "../../State/EditState";
import { FlexColumn, injectProps } from "../../utils/components";
import DefaultFormRow from "../FormRow";
import DatabaseSelect from "./DatabaseSelect";
import GraphTypeSelect from "./GraphTypeSelect";
import Color from "../../styles/colors";
import VariableSelect from "./VariableSelect";
import getOptionInputs from "./OptionInputs";

// todo: make this overlay instead of wrap on overflow

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    right: "-50px",
    overflow: "hidden", // this is literally just to apply the Paper border radius to the top collapse bar
  },
  topBar: {
    backgroundColor: theme.palette.secondary.main,
    width: "100%",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0, 2),
    "& > p": {
      color: theme.palette.text.hint,
      fontSize: "14px",
    },
  },
  wrapper: {
    marginLeft: "auto",
    width: "400px",
    padding: theme.spacing(2, 3),
  },
  section: {
    width: "100%",
    marginBottom: theme.spacing(3),
  },
  sectionHeader: {
    marginBottom: theme.spacing(1),
    alignSelf: "flex-start",
    display: "flex",
    alignItems: "center",
    "& > *": {
      marginRight: theme.spacing(2),
    },
    "& > :last-child": {
      marginRight: 0,
    },
  },
  formRowLabel: {
    color: theme.palette.text.secondary,
  },
}));

const CategoricalChip = () => (
  <Chip
    label="categorical"
    style={{ backgroundColor: Color.notion.light.blue }}
  />
);
const NumericalChip = () => (
  <Chip label="numerical" style={{ backgroundColor: Color.notion.light.red }} />
);
const TimeChip = () => (
  <Chip label="time" style={{ backgroundColor: Color.notion.light.green }} />
);
const OptionalChip = () => (
  <Chip label="optional" style={{ backgroundColor: Color.notion.light.grey }} />
);
type Chips = typeof CategoricalChip[];

const chipMap = {
  categorical: CategoricalChip,
  numerical: NumericalChip,
  time: TimeChip,
  optional: OptionalChip,
} as const;

const Divider = injectProps(MuiDivider, { style: { width: "100%" } });

const Section: FC<{
  state: FunState<EditState>;
  title: string;
  chips?: Chips;
  inputs: JSX.Element[];
  noDivider?: boolean;
}> = ({ title, chips, inputs, noDivider }) => {
  const styles = useStyles(useTheme());
  return (
    <FlexColumn
      className={styles.section}
      style={noDivider ? { marginBottom: 0 } : {}}
    >
      <span className={styles.sectionHeader}>
        <ContentHeader>{title}</ContentHeader>
        {chips ? chips.map((AChip) => <AChip />) : null}
      </span>
      {inputs}
      {noDivider ? null : <Divider />}
    </FlexColumn>
  );
};

export default ({
  state,
  refreshDatabases,
}: {
  state: FunState<EditState>;
  refreshDatabases: VoidFunction;
}): JSX.Element => {
  const styles = useStyles(useTheme());
  const FormRow = injectProps(DefaultFormRow, {
    classes: { title: styles.formRowLabel },
  });
  const { graph, schema, dataLoading } = state.get();
  const togglePublic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isPublic = e.currentTarget.checked;
    state.prop("graph").prop("isPublic").set(isPublic);
  };
  const xName = getXAlias(graph.type);
  const yName = getYAlias(graph.type);
  const { x, y, group, optional } = getAxisVariable(graph.type);
  const xChip = chipMap[x];
  const yChip = chipMap[y];
  const groupChips = group ? [chipMap[group]] : [];
  if (groupChips[0] && optional) groupChips.push(chipMap.optional);
  const variables = useMemo(() => {
    console.log("hello");
    console.log(schema);
    return schema.flatMap(propertyToVariables);
  }, [dataLoading, graph.dbId]);
  return (
    <Paper elevation={8} className={styles.paper}>
      <div className={styles.topBar}>
        <Typography color="textSecondary">configure your graph</Typography>
        <IconButton size="small" style={{ transform: "rotate(180deg)" }}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <FlexColumn className={styles.wrapper}>
        {/* graph section */}
        <Section
          state={state}
          title="graph"
          inputs={[
            <FormRow title="Database">
              <DatabaseSelect
                state={state}
                refreshDatabases={refreshDatabases}
              />
            </FormRow>,
            <FormRow title="Graph Type">
              <GraphTypeSelect state={state} />
            </FormRow>,
            <FormRow title="Public">
              <Switch
                checked={state.prop("graph").prop("isPublic").get()}
                onChange={togglePublic}
              />
            </FormRow>,
          ]}
        />
        {/* x-axis section */}
        <Section
          state={state}
          title={xName}
          chips={[xChip]}
          inputs={[
            <FormRow title="Property">
              <VariableSelect
                state={state.prop("graph").prop("x")}
                type={graph.type}
                axis="x"
                variables={variables}
                loading={dataLoading}
              />
            </FormRow>,
            // only show options if group property is selected
            ...(state.prop("graph").prop("x").prop("id").get()
              ? getOptionInputs(state, "x")
              : []),
          ]}
        />
        {/* y-axis section */}
        <Section
          state={state}
          title={yName}
          chips={[yChip]}
          inputs={[
            <FormRow title="Property">
              <VariableSelect
                state={state.prop("graph").prop("y")}
                type={graph.type}
                axis="y"
                variables={variables}
                loading={dataLoading}
              />
            </FormRow>,
            // only show options if group property is selected
            ...(state.prop("graph").prop("y").prop("id").get()
              ? getOptionInputs(state, "y")
              : []),
          ]}
        />
        {/* group section */}
        {group ? (
          <Section
            state={state}
            title="Group"
            chips={groupChips}
            inputs={[
              <FormRow title="Property">
                <VariableSelect
                  state={state.prop("graph").prop("group")}
                  type={graph.type}
                  axis="group"
                  variables={variables}
                  optional={optional}
                  loading={dataLoading}
                />
              </FormRow>,
              // only show options if group property is selected
              ...(state.prop("graph").prop("group").prop("id").get()
                ? getOptionInputs(state, "group")
                : []),
            ]}
          />
        ) : null}
      </FlexColumn>
    </Paper>
  );
};
