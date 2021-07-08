import React, { FC } from "react";
import { Container, makeStyles, useTheme } from "@material-ui/core";
import Header from "./Header";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    backgroundColor: theme.palette.background.default,
  },
  content: {
    boxSizing: "border-box",
    MozBoxSizing: "border-box",
    WebkitBoxSizing: "border-box",
    padding: theme.spacing(5),
    display: "flex",
    flexDirection: "column",
  },
}));

const Layout: FC<{ children: NonNullable<React.ReactNode> }> = ({
  children,
}) => {
  const styles = useStyles(useTheme());
  return (
    <div className={styles.wrapper}>
      <Header />
      {/* https://material-ui.com/customization/breakpoints/#breakpoints */}
      <Container maxWidth="md" className={styles.content}>
        {children}
      </Container>
    </div>
  );
};

export default Layout;
