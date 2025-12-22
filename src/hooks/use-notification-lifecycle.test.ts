import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNotificationLifecycle } from "./use-notification-lifecycle";
import {
  checkAndDispatchNotifications,
  syncNotificationPermissions,
} from "@/services/notification-dispatcher";

vi.mock("@/services/notification-dispatcher", () => ({
  checkAndDispatchNotifications: vi.fn(),
  syncNotificationPermissions: vi.fn(),
}));

describe("useNotificationLifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should trigger dispatch and sync on mount", () => {
    renderHook(() => useNotificationLifecycle());

    expect(checkAndDispatchNotifications).toHaveBeenCalledTimes(1);
    expect(syncNotificationPermissions).toHaveBeenCalledTimes(1);
  });

  it("should trigger periodically every 60s", () => {
    renderHook(() => useNotificationLifecycle());

    // Initial call
    expect(checkAndDispatchNotifications).toHaveBeenCalledTimes(1);

    // Fast forward 60s
    vi.advanceTimersByTime(60000);

    expect(checkAndDispatchNotifications).toHaveBeenCalledTimes(2);
    expect(syncNotificationPermissions).toHaveBeenCalledTimes(2);
  });

  it("should trigger on visibility change to visible", () => {
    renderHook(() => useNotificationLifecycle());

    // Initial call
    expect(checkAndDispatchNotifications).toHaveBeenCalledTimes(1);

    // Mock visibility change
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(checkAndDispatchNotifications).toHaveBeenCalledTimes(2);
    expect(syncNotificationPermissions).toHaveBeenCalledTimes(2);
  });

  it("should NOT trigger on visibility change to hidden", () => {
    renderHook(() => useNotificationLifecycle());
    expect(checkAndDispatchNotifications).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));

    expect(checkAndDispatchNotifications).toHaveBeenCalledTimes(1);
  });
});
