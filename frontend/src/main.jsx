import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";
import PWAInstallHandler from "./utils/PWAInstallHandler";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PWAInstallHandler />
    <Router>
      <App />
    </Router>
  </Provider>
);
