import { useEffect } from "react";
import { useSettingsStore } from "./stores/settings-store";
import { useUIStore } from "./stores/ui-store";
import { ThemeProvider } from "./components/providers/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  // Test Zustand stores
  const theme = useSettingsStore((state) => state.theme);
  // const setTheme = useSettingsStore((state) => state.setTheme);
  const notificationTime = useSettingsStore((state) => state.notificationTime);

  const isLoading = useUIStore((state) => state.isLoading);
  const setLoading = useUIStore((state) => state.setLoading);

  useEffect(() => {
    console.log("✅ Zustand stores initialized!");
    console.log("📦 Settings Store - Theme:", theme);
    console.log("📦 UI Store - Loading:", isLoading);
    console.log('🔍 Check localStorage for "subtracker-settings-dev"');
  }, [theme, isLoading]);

  return (
    <>
      <ThemeProvider>
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React + Zustand</h1>

        {/* Zustand Store Test UI */}
        <div className="card">
          <h2>🧪 Store Test</h2>
          <p>
            <strong>Theme:</strong> {theme}
          </p>
          <p>
            <strong>Notification Time:</strong> {notificationTime}
          </p>
          <p>
            <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              justifyContent: "center",
            }}
          >
            <ThemeToggle />
          </div>

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => setLoading(!isLoading)}>
              {isLoading ? "⏸️ Stop Loading" : "▶️ Start Loading"}
            </button>
          </div>

          <p style={{ fontSize: "12px", marginTop: "20px", opacity: 0.7 }}>
            💡 Open DevTools → Application → Local Storage to see
            "subtracker-settings-dev"
          </p>
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;
