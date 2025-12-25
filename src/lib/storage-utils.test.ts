/**
 * Storage Utility Tests
 *
 * Story 8.7: Test storage calculation with mocked localStorage
 * AC2: Verify BACKUP_SIZE_THRESHOLD sync
 * AC4: Efficient calculation verification
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateStorageUsage,
  formatBytes,
  isPWAMode,
  SUBTRACKER_STORAGE_KEYS,
} from "./storage-utils";
import { BACKUP_SIZE_THRESHOLD } from "@/types/backup";

describe("Storage Utils", () => {
  describe("calculateStorageUsage", () => {
    const originalLocalStorage = globalThis.localStorage;

    beforeEach(() => {
      // Create a mock localStorage for each test
      const mockStore: Record<string, string> = {};
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => mockStore[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockStore[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockStore[key];
        }),
        clear: vi.fn(() => {
          Object.keys(mockStore).forEach((key) => delete mockStore[key]);
        }),
        length: 0,
        key: vi.fn(),
        _store: mockStore, // Expose for test manipulation
      };

      Object.defineProperty(globalThis, "localStorage", {
        value: mockLocalStorage,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(globalThis, "localStorage", {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
      vi.restoreAllMocks();
    });

    it("returns zero when no SubTracker keys exist", () => {
      const result = calculateStorageUsage();

      expect(result.usedBytes).toBe(0);
      expect(result.limitBytes).toBe(BACKUP_SIZE_THRESHOLD);
      expect(result.usagePercentage).toBe(0);
      expect(result.isWarning).toBe(false);
    });

    it("calculates bytes correctly for SubTracker keys (UTF-8)", () => {
      // 100 ASCII characters = 100 bytes
      const store = (
        localStorage as unknown as { _store: Record<string, string> }
      )._store;
      store["subtracker-subscriptions"] = "a".repeat(100);

      const result = calculateStorageUsage();

      expect(result.usedBytes).toBe(100);
    });

    it("sums bytes across all SubTracker keys", () => {
      const store = (
        localStorage as unknown as { _store: Record<string, string> }
      )._store;
      store["subtracker-subscriptions"] = "a".repeat(100); // 100 bytes
      store["subtracker-settings"] = "b".repeat(100); // 100 bytes
      store["subtracker-cards-dev"] = "c".repeat(100); // 100 bytes

      const result = calculateStorageUsage();

      expect(result.usedBytes).toBe(300);
    });

    it("ignores non-SubTracker keys", () => {
      const store = (
        localStorage as unknown as { _store: Record<string, string> }
      )._store;
      store["subtracker-subscriptions"] = "a".repeat(100);
      store["some-other-key"] = "x".repeat(1000);

      const result = calculateStorageUsage();

      expect(result.usedBytes).toBe(100); // Only SubTracker key
    });

    it("uses BACKUP_SIZE_THRESHOLD as limit", () => {
      const result = calculateStorageUsage();

      expect(result.limitBytes).toBe(BACKUP_SIZE_THRESHOLD);
      expect(result.limitBytes).toBe(5 * 1024 * 1024); // 5MB
    });

    it("calculates percentage correctly", () => {
      // 5% of 5MB = 262144 bytes
      const store = (
        localStorage as unknown as { _store: Record<string, string> }
      )._store;
      const targetBytes = Math.floor(BACKUP_SIZE_THRESHOLD * 0.05);
      store["subtracker-subscriptions"] = "a".repeat(targetBytes);

      const result = calculateStorageUsage();

      expect(result.usagePercentage).toBeCloseTo(5, 1);
    });

    it("sets isWarning true when usage > 80%", () => {
      // 85% of 5MB
      const store = (
        localStorage as unknown as { _store: Record<string, string> }
      )._store;
      const targetBytes = Math.floor(BACKUP_SIZE_THRESHOLD * 0.85);
      store["subtracker-subscriptions"] = "a".repeat(targetBytes);

      const result = calculateStorageUsage();

      expect(result.isWarning).toBe(true);
      expect(result.usagePercentage).toBeGreaterThan(80);
    });

    it("sets isWarning false when usage <= 80%", () => {
      // 70% of 5MB
      const store = (
        localStorage as unknown as { _store: Record<string, string> }
      )._store;
      const targetBytes = Math.floor(BACKUP_SIZE_THRESHOLD * 0.7);
      store["subtracker-subscriptions"] = "a".repeat(targetBytes);

      const result = calculateStorageUsage();

      expect(result.isWarning).toBe(false);
      expect(result.usagePercentage).toBeLessThanOrEqual(80);
    });

    it("handles localStorage access errors gracefully", () => {
      Object.defineProperty(globalThis, "localStorage", {
        value: {
          getItem: () => {
            throw new Error("Access denied");
          },
        },
        writable: true,
        configurable: true,
      });

      const result = calculateStorageUsage();

      expect(result.usedBytes).toBe(0);
      expect(result.isWarning).toBe(false);
    });
  });

  describe("formatBytes", () => {
    it("formats 0 bytes", () => {
      expect(formatBytes(0)).toBe("0 B");
    });

    it("formats bytes under 1KB", () => {
      expect(formatBytes(500)).toBe("500 B");
      expect(formatBytes(1023)).toBe("1023 B");
    });

    it("formats KB values", () => {
      expect(formatBytes(1024)).toBe("1.0 KB");
      expect(formatBytes(1024 * 512)).toBe("512.0 KB");
      expect(formatBytes(1024 * 1023)).toBe("1023.0 KB");
    });

    it("formats MB values", () => {
      expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
      expect(formatBytes(1024 * 1024 * 5)).toBe("5.00 MB");
      expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.50 MB");
    });
  });

  describe("isPWAMode", () => {
    let matchMediaMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      matchMediaMock = vi.fn();
      vi.stubGlobal("matchMedia", matchMediaMock);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("returns false when not in standalone mode", () => {
      matchMediaMock.mockReturnValue({ matches: false });

      expect(isPWAMode()).toBe(false);
    });

    it("returns true when in standalone mode", () => {
      matchMediaMock.mockReturnValue({ matches: true });

      expect(isPWAMode()).toBe(true);
    });

    it("checks for iOS standalone property", () => {
      // Simulate iOS Safari standalone
      Object.defineProperty(window.navigator, "standalone", {
        value: true,
        configurable: true,
      });

      expect(isPWAMode()).toBe(true);

      // Cleanup
      Object.defineProperty(window.navigator, "standalone", {
        value: undefined,
        configurable: true,
      });
    });
  });

  describe("SUBTRACKER_STORAGE_KEYS", () => {
    it("includes all required prod and dev keys", () => {
      expect(SUBTRACKER_STORAGE_KEYS).toContain("subtracker-subscriptions");
      expect(SUBTRACKER_STORAGE_KEYS).toContain("subtracker-subscriptions-dev");
      expect(SUBTRACKER_STORAGE_KEYS).toContain("subtracker-settings");
      expect(SUBTRACKER_STORAGE_KEYS).toContain("subtracker-settings-dev");
      expect(SUBTRACKER_STORAGE_KEYS).toContain("subtracker-cards");
      expect(SUBTRACKER_STORAGE_KEYS).toContain("subtracker-cards-dev");
    });

    it("has exactly 6 keys", () => {
      expect(SUBTRACKER_STORAGE_KEYS.length).toBe(6);
    });
  });
});
