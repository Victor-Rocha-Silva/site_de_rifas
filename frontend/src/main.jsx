import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmDialogProvider } from "./context/ConfirmDialogContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <ConfirmDialogProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ConfirmDialogProvider>
    </ToastProvider>
  </React.StrictMode>
);