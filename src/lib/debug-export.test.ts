/**
 * Debug Export Service Tests
 *
 * Story 7.3: Debug Log Export (Developer Mode)
 * Task 3.5: Unit tests for export generation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateDebugExport,
  calculateChecksum,
  getExportSize,
  scrubErrorMessage,
  canLogError,
  resetErrorCooldown,
} from "./debug-export";
import { DebugExportSchema } from "@/types/debug-export";
import { logger } from "@/lib/event-logger";

// Mock the event logger
vi.mock("@/lib/event-logger", () => ({
  logger: {
    getEventLogs: vi.fn(),
    getSessionId: vi.fn(),
  },
}));

describe("generateDebugExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const sessionId = crypto.randomUUID();
    vi.mocked(logger.getSessionId).mockReturnValue(sessionId);
    vi.mocked(logger.getEventLogs).mockReturnValue([]);
  });

  it("should generate valid debug export with empty logs", () => {
    const result = generateDebugExport();

    expect(result.export_type).toBe("debug_logs");
    expect(result.app_version).toBeDefined();
    expect(result.schema_version).toBeDefined();
    expect(result.browser_info).toBeDefined();
    expect(result.session_summary).toBeDefined();
    expect(result.event_logs).toEqual([]);
  });

  it("should pass schema validation", () => {
    const result = generateDebugExport();
    const validation = DebugExportSchema.safeParse(result);
    expect(validation.success).toBe(true);
  });

  it("should include event logs from logger", () => {
    const sessionId = crypto.randomUUID();
    const mockLogs = [
      {
        type: "app_opened" as const,
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        app_metadata: {
          version: "1.0.0",
          schema_version: 1,
        },
      },
    ];

    vi.mocked(logger.getEventLogs).mockReturnValue(mockLogs);
    vi.mocked(logger.getSessionId).mockReturnValue(sessionId);

    const result = generateDebugExport();

    expect(result.event_logs).toEqual(mockLogs);
    expect(result.session_summary.logs_count).toBe(1);
  });

  it("should set correct first and last log timestamps", () => {
    const sessionId = crypto.randomUUID();
    const oldTimestamp = new Date(Date.now() - 60000).toISOString();
    const newTimestamp = new Date().toISOString();

    const mockLogs = [
      {
        type: "theme_changed" as const,
        timestamp: newTimestamp, // newest first (sorted by logger)
        session_id: sessionId,
        app_metadata: { version: "1.0.0", schema_version: 1 },
      },
      {
        type: "app_opened" as const,
        timestamp: oldTimestamp, // oldest last
        session_id: sessionId,
        app_metadata: { version: "1.0.0", schema_version: 1 },
      },
    ];

    vi.mocked(logger.getEventLogs).mockReturnValue(mockLogs);
    vi.mocked(logger.getSessionId).mockReturnValue(sessionId);

    const result = generateDebugExport();

    expect(result.session_summary.first_log_timestamp).toBe(oldTimestamp);
    expect(result.session_summary.last_log_timestamp).toBe(newTimestamp);
  });
});

describe("calculateChecksum", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const sessionId = crypto.randomUUID();
    vi.mocked(logger.getSessionId).mockReturnValue(sessionId);
    vi.mocked(logger.getEventLogs).mockReturnValue([]);
  });

  it("should return a valid SHA-256 hex string", async () => {
    const exportData = generateDebugExport();
    const checksum = await calculateChecksum(exportData);

    expect(checksum).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should produce consistent checksum for same data", async () => {
    // Create a consistent export object
    const exportData = {
      export_timestamp: "2025-12-27T12:00:00.000Z",
      export_type: "debug_logs" as const,
      app_version: "1.0.0",
      schema_version: 1,
      browser_info: {
        userAgent: "Chrome-based Browser",
        platform: "macOS",
        language: "en",
      },
      session_summary: {
        session_id: "a0000000-0000-0000-0000-000000000001",
        logs_count: 0,
      },
      event_logs: [],
    };

    const checksum1 = await calculateChecksum(exportData);
    const checksum2 = await calculateChecksum(exportData);

    expect(checksum1).toBe(checksum2);
  });

  it("should produce different checksum for different data", async () => {
    const exportData1 = generateDebugExport();

    // Wait a moment for different timestamp
    await new Promise((r) => setTimeout(r, 10));

    const exportData2 = generateDebugExport();

    const checksum1 = await calculateChecksum(exportData1);
    const checksum2 = await calculateChecksum(exportData2);

    expect(checksum1).not.toBe(checksum2);
  });
});

describe("getExportSize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const sessionId = crypto.randomUUID();
    vi.mocked(logger.getSessionId).mockReturnValue(sessionId);
    vi.mocked(logger.getEventLogs).mockReturnValue([]);
  });

  it("should return size in bytes", () => {
    const exportData = generateDebugExport();
    const size = getExportSize(exportData);

    expect(size).toBeGreaterThan(0);
  });

  it("should increase with more logs", () => {
    vi.mocked(logger.getEventLogs).mockReturnValue([]);
    const smallExport = generateDebugExport();
    const smallSize = getExportSize(smallExport);

    const sessionId = crypto.randomUUID();
    const mockLogs = Array(50)
      .fill(null)
      .map(() => ({
        type: "app_opened" as const,
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        app_metadata: { version: "1.0.0", schema_version: 1 },
      }));

    vi.mocked(logger.getEventLogs).mockReturnValue(mockLogs);
    const largeExport = generateDebugExport();
    const largeSize = getExportSize(largeExport);

    expect(largeSize).toBeGreaterThan(smallSize);
  });
});

describe("scrubErrorMessage", () => {
  it("should return empty string for empty input", () => {
    expect(scrubErrorMessage("")).toBe("");
  });

  it("should scrub Windows file paths", () => {
    const message = "Error at C:\\Users\\john\\project\\file.ts:42";
    const scrubbed = scrubErrorMessage(message);
    expect(scrubbed).not.toContain("Users");
    expect(scrubbed).not.toContain("john");
    expect(scrubbed).toContain("[REDACTED_PATH]");
  });

  it("should scrub Unix file paths", () => {
    const message = "Error at /Users/john/dev/project/file.ts:42";
    const scrubbed = scrubErrorMessage(message);
    expect(scrubbed).not.toContain("john");
    expect(scrubbed).toContain("[REDACTED_PATH]");
  });

  it("should scrub email addresses", () => {
    const message = "User john.doe@example.com not found";
    const scrubbed = scrubErrorMessage(message);
    expect(scrubbed).not.toContain("john.doe@example.com");
    expect(scrubbed).toContain("[REDACTED_EMAIL]");
  });

  it("should scrub UUIDs", () => {
    const uuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    const message = `Failed to load subscription ${uuid}`;
    const scrubbed = scrubErrorMessage(message);
    expect(scrubbed).not.toContain(uuid);
    expect(scrubbed).toContain("[REDACTED_UUID]");
  });

  it("should scrub URLs with user IDs in path", () => {
    const message =
      "Failed to fetch https://api.example.com/users/12345678/data";
    const scrubbed = scrubErrorMessage(message);
    expect(scrubbed).toContain("[REDACTED_PATH]");
  });

  it("should preserve regular error messages", () => {
    const message = "Cannot read property 'length' of undefined";
    const scrubbed = scrubErrorMessage(message);
    expect(scrubbed).toBe(message);
  });
});

describe("error logging cooldown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetErrorCooldown();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow first error log", () => {
    expect(canLogError()).toBe(true);
  });

  it("should block second error log within cooldown", () => {
    canLogError(); // First call
    expect(canLogError()).toBe(false);
  });

  it("should allow error log after cooldown period", () => {
    canLogError(); // First call

    // Advance time by 10 seconds
    vi.advanceTimersByTime(10000);

    expect(canLogError()).toBe(true);
  });

  it("should block error log before cooldown expires", () => {
    canLogError(); // First call

    // Advance time by 9 seconds (just under cooldown)
    vi.advanceTimersByTime(9999);

    expect(canLogError()).toBe(false);
  });
});
