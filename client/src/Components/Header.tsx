import React, { FC } from "react";
import {
  AppBar,
  ButtonBase,
  ListItem,
  MenuItem,
  Toolbar,
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import cube from "../assets/logo_cube.svg";
import logoText from "../assets/logo_text.svg";
import { faq } from "../utils/links";
import { authRedirectURL, useAuth } from "../hooks/useAuth";
import useWindowSize from "../hooks/useWindowSize";
import Menu from "./Menu";

const logoBreakpoint = 850;
const menuBreakpoint = 700;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles((theme) => ({
  root: {},
  appBar: {},
  container: {
    width: "100%",
  },
  logo: {
    fontSize: 0,
    display: "grid",
    gridTemplateColumns: "auto auto",
    columnGap: theme.spacing(2),
    alignItems: "center",
  },
  tabs: {
    marginLeft: theme.spacing(3),
  },
  tab: {
    padding: `0 ${theme.spacing(4)}px`,
    color: theme.palette.text.secondary,
    fontSize: "16px",
    textDecoration: "none",
    "&:hover": {
      color: theme.palette.text.primary,
    },
  },
  profile: {
    display: "flex",
    alignItems: "center",
    color: theme.palette.text.secondary,
    marginLeft: "auto",
    "& a": {
      color: theme.palette.text.secondary,
      textDecoration: "none",
    },
    "& a:hover": {
      color: theme.palette.text.primary,
      textDecoration: "underline",
    },
  },
  picture: {
    borderRadius: "4px",
    height: "40px",
  },
  workspaceName: {
    marginRight: theme.spacing(2),
  },
}));

const tabs = (className: string) => [
  <Link className={className} to="/graphs">
    My Graphs
  </Link>,
  <a className={className} href={faq}>
    About
  </a>,
  <a className={className} href={faq}>
    Examples
  </a>,
];

const Header: FC = () => {
  const { auth } = useAuth();
  const { user, loggedIn } = auth;
  const { workspaceName, workspaceIcon } = user || {};
  const styles = useStyles(useTheme());
  const { width } = useWindowSize();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const Icon = (
    <img
      src={workspaceIcon || undefined}
      className={styles.picture}
      alt="workspace icon"
    />
  );
  return (
    <div className={styles.root}>
      <AppBar
        color="secondary"
        position="static"
        elevation={0}
        className={styles.appBar}
      >
        <Toolbar className={styles.container}>
          <Link className={styles.logo} to="/">
            <img src={cube} height="40px" alt="logo" />
            {width && width > logoBreakpoint ? (
              <img src={logoText} height="22px" alt="NotionViz" />
            ) : null}
          </Link>
          {width && width > menuBreakpoint ? (
            <div className={styles.tabs}>{tabs(styles.tab)}</div>
          ) : null}
          <div className={styles.profile}>
            {loggedIn ? (
              <>
                {width && width > menuBreakpoint ? (
                  <>
                    <span className={styles.workspaceName}>
                      {workspaceName}
                    </span>
                    {Icon}
                  </>
                ) : (
                  <>
                    <ButtonBase onClick={(e) => setAnchorEl(e.currentTarget)}>
                      {Icon}
                    </ButtonBase>
                    {/* styles todo: remove top and bottom padding */}
                    {/* and maybe add a dropdown arrow */}
                    <Menu
                      anchorEl={anchorEl}
                      onClose={() => setAnchorEl(null)}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      getContentAnchorEl={null}
                    >
                      <ListItem divider>{workspaceName}</ListItem>
                      <MenuItem>Foo</MenuItem>
                      <MenuItem>Bar</MenuItem>
                    </Menu>
                  </>
                )}
              </>
            ) : (
              <a href={authRedirectURL}>LOGIN</a>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
