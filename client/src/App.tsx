import React from "react";
import Button from "@material-ui/core/Button";
import { BrowserRouter as Router } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";
import { authRedirectURL, useAuth } from "./hooks/useAuth";
import { GlobalProvider } from "./Context/context";

const Authy = (): React.ReactElement => {
  const { auth, logout } = useAuth();
  const { user, loggedIn } = auth;
  return (
    <div>
      {loggedIn ? (
        <>
          <p style={{ color: "white" }}>Hello {user?.workspaceName}</p>
          <Button color="primary" variant="contained" onClick={logout}>
            Logout
          </Button>
        </>
      ) : (
        <a style={{ textDecoration: "none" }} href={authRedirectURL}>
          <Button color="primary" variant="contained">
            Login
          </Button>
        </a>
      )}
    </div>
  );
};

const App = (): JSX.Element => {
  console.log(process.env.NODE_ENV);
  return (
    <Router>
      <GlobalProvider>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <Authy />
          </header>
        </div>
      </GlobalProvider>
    </Router>
  );
};

export default App;
