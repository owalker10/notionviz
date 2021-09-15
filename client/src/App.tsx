import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import "./App.css";
import { ThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import theme from "./styles/theme";
import { GlobalProvider } from "./State/context";
import { embedPath, webPath } from "./utils/routes";
import { FallbackSpinner } from "./Components/spinner";

// https://reactrouter.com/web/api/Hooks/useparams

const App = (): JSX.Element => {
  // console.log(process.env.NODE_ENV);
  return (
    <div className="App" style={{ minHeight: "100vh" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <Router>
            <GlobalProvider>
              {/* use code-splitting for web-based pages and embed page since one client is not likely to render both */}
              <Suspense fallback={<FallbackSpinner />}>
                <Switch>
                  <Route exact path="/">
                    <Redirect to={`/${webPath}`} />
                  </Route>
                  {/* website pages */}
                  <Route
                    path={`/${webPath}`}
                    component={lazy(() => import("./Routes/Web"))}
                  />
                  {/* embed page */}
                  <Route
                    path={`/${embedPath}`}
                    component={lazy(() => import("./Routes/Embed"))}
                  />
                  <Route component={() => <Redirect to={`/${webPath}`} />} />
                </Switch>
              </Suspense>
            </GlobalProvider>
          </Router>
        </CssBaseline>
      </ThemeProvider>
    </div>
  );
};

export default App;
