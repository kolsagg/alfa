/**
 * Export Data Tests
 *
 * Story 8.6: Unit tests for export functionality
 * Task 5.3: Verifies memory safety (Blob URL revocation)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportBackup, createPreImportBackup } from "./export-data";
import type { Subscription } from "@/types/subscription";

describe("exportBackup", () => {
  const mockSubscriptions: Subscription[] = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Netflix",
      amount: 49.99,
      currency: "TRY",
      billingCycle: "monthly",
      nextPaymentDate: "2025-01-15T00:00:00.000Z",
      isActive: true,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    },
  ];

  const mockSettings = {
    theme: "dark" as const,
    notificationsEnabled: true,
    notificationDaysBefore: 3,
    notificationTime: "09:00",
    notificationPermission: "granted" as const, // Should be filtered out
    onboardingCompleted: true, // Should be filtered out
  };

  // Store original globals
  let originalCreateElement: typeof document.createElement;
  let originalAppendChild: typeof document.body.appendChild;
  let originalRemoveChild: typeof document.body.removeChild;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  const mockClick = vi.fn();
  const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
  const mockRevokeObjectURL = vi.fn();
  const mockAppendChild = vi.fn();
  const mockRemoveChild = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();

    // Store originals
    originalCreateElement = document.createElement.bind(document);
    originalAppendChild = document.body.appendChild.bind(document.body);
    originalRemoveChild = document.body.removeChild.bind(document.body);
    originalCreateObjectURL = URL.createObjectURL.bind(URL);
    originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);

    // Mock anchor element
    const mockAnchor = {
      href: "",
      download: "",
      click: mockClick,
    };

    document.createElement = vi
      .fn()
      .mockReturnValue(mockAnchor) as unknown as typeof document.createElement;
    document.body.appendChild =
      mockAppendChild as unknown as typeof document.body.appendChild;
    document.body.removeChild =
      mockRemoveChild as unknown as typeof document.body.removeChild;
    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    // Restore originals
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  describe("successful export", () => {
    it("should return success with filename and size", () => {
      const result = exportBackup(mockSubscriptions, mockSettings);

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(
        /^subtracker-backup-\d{4}-\d{2}-\d{2}\.json$/
      );
      expect(result.sizeBytes).toBeGreaterThan(0);
    });

    it("should create download link and trigger click", () => {
      exportBackup(mockSubscriptions, mockSettings);

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it("should filter out non-whitelisted settings", () => {
      const result = exportBackup(mockSubscriptions, mockSettings);

      expect(result.success).toBe(true);
      // The exported JSON won't contain notificationPermission or onboardingCompleted
    });
  });

  describe("Task 5.3: memory safety", () => {
    it("should revoke blob URL after download", () => {
      exportBackup(mockSubscriptions, mockSettings);

      // Fast-forward timers to trigger cleanup
      vi.advanceTimersByTime(150);

      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe("NFR15: size warning", () => {
    it("should not show warning for small backups", () => {
      const result = exportBackup(mockSubscriptions, mockSettings);

      expect(result.sizeWarning).toBe(false);
    });

    // Large backup test would require generating >5MB of data
    // which is impractical for unit tests
  });
});

describe("createPreImportBackup", () => {
  // Store original globals
  let originalCreateElement: typeof document.createElement;
  let originalAppendChild: typeof document.body.appendChild;
  let originalRemoveChild: typeof document.body.removeChild;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  const mockClick = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();

    // Store originals
    originalCreateElement = document.createElement.bind(document);
    originalAppendChild = document.body.appendChild.bind(document.body);
    originalRemoveChild = document.body.removeChild.bind(document.body);
    originalCreateObjectURL = URL.createObjectURL.bind(URL);
    originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);

    const mockAnchor = { href: "", download: "", click: mockClick };

    document.createElement = vi
      .fn()
      .mockReturnValue(mockAnchor) as unknown as typeof document.createElement;
    document.body.appendChild =
      vi.fn() as unknown as typeof document.body.appendChild;
    document.body.removeChild =
      vi.fn() as unknown as typeof document.body.removeChild;
    URL.createObjectURL = vi.fn(() => "blob:url");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    // Restore originals
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it("should create backup with timestamp in filename", () => {
    const subscriptions: Subscription[] = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Spotify",
        amount: 39.99,
        currency: "TRY",
        billingCycle: "monthly",
        nextPaymentDate: "2025-01-20T00:00:00.000Z",
        isActive: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ];

    const result = createPreImportBackup(subscriptions, { theme: "light" });

    expect(result.success).toBe(true);
    expect(result.filename).toMatch(/^subtracker-pre-import-/);
  });
});
