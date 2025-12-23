/**
 * Tests for src/lib/notification/utils.ts
 *
 * Story 4.7: isPushNotificationActive helper tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isPushNotificationActive } from "./utils";

// Mock the notification-permission module
vi.mock("@/lib/notification-permission", () => ({
  isNotificationSupported: vi.fn(),
}));

import { isNotificationSupported } from "@/lib/notification-permission";

const mockedIsNotificationSupported = vi.mocked(isNotificationSupported);

describe("isPushNotificationActive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when all conditions are met", () => {
    mockedIsNotificationSupported.mockReturnValue(true);

    const result = isPushNotificationActive(true, "granted");

    expect(result).toBe(true);
    expect(mockedIsNotificationSupported).toHaveBeenCalledOnce();
  });

  it("returns false when notificationsEnabled is false", () => {
    mockedIsNotificationSupported.mockReturnValue(true);

    const result = isPushNotificationActive(false, "granted");

    expect(result).toBe(false);
  });

  it("returns false when permission is denied", () => {
    mockedIsNotificationSupported.mockReturnValue(true);

    const result = isPushNotificationActive(true, "denied");

    expect(result).toBe(false);
  });

  it("returns false when permission is default", () => {
    mockedIsNotificationSupported.mockReturnValue(true);

    const result = isPushNotificationActive(true, "default");

    expect(result).toBe(false);
  });

  it("returns false when notifications are not supported", () => {
    mockedIsNotificationSupported.mockReturnValue(false);

    const result = isPushNotificationActive(true, "granted");

    expect(result).toBe(false);
  });

  it("returns false when multiple conditions fail", () => {
    mockedIsNotificationSupported.mockReturnValue(false);

    const result = isPushNotificationActive(false, "denied");

    expect(result).toBe(false);
  });
});
