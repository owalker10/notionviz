import React, { FC } from "react";
import { Container, makeStyles, useTheme, withStyles } from "@material-ui/core";
import Header from "./Header";
import { FeedbackTab } from "./feedback";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    backgroundColor: theme.palette.background.default,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
}));

const Layout: FC<{
  children: NonNullable<React.ReactNode>;
}> = ({ children }) => {
  const styles = useStyles(useTheme());
  return (
    <div className={styles.wrapper}>
      <Header />
      {/* https://material-ui.com/customization/breakpoints/#breakpoints */}
      {children}
      <FeedbackTab />
    </div>
  );
};

export const ContentContainer = withStyles((theme) => ({
  root: {
    boxSizing: "border-box",
    MozBoxSizing: "border-box",
    WebkitBoxSizing: "border-box",
    padding: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexGrow: 1,
  },
}))(Container);

// todo: feedback

export default Layout;
