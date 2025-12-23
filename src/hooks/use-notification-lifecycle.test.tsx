import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNotificationLifecycle } from "./use-notification-lifecycle";
import {
  checkAndDispatchNotifications,
  syncNotificationPermissions,
} from "@/services/notification-dispatcher";

const mockRunRecovery = vi.fn();

vi.mock("@/services/notification-dispatcher", () => ({
  checkAndDispatchNotifications: vi.fn(),
  syncNotificationPermissions: vi.fn(),
}));

vi.mock("./use-missed-notifications-recovery", () => ({
  useMissedNotificationsRecovery: () => ({
    runRecovery: mockRunRecovery,
  }),
}));

describe("useNotificationLifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should trigger recovery, dispatch and sync on mount", () => {
    renderHook(() => useNotificationLifecycle());

    expect(mockRunRecovery).toHaveBeenCalledTimes(1);
    expect(checkAndDispatchNotifications).toHaveBeenCalledTimes(1);
    expect(syncNotificationPermissions).toHaveBeenCalledTimes(1);
  });

  it("should trigger periodically every 60s", () => {
    renderHook(() => useNotificationLifecycle());

    // Initial call
    expect(checkAndDispatchNotifications).toHaveBeenCalledTimes(1);

    // Fast forward 60s
    vi.advanceTimersByTime(60000);

    expect(mockRunRecovery).toHaveBeenCalledTimes(2);
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

    expect(mockRunRecovery).toHaveBeenCalledTimes(2);
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
