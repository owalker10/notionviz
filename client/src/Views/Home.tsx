import React from "react";
import { makeStyles, Typography, useTheme } from "@material-ui/core";
import { GraphType } from "common/lib/graph";
import { SecondaryButton } from "../Components/buttons";
import { PrimaryLink, Title } from "../styles/typography";
import { authRedirectURL, useAuth } from "../hooks/useAuth";
import cube from "../assets/logo_cube.svg";
import { FlexColumn, WrapGrid } from "../utils/components";
import { cardDim, CreateGraph, GraphCard } from "../Components/GraphCard";
import { range } from "../utils/array";

const useStyles = makeStyles((theme) => ({
  content: {
    marginTop: theme.spacing(8),
    flexGrow: 1,
    width: "100%",
  },
  logo: {
    width: "100%",
    animation: "$bouncing 1s linear 0s infinite alternate",
  },
  shadow: {
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: "100%",
    width: "100%",
    height: "20px",
    marginTop: theme.spacing(1),
    animation: "$shadowMove 1s linear 0s infinite alternate",
  },
  logoContainer: {
    width: "150px",
    [theme.breakpoints.down("xs")]: {
      width: "100px",
    },
    marginBottom: theme.spacing(2),
  },
  notAuthenticated: {
    justifyContent: "center",
    flexGrow: 1,
  },
  toGetStarted: {
    marginBottom: theme.spacing(1),
  },
  graphsWrapper: {
    alignSelf: "flex-start",
    marginTop: theme.spacing(8),
    width: "100%",
  },
  graphsHeader: {
    display: "flex",
    flexDirection: "row",
    "& > *:first-child": {
      marginRight: theme.spacing(4),
    },
    gridColumn: "1 / -1",
  },
  "@keyframes bouncing": {
    "0%": {
      marginBottom: theme.spacing(2),
      marginTop: 0,
    },
    "100%": {
      marginTop: theme.spacing(2),
      marginBottom: 0,
    },
  },
  "@keyframes shadowMove": {
    "0%": {
      width: "90%",
    },
    "100%": {
      width: "100%",
    },
  },
}));

export default (): React.ReactElement => {
  const { loggedIn, isLoading, user } = useAuth().auth.get();
  const newGraphURL = user ? `/edit/${user.nextGid.toString()}` : "";
  const styles = useStyles(useTheme());
  return (
    <FlexColumn className={styles.content}>
      <FlexColumn className={styles.logoContainer}>
        <img className={styles.logo} src={cube} alt="NotionViz logo" />
        <div className={styles.shadow} />
      </FlexColumn>

      <Title>Welcome to NotionViz!</Title>
      {loggedIn || isLoading ? (
        <div className={styles.graphsWrapper}>
          <WrapGrid colWidth={cardDim}>
            <div className={styles.graphsHeader}>
              <Typography>Recent graphs</Typography>
              <PrimaryLink to="/graphs">See all</PrimaryLink>
            </div>
            {isLoading
              ? range(3).map((n) => <GraphCard isLoading key={n} />)
              : [
                  <GraphCard
                    gid={1}
                    name="My Graph"
                    databaseName="My Database"
                    type={GraphType.bar}
                  />,
                  <GraphCard
                    gid={1}
                    name="My Graph"
                    databaseName="My Database"
                    type={GraphType.bar}
                  />,
                  <CreateGraph to={newGraphURL} />,
                ]}
          </WrapGrid>
        </div>
      ) : (
        <FlexColumn className={styles.notAuthenticated}>
          <Typography className={styles.toGetStarted}>
            To get started, log in to your Notion workspace.
          </Typography>
          <SecondaryButton component="a" href={authRedirectURL}>
            Login
          </SecondaryButton>
        </FlexColumn>
      )}

      {/* <EditableTitle value="Change me" />
      <PrimaryButton startIcon={<SaveIcon />}>Save</PrimaryButton>
      <SecondaryButton>Cancel</SecondaryButton>
      <Typography>
        To get started, <a href="/">login</a>.
      </Typography> */}
    </FlexColumn>
  );
};