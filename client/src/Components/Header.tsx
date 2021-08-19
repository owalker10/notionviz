import React, { FC } from "react";
import {
  AppBar,
  ButtonBase,
  Drawer,
  IconButton,
  MenuItem,
  Toolbar,
  Divider,
  List,
} from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import MenuIcon from "@material-ui/icons/Menu";
import cube from "../assets/logo_cube.svg";
import logoText from "../assets/logo_text.svg";
import { faq } from "../utils/links";
import { authRedirectURL, useAuth } from "../hooks/useAuth";
import useWindowSize from "../hooks/useWindowSize";
import Menu from "./Menu";
import { SkeletonText, SkeletonWithContent } from "./skeleton";
import { useStore } from "../hooks/useStore";
import { ellipsis } from "../styles/typography";
import { toWebPath } from "../utils/routes";

const logoBreakpoint = 900;
const menuBreakpoint = 750;

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
    width: "36px",
    height: "36px",
  },
  workspaceName: {
    marginRight: theme.spacing(2),
    maxWidth: "180px",
    ...ellipsis,
  },
  menuContainer: {
    width: "250px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  menuNavList: {
    padding: 0,
    backgroundColor: theme.palette.secondary.main,
    flexGrow: 1,
  },
  navMenuItem: {
    padding: `${theme.spacing(2)}px`,
    color: theme.palette.text.secondary,
    fontSize: "18px",
    textDecoration: "none",
    "&:hover": {
      color: theme.palette.text.primary,
    },
  },
  menuLink: {
    paddingTop: "12px",
    paddingBottom: "12px",
    color: theme.palette.text.secondary,
    textDecoration: "none",
    "&:hover": {
      color: theme.palette.text.primary,
      textDecoration: "underline",
    },
  },
  menuProfile: {
    padding: `${theme.spacing(2)}px`,
    display: "flex",
    alignItems: "center",
  },
  menuWorkspaceName: {
    fontSize: "16px",
    paddingLeft: theme.spacing(1),
    ...ellipsis,
  },
}));

const tabs = (loggedIn: boolean, className = "") => {
  const t = [
    <Link className={className} to={toWebPath("/graphs")} key="graphs">
      My Graphs
    </Link>,
    <a
      className={className}
      href={faq}
      key="about"
      target="_blank"
      rel="noopener noreferrer"
    >
      About
    </a>,
    <a
      className={className}
      href={faq}
      key="examples"
      target="_blank"
      rel="noopener noreferrer"
    >
      Examples
    </a>,
  ];
  if (!loggedIn) t.splice(0, 1);
  return t;
};

const Header: FC = () => {
  const { auth, logout } = useAuth();
  const { user, loggedIn, isLoading } = auth.get();
  const { workspaceName, workspaceIcon } = user || {};
  const styles = useStyles(useTheme());
  const { width } = useWindowSize();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useStore("drawerOpen", false, "session");
  const icon = (
    <SkeletonWithContent className={styles.picture} isLoading={isLoading}>
      <img src={workspaceIcon || undefined} alt="workspace icon" />
    </SkeletonWithContent>
  );
  const workspaceNameText = (
    <SkeletonText isLoading={isLoading} width="10ch">
      {workspaceName}
    </SkeletonText>
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
          <Link className={styles.logo} to={toWebPath("")}>
            <img src={cube} height="40px" alt="logo" />
            {width && width > logoBreakpoint ? (
              <img src={logoText} height="22px" alt="NotionViz" />
            ) : null}
          </Link>
          {/* nav tabs */}
          {width && width > menuBreakpoint ? (
            <div className={styles.tabs}>{tabs(loggedIn, styles.tab)}</div>
          ) : null}
          <div className={styles.profile}>
            {/* width width - workspace name and icon */}
            {/* eslint-disable-next-line no-nested-ternary */}
            {width && width > menuBreakpoint ? (
              loggedIn || isLoading ? (
                <>
                  <span className={styles.workspaceName}>
                    {workspaceNameText}
                  </span>
                  <ButtonBase onClick={(e) => setAnchorEl(e.currentTarget)}>
                    {icon}
                  </ButtonBase>
                  <Menu
                    MenuListProps={{ dense: true }}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    getContentAnchorEl={null}
                  >
                    <MenuItem onClick={logout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <a href={authRedirectURL}>LOGIN</a>
              )
            ) : (
              <>
                {/* narrow width - menu */}
                <IconButton onClick={() => setDrawerOpen(true)}>
                  <MenuIcon />
                </IconButton>
                <Drawer
                  open={drawerOpen}
                  anchor="right"
                  onClose={() => setDrawerOpen(false)}
                >
                  <div className={styles.menuContainer}>
                    <div>
                      {loggedIn || isLoading ? (
                        <>
                          <div className={styles.menuProfile}>
                            {icon}
                            <span className={styles.menuWorkspaceName}>
                              {workspaceNameText}
                            </span>
                          </div>
                          <Divider />
                          <MenuItem
                            component="a"
                            onClick={logout}
                            className={styles.menuLink}
                          >
                            Logout
                          </MenuItem>
                        </>
                      ) : (
                        <MenuItem
                          component="a"
                          href={authRedirectURL}
                          className={styles.menuLink}
                        >
                          Login
                        </MenuItem>
                      )}
                    </div>
                    <Divider />
                    <List className={styles.menuNavList}>
                      {tabs(loggedIn).map((tabElement) => (
                        <MenuItem
                          divider
                          className={styles.navMenuItem}
                          component={tabElement.type}
                          href={tabElement.props.href}
                          to={tabElement.props.to}
                          key={tabElement.key}
                          {...(tabElement.props.href
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : { onClick: () => setDrawerOpen(false) })}
                        >
                          {tabElement.props.children}
                        </MenuItem>
                      ))}
                    </List>
                  </div>
                </Drawer>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
