import React from "react";
import { Route } from "react-router-dom";
import { toEmbedPath } from "../utils/routes";

export default (): JSX.Element => (
  <Route exact path={toEmbedPath("/:uid/:gid")}>
    <div />
  </Route>
);
