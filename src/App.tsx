import { RouterProvider } from "react-router";
import { ThemeProvider } from "./components/providers/theme-provider";
import { router } from "./router";
import "./App.css";

/**
 * Main Application Component
 *
 * Story 8.1: React Router Setup
 * - ThemeProvider wraps the entire app for theme context
 * - RouterProvider handles all routing via hash-based router
 * - Notification hooks moved to RootLayout for cross-page consistency
 */
function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
