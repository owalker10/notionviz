import React from "react";
import { Switch, Route } from "react-router-dom";
import MainLayout from "../Components/MainLayout";
import { webPath, toWebPath } from "../utils/routes";
import Home from "../Views/Home";

export default (): JSX.Element => (
  <MainLayout>
    <Switch>
      <Route exact path={`/${webPath}`}>
        <Home />
      </Route>
      <Route exact path={toWebPath("/graphs")}>
        <div />
      </Route>
      <Route exact path={toWebPath("/edit/:gid")}>
        <div />
      </Route>
    </Switch>
  </MainLayout>
);
