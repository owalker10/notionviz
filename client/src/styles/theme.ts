import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";

// useTheme hook will give you this in a FC
// use makeStyles to generate a useStyles hook

// overrides: https://material-ui.com/customization/globals/

const theme = createTheme({
  palette: {
    primary: {
      main: "#4E90F1", // blue
    },
    secondary: {
      main: "#F7F6F3", // warm grey
    },
    text: {
      primary: "#37352F",
      secondary: "#7B7974",
    },
    background: {
      default: "#FFFFFF",
    },
    grey: {
      200: "#E5E5E5",
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
  },
});

const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;

export const mobileBreakpointWidth = "480px";
