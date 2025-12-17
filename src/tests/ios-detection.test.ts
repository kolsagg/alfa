import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIOSPWADetection } from "../hooks/use-ios-pwa-detection";
import { useSettingsStore } from "../stores/settings-store";

describe("useIOSPWADetection", () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    useSettingsStore.setState({ lastIOSPromptDismissed: undefined });
    vi.clearAllMocks();
    // Default to a non-iOS User Agent
    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    Object.defineProperty(navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });

  const mockUserAgent = (ua: string) => {
    Object.defineProperty(navigator, "userAgent", {
      value: ua,
      configurable: true,
    });
  };

  it("returns true for iOS Safari in non-standalone mode", () => {
    mockUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
    );

    const { result } = renderHook(() => useIOSPWADetection());
    expect(result.current.shouldShowPrompt).toBe(true);
  });

  it("returns false if already in standalone mode", () => {
    mockUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
    );
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
    }));

    const { result } = renderHook(() => useIOSPWADetection());
    expect(result.current.shouldShowPrompt).toBe(false);
  });

  it("returns false if on non-Safari browser on iOS (e.g., Chrome)", () => {
    mockUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/105.0.5195.100 Mobile/15E148 Safari/604.1"
    );

    const { result } = renderHook(() => useIOSPWADetection());
    expect(result.current.shouldShowPrompt).toBe(false);
  });

  it("respects the 7-day dismissal rule", () => {
    mockUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
    );

    // Dismissed 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    useSettingsStore.setState({
      lastIOSPromptDismissed: twoDaysAgo.toISOString(),
    });

    const { result } = renderHook(() => useIOSPWADetection());
    expect(result.current.shouldShowPrompt).toBe(false);

    // Dismissed 8 days ago
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    useSettingsStore.setState({
      lastIOSPromptDismissed: eightDaysAgo.toISOString(),
    });

    const { result: result2 } = renderHook(() => useIOSPWADetection());
    expect(result2.current.shouldShowPrompt).toBe(true);
  });
});
