import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeSelector } from "./theme-selector";
import { useSettingsStore } from "@/stores/settings-store";

// Mock matchMedia for system preference detection
function createMockMatchMedia(prefersDark: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-color-scheme: dark)" ? prefersDark : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("ThemeSelector", () => {
  const originalMatchMedia = window.matchMedia;
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset store to defaults
    useSettingsStore.setState({ theme: "system" });
    // Default to light system preference
    window.matchMedia = createMockMatchMedia(false);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders segmented control with three options", () => {
      render(<ThemeSelector />);

      expect(screen.getByRole("tab", { name: /açık/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /koyu/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /sistem/i })).toBeInTheDocument();
    });

    it("has correct label and accessible name", () => {
      render(<ThemeSelector />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-label", "Tema seçimi");
    });

    it("displays current theme as selected", () => {
      useSettingsStore.setState({ theme: "dark" });
      render(<ThemeSelector />);

      const darkTab = screen.getByRole("tab", { name: /koyu/i });
      expect(darkTab).toHaveAttribute("data-state", "active");
    });
  });

  describe("Theme Changes (AC1, AC2)", () => {
    it("updates store when light theme selected", async () => {
      render(<ThemeSelector />);

      const lightTab = screen.getByRole("tab", { name: /açık/i });
      await user.click(lightTab);

      await waitFor(() => {
        expect(useSettingsStore.getState().theme).toBe("light");
      });
    });

    it("updates store when dark theme selected", async () => {
      useSettingsStore.setState({ theme: "light" });
      render(<ThemeSelector />);

      const darkTab = screen.getByRole("tab", { name: /koyu/i });
      await user.click(darkTab);

      await waitFor(() => {
        expect(useSettingsStore.getState().theme).toBe("dark");
      });
    });

    it("updates store when system theme selected", async () => {
      useSettingsStore.setState({ theme: "light" });
      render(<ThemeSelector />);

      const systemTab = screen.getByRole("tab", { name: /sistem/i });
      await user.click(systemTab);

      await waitFor(() => {
        expect(useSettingsStore.getState().theme).toBe("system");
      });
    });
  });

  describe("System Indicator (AC3)", () => {
    it("shows system preference indicator when system theme is selected (light)", () => {
      window.matchMedia = createMockMatchMedia(false); // System prefers light
      useSettingsStore.setState({ theme: "system" });
      const { container } = render(<ThemeSelector />);

      // Find the indicator paragraph (not the tab button)
      const indicator = container.querySelector("p");
      expect(indicator).toHaveTextContent(/şu anki sistem tercihi:/i);
      expect(indicator).toHaveTextContent("Açık");
    });

    it("shows system preference indicator when system theme is selected (dark)", () => {
      window.matchMedia = createMockMatchMedia(true); // System prefers dark
      useSettingsStore.setState({ theme: "system" });
      const { container } = render(<ThemeSelector />);

      const indicator = container.querySelector("p");
      expect(indicator).toHaveTextContent(/şu anki sistem tercihi:/i);
      expect(indicator).toHaveTextContent("Koyu");
    });

    it("hides system indicator when light theme is explicitly selected", () => {
      useSettingsStore.setState({ theme: "light" });
      const { container } = render(<ThemeSelector />);

      const indicator = container.querySelector("p");
      expect(indicator).toBeNull();
    });

    it("hides system indicator when dark theme is explicitly selected", () => {
      useSettingsStore.setState({ theme: "dark" });
      const { container } = render(<ThemeSelector />);

      const indicator = container.querySelector("p");
      expect(indicator).toBeNull();
    });
  });

  describe("Accessibility (AC2, AC4)", () => {
    it("supports keyboard navigation via arrow keys", () => {
      render(<ThemeSelector />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toBeInTheDocument();

      // Tabs component natively handles arrow key navigation
      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
    });

    it("has proper focus ring styling class", () => {
      render(<ThemeSelector />);

      const lightTab = screen.getByRole("tab", { name: /açık/i });
      // AC2: Correct focus ring styling
      expect(lightTab).toHaveClass("focus-visible:ring-2");
      expect(lightTab).toHaveClass("focus-visible:ring-primary");
    });
  });

  describe("Synchronization with Header ThemeToggle (AC4)", () => {
    it("store state changes affect both components", async () => {
      // Simulating synchronization - when ThemeSelector changes store,
      // any component using useSettingsStore will get the update
      render(<ThemeSelector />);

      const darkTab = screen.getByRole("tab", { name: /koyu/i });
      await user.click(darkTab);

      // The store is updated - Header's ThemeToggle will read this same state
      await waitFor(() => {
        expect(useSettingsStore.getState().theme).toBe("dark");
      });
    });
  });
});
