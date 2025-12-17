import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ThemeProvider } from "../components/providers/theme-provider";
import { useSettingsStore } from "../stores/settings-store";

describe("ThemeProvider", () => {
  // Mock window.matchMedia
  const mockMatchMedia = (matches: boolean) => {
    return vi.fn().mockImplementation((query) => ({
      matches: matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  };

  beforeEach(() => {
    // Reset store and DOM
    useSettingsStore.setState({ theme: "system" });
    document.documentElement.className = "";

    // Setup meta tag
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("applies light theme class and meta when theme is explicitly light", () => {
    useSettingsStore.setState({ theme: "light" });
    window.matchMedia = mockMatchMedia(true); // System is dark, but preference is light

    render(<ThemeProvider />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute("content")).toBe("#fcfcfc"); // Light Background logic
  });

  it("applies dark theme class and meta when theme is explicitly dark", () => {
    useSettingsStore.setState({ theme: "dark" });
    window.matchMedia = mockMatchMedia(false); // System is light, but preference is dark

    render(<ThemeProvider />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute("content")).toBe("#0F172A"); // Dark Background logic
  });

  it("applies dark theme when system is dark and preference is system", () => {
    useSettingsStore.setState({ theme: "system" });
    window.matchMedia = mockMatchMedia(true); // System is dark

    render(<ThemeProvider />);

    // Should be dark
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute("content")).toBe("#0F172A");
  });

  it("applies light theme when system is light and preference is system", () => {
    useSettingsStore.setState({ theme: "system" });
    window.matchMedia = mockMatchMedia(false); // System is light

    render(<ThemeProvider />);

    // Should NOT be dark
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute("content")).toBe("#fcfcfc");
  });

  it("updates theme dynamically when system preference changes", () => {
    useSettingsStore.setState({ theme: "system" });

    // Start with light
    let systemIsDark = false;
    const listeners: Array<() => void> = [];

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      get matches() {
        return systemIsDark;
      },
      media: query,
      onchange: null,
      addEventListener: vi.fn((event, callback) => {
        if (event === "change") listeners.push(callback);
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<ThemeProvider />);
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Switch system to dark
    systemIsDark = true;
    listeners.forEach((l) => l());

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    const meta = document.querySelector('meta[name="theme-color"]');
    expect(meta?.getAttribute("content")).toBe("#0F172A");
  });
});
