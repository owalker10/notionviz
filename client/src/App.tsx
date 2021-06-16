import React, { useState, useEffect } from "react";
import { GraphType } from "@graph";
import logo from "./logo.svg";
import "./App.css";

function App(): JSX.Element {
  const [time, setTime] = useState(0);
  useEffect(() => {
    fetch("/api/timestamp")
      .then((res) => res.json())
      .then((timestamp) => {
        setTime(timestamp);
      });
  }, []);
  console.log(GraphType.bar);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>It is {time} seconds.</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
