import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/error-boundary";
import "./index.css";
import App from "./App.tsx";
import { initializePrivacyMonitoring } from "./lib/privacy-audit";

// Story 7.2: Start privacy audit spies for network activity
initializePrivacyMonitoring();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster position="top-center" richColors />
    </ErrorBoundary>
  </StrictMode>
);
