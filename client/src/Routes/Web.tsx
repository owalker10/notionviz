import React from "react";
import { Switch, Route } from "react-router-dom";
import MainLayout from "../Components/MainLayout";
import { webPath, toWebPath } from "../utils/routes";
import { NotFound } from "../Views/404";
import Edit from "../Views/Edit";
import Home from "../Views/Home";
import MyGraphs from "../Views/MyGraphs";

export default (): JSX.Element => {
  return (
    <MainLayout>
      <Switch>
        <Route exact path={`/${webPath}`}>
          <Home />
        </Route>
        <Route exact path={toWebPath("/graphs")}>
          <MyGraphs />
        </Route>
        <Route exact path={toWebPath("/edit/:gid")}>
          <Edit />
        </Route>
        <Route exact path={toWebPath("/new")}>
          <Edit />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </MainLayout>
  );
};
