/**
 * Debug Export Types Tests
 *
 * Story 7.3: Debug Log Export (Developer Mode)
 * Task 1.3: Unit tests for schema validation
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  BrowserInfoSchema,
  SessionSummarySchema,
  DebugExportSchema,
  getSanitizedBrowserInfo,
  estimateExportSize,
  formatBytes,
  type DebugExport,
} from "./debug-export";

// Helper to generate UUIDs
const generateUUID = () => crypto.randomUUID();

describe("BrowserInfoSchema", () => {
  it("should validate correct browser info", () => {
    const validBrowserInfo = {
      userAgent: "Chrome-based Browser",
      platform: "macOS",
      language: "en",
    };

    const result = BrowserInfoSchema.safeParse(validBrowserInfo);
    expect(result.success).toBe(true);
  });

  it("should reject missing fields", () => {
    const invalidBrowserInfo = {
      userAgent: "Chrome-based Browser",
      // Missing platform and language
    };

    const result = BrowserInfoSchema.safeParse(invalidBrowserInfo);
    expect(result.success).toBe(false);
  });

  it("should reject non-string fields", () => {
    const invalidBrowserInfo = {
      userAgent: 123,
      platform: "macOS",
      language: "en",
    };

    const result = BrowserInfoSchema.safeParse(invalidBrowserInfo);
    expect(result.success).toBe(false);
  });
});

describe("SessionSummarySchema", () => {
  it("should validate correct session summary", () => {
    const validSessionSummary = {
      session_id: generateUUID(),
      logs_count: 10,
      first_log_timestamp: new Date().toISOString(),
      last_log_timestamp: new Date().toISOString(),
    };

    const result = SessionSummarySchema.safeParse(validSessionSummary);
    expect(result.success).toBe(true);
  });

  it("should validate session summary without timestamps", () => {
    const validSessionSummary = {
      session_id: generateUUID(),
      logs_count: 0,
    };

    const result = SessionSummarySchema.safeParse(validSessionSummary);
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID", () => {
    const invalidSessionSummary = {
      session_id: "not-a-uuid",
      logs_count: 0,
    };

    const result = SessionSummarySchema.safeParse(invalidSessionSummary);
    expect(result.success).toBe(false);
  });

  it("should reject negative logs_count", () => {
    const invalidSessionSummary = {
      session_id: generateUUID(),
      logs_count: -1,
    };

    const result = SessionSummarySchema.safeParse(invalidSessionSummary);
    expect(result.success).toBe(false);
  });
});

describe("DebugExportSchema", () => {
  const createValidDebugExport = (): DebugExport => ({
    export_timestamp: new Date().toISOString(),
    export_type: "debug_logs",
    app_version: "1.0.0",
    schema_version: 1,
    browser_info: {
      userAgent: "Chrome-based Browser",
      platform: "macOS",
      language: "en",
    },
    session_summary: {
      session_id: generateUUID(),
      logs_count: 0,
    },
    event_logs: [],
  });

  it("should validate correct debug export", () => {
    const validExport = createValidDebugExport();
    const result = DebugExportSchema.safeParse(validExport);
    expect(result.success).toBe(true);
  });

  it("should validate export with event logs", () => {
    const sessionId = generateUUID();
    const validExport = {
      ...createValidDebugExport(),
      session_summary: {
        session_id: sessionId,
        logs_count: 1,
        first_log_timestamp: new Date().toISOString(),
        last_log_timestamp: new Date().toISOString(),
      },
      event_logs: [
        {
          type: "app_opened",
          timestamp: new Date().toISOString(),
          session_id: sessionId,
          app_metadata: {
            version: "1.0.0",
            schema_version: 1,
          },
        },
      ],
    };

    const result = DebugExportSchema.safeParse(validExport);
    expect(result.success).toBe(true);
  });

  it("should reject invalid export_type", () => {
    const invalidExport = {
      ...createValidDebugExport(),
      export_type: "wrong_type",
    };

    const result = DebugExportSchema.safeParse(invalidExport);
    expect(result.success).toBe(false);
  });

  it("should reject invalid schema_version", () => {
    const invalidExport = {
      ...createValidDebugExport(),
      schema_version: 0,
    };

    const result = DebugExportSchema.safeParse(invalidExport);
    expect(result.success).toBe(false);
  });

  it("should reject invalid event log entry", () => {
    const invalidExport = {
      ...createValidDebugExport(),
      event_logs: [
        {
          type: "invalid_type", // Invalid event type
          timestamp: new Date().toISOString(),
          session_id: generateUUID(),
          app_metadata: {
            version: "1.0.0",
            schema_version: 1,
          },
        },
      ],
    };

    const result = DebugExportSchema.safeParse(invalidExport);
    expect(result.success).toBe(false);
  });
});

describe("getSanitizedBrowserInfo", () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    // Reset navigator mock before each test
    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent: "",
        platform: "",
        language: "en-US",
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("should detect Chrome-based browser", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0",
        platform: "MacIntel",
        language: "en-US",
      },
      writable: true,
      configurable: true,
    });

    const result = getSanitizedBrowserInfo();
    expect(result.userAgent).toBe("Chrome-based Browser");
    expect(result.platform).toBe("macOS");
    expect(result.language).toBe("en");
  });

  it("should detect Firefox", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Firefox/121.0",
        platform: "Win64",
        language: "tr-TR",
      },
      writable: true,
      configurable: true,
    });

    const result = getSanitizedBrowserInfo();
    expect(result.userAgent).toBe("Firefox");
    expect(result.platform).toBe("Windows");
    expect(result.language).toBe("tr");
  });

  it("should detect Safari", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
        platform: "MacIntel",
        language: "en",
      },
      writable: true,
      configurable: true,
    });

    const result = getSanitizedBrowserInfo();
    expect(result.userAgent).toBe("Safari");
  });

  it("should detect iOS platform", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1",
        platform: "",
        language: "en",
      },
      writable: true,
      configurable: true,
    });

    const result = getSanitizedBrowserInfo();
    expect(result.platform).toBe("iOS");
  });

  it("should detect Android platform", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent:
          "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile",
        platform: "Linux armv8l",
        language: "en",
      },
      writable: true,
      configurable: true,
    });

    const result = getSanitizedBrowserInfo();
    expect(result.platform).toBe("Android");
  });

  it("should handle unknown browser", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent: "Some Unknown Browser",
        platform: "Unknown",
        language: "de",
      },
      writable: true,
      configurable: true,
    });

    const result = getSanitizedBrowserInfo();
    expect(result.userAgent).toBe("Unknown Browser");
    expect(result.platform).toBe("Unknown Platform");
    expect(result.language).toBe("de");
  });
});

describe("estimateExportSize", () => {
  it("should return byte size of export", () => {
    const exportData: DebugExport = {
      export_timestamp: new Date().toISOString(),
      export_type: "debug_logs",
      app_version: "1.0.0",
      schema_version: 1,
      browser_info: {
        userAgent: "Chrome-based Browser",
        platform: "macOS",
        language: "en",
      },
      session_summary: {
        session_id: generateUUID(),
        logs_count: 0,
      },
      event_logs: [],
    };

    const size = estimateExportSize(exportData);
    expect(size).toBeGreaterThan(0);
    // Empty export should be relatively small
    expect(size).toBeLessThan(500);
  });

  it("should increase size with more logs", () => {
    const sessionId = generateUUID();
    const smallExport: DebugExport = {
      export_timestamp: new Date().toISOString(),
      export_type: "debug_logs",
      app_version: "1.0.0",
      schema_version: 1,
      browser_info: {
        userAgent: "Chrome-based Browser",
        platform: "macOS",
        language: "en",
      },
      session_summary: {
        session_id: sessionId,
        logs_count: 0,
      },
      event_logs: [],
    };

    const largeExport: DebugExport = {
      ...smallExport,
      session_summary: {
        session_id: sessionId,
        logs_count: 10,
      },
      event_logs: Array(10)
        .fill(null)
        .map(() => ({
          type: "app_opened" as const,
          timestamp: new Date().toISOString(),
          session_id: sessionId,
          app_metadata: {
            version: "1.0.0",
            schema_version: 1,
          },
        })),
    };

    const smallSize = estimateExportSize(smallExport);
    const largeSize = estimateExportSize(largeExport);

    expect(largeSize).toBeGreaterThan(smallSize);
  });
});

describe("formatBytes", () => {
  it("should format 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("should format bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("should format kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("should format megabytes", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(1572864)).toBe("1.5 MB");
  });
});
