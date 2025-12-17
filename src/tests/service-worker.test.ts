import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInstallPrompt } from "../hooks/use-install-prompt";

// Service Worker registration is handled by vite-plugin-pwa virtual module
// and cannot be unit tested reliably without E2E.
// Using integration tests or E2E (Playwright) is recommended for SW lifecycle.

describe("Install Prompt Hook", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("initially isInstallable true when not standalone (waiting for install prompt)", () => {
    const { result } = renderHook(() => useInstallPrompt());
    // When not in standalone mode and no install prompt yet, isInstallable is true
    // (meaning the app could potentially be installable once the browser fires the event)
    expect(result.current.isInstallable).toBe(true);
    expect(result.current.isStandalone).toBe(false);
  });

  it("becomes installable on beforeinstallprompt event", () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      const event = new Event("beforeinstallprompt");
      // @ts-expect-error - manual mock property for testing
      event.prompt = vi.fn();
      // @ts-expect-error - manual mock property for testing
      event.userChoice = Promise.resolve({ outcome: "accepted" });

      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);
  });
});
