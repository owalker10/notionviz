import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";

// useTheme hook will give you this in a FC
// use makeStyles to generate a useStyles hook

// overrides: https://material-ui.com/customization/globals/

const primary = "#4E90F1"; // blue

const theme = createTheme({
  palette: {
    primary: {
      main: primary, // blue
    },
    secondary: {
      main: "#F7F6F3", // warm grey
    },
    text: {
      primary: "#37352F",
      secondary: "#7B7974",
      hint: "#AEACA8",
    },
    background: {
      default: "#FFFFFF",
    },
    grey: {
      100: "#FAFAFA",
      200: "#E5E5E5",
      300: "#D2D2D2",
    },
    divider: "#E5E5E5", // light neutral grey
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
    button: {
      textTransform: "none",
    },
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  overrides: {
    MuiMenu: {
      list: {
        padding: "4px 0 !important",
      },
    },
    MuiIconButton: {
      root: {
        padding: "8px",
        borderRadius: "3px",
        "&:active": {
          backgroundColor: "rgba(0,0,0,0.10)",
        },
      },
    },
    MuiTypography: {
      root: {
        "& a": {
          color: "#37352F",
          opacity: 0.7,
          "&:hover": {
            opacity: 1,
          },
        },
      },
    },
    MuiListItemIcon: {
      root: {
        minWidth: 0,
        marginRight: "16px",
        color: "#AEACA8",
      },
    },
    // look like Notion's
    MuiSwitch: {
      root: {
        height: "24px",
        width: "44px",
        padding: 0,
      },
      switchBase: {
        "&:hover": {
          background: "none !important",
        },
        padding: "3px",
      },
      thumb: {
        boxShadow: "none",
        width: "18px",
        height: "18px",
        backgroundColor: "white",
      },
      track: {
        opacity: "1 !important",
        borderRadius: "100px",
        backgroundColor: "#DBDAD6",
        "$checked$checked + &": {
          backgroundColor: primary,
        },
      },
    },
  },
});

const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;

export const mobileBreakpointWidth = "480px";

export const gradient = ["#72A8F8", "#5DD177"] as const;
