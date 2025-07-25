import React from "react";
import "./App.css";
//import useAuth from "./hooks/useAuth";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import App from "./App";

function Layouts() {
  // const { isLogin, keycloakClient } = useAuth();

  return (
    //<ProtectedRoute isLogin={isLogin} keycloakClient={keycloakClient}>
    <App />
    //</ProtectedRoute>
  );
}

export default Layouts;
