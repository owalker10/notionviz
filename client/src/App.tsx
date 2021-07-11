import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./App.css";
import { ThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import theme from "./styles/theme";
import { GlobalProvider } from "./Context/context";
import MainLayout from "./Components/MainLayout";
import Home from "./Views/Home";

// https://reactrouter.com/web/api/Hooks/useparams

const App = (): JSX.Element => {
  // console.log(process.env.NODE_ENV);
  return (
    <div className="App" style={{ minHeight: "100vh" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <Router>
            <GlobalProvider>
              <MainLayout>
                <Switch>
                  <Route exact path="/">
                    <Home />
                  </Route>
                  <Route exact path="/graphs">
                    <div />
                  </Route>
                  <Route exact path="/edit/:gid">
                    <div />
                  </Route>
                  <Route exact path="/embed/:gid">
                    <div />
                  </Route>
                </Switch>
              </MainLayout>
            </GlobalProvider>
          </Router>
        </CssBaseline>
      </ThemeProvider>
    </div>
  );
};

export default App;
