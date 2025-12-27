/**
 * Event Logger Service
 *
 * Story 7.1: Anonymous Event Logging System
 *
 * Key Features:
 * - Session-based anonymous tracking (AC1)
 * - Automated PII scrubbing (AC2)
 * - FIFO storage with 1000 entry limit (AC4)
 * - Debounced async persistence (AC5)
 * - QuotaExceeded graceful recovery (AC4)
 */
import {
  EventLogStorageSchema,
  APP_VERSION,
  SCHEMA_VERSION,
} from "@/types/event-log";
import type { EventType, EventLogEntry } from "@/types/event-log";
import { generateUUID } from "@/lib/uuid";

// Storage key with environment suffix support
const getStorageKey = (): string => {
  const suffix = import.meta.env.DEV ? "-dev" : "";
  return `subtracker-events-log${suffix}`;
};

// Configuration constants
const MAX_ENTRIES = 1000;
const FLUSH_DEBOUNCE_MS = 1000; // 1 second debounce
const QUOTA_RECOVERY_RATIO = 0.5; // Clear 50% on quota exceeded

/**
 * Metadata Blacklist - Keys that are scrubbed from logs
 * AC2: Automated privacy filter
 */
const METADATA_BLACKLIST = [
  "name",
  "price",
  "amount",
  "title",
  "note",
  "card_digits",
  "card_name",
  "description",
] as const;

/**
 * Scrub sensitive metadata keys
 * AC2: PII scrubbing before persistence
 */
export const scrubMetadata = (
  metadata?: Record<string, unknown>
):
  | Record<string, string | number | boolean | Array<string | number | boolean>>
  | undefined => {
  if (!metadata) return undefined;

  const scrubbed: Record<
    string,
    string | number | boolean | Array<string | number | boolean>
  > = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Skip blacklisted keys
    if (
      METADATA_BLACKLIST.includes(key as (typeof METADATA_BLACKLIST)[number])
    ) {
      // Log presence indicator instead of value
      scrubbed[`has_${key}`] = true;
      continue;
    }

    // Allow primitive types and arrays of primitives
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      scrubbed[key] = value;
    } else if (Array.isArray(value)) {
      // Only keep primitive items in arrays
      const filteredArray = value.filter(
        (item): item is string | number | boolean =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean"
      );
      if (filteredArray.length > 0) {
        scrubbed[key] = filteredArray;
      }
    }
  }

  return Object.keys(scrubbed).length > 0 ? scrubbed : undefined;
};

/**
 * EventLogger Class
 * Singleton pattern for consistent session tracking
 */
class EventLogger {
  private sessionId: string;
  private buffer: EventLogEntry[] = [];
  private flushTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isInitialized = false;
  private isAppOpenedLogged = false;

  constructor() {
    // Generate session ID once per app load
    this.sessionId = generateUUID();
  }

  /**
   * Initialize the logger (lazy initialization)
   * Loads existing logs from storage
   */
  private initialize(): void {
    if (this.isInitialized) return;

    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        const result = EventLogStorageSchema.safeParse(parsed);
        if (result.success) {
          this.buffer = result.data;
          // Security: Enforce FIFO limit on load in case storage was modified externally
          this.enforceFifoLimit();
        } else {
          console.warn("[EventLogger] Invalid stored logs, starting fresh");
          this.buffer = [];
        }
      }
    } catch (error) {
      console.warn("[EventLogger] Failed to load stored logs:", error);
      this.buffer = [];
    }

    this.isInitialized = true;
  }

  /**
   * Log an event with optional metadata
   * AC1, AC2, AC5: Type-safe, privacy-filtered, async logging
   */
  log(eventType: EventType, metadata?: Record<string, unknown>): void {
    this.initialize();

    // Guard app_opened to be logged once per session (even across remounts)
    if (eventType === "app_opened") {
      if (this.isAppOpenedLogged) return;
      this.isAppOpenedLogged = true;
    }

    const entry: EventLogEntry = {
      type: eventType,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      app_metadata: {
        version: APP_VERSION,
        schema_version: SCHEMA_VERSION,
      },
      metadata: scrubMetadata(metadata),
    };

    this.buffer.push(entry);

    // Enforce FIFO limit
    this.enforceFifoLimit();

    // Schedule debounced flush
    this.scheduleFlush();
  }

  /**
   * Enforce FIFO limit - remove oldest entries if exceeding MAX_ENTRIES
   * AC4: Max 1000 entries
   */
  private enforceFifoLimit(): void {
    while (this.buffer.length > MAX_ENTRIES) {
      this.buffer.shift();
    }
  }

  /**
   * Schedule a debounced flush
   * AC5: Non-blocking, debounced persistence
   */
  private scheduleFlush(): void {
    if (this.flushTimeoutId !== null) {
      clearTimeout(this.flushTimeoutId);
    }

    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof requestIdleCallback !== "undefined") {
      this.flushTimeoutId = setTimeout(() => {
        requestIdleCallback(() => this.flush(), { timeout: FLUSH_DEBOUNCE_MS });
        this.flushTimeoutId = null;
      }, FLUSH_DEBOUNCE_MS);
    } else {
      this.flushTimeoutId = setTimeout(() => {
        this.flush();
        this.flushTimeoutId = null;
      }, FLUSH_DEBOUNCE_MS);
    }
  }

  /**
   * Flush buffer to localStorage
   * AC4: Try-catch with QuotaExceeded recovery
   */
  flush(): void {
    try {
      const data = JSON.stringify(this.buffer);
      localStorage.setItem(getStorageKey(), data);
    } catch (error) {
      // AC4: QuotaExceeded handling
      if (
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" ||
          error.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        console.warn(
          "[EventLogger] Storage quota exceeded, clearing 50% oldest logs"
        );
        this.aggressiveClear();
        // Retry once after clearing
        try {
          const data = JSON.stringify(this.buffer);
          localStorage.setItem(getStorageKey(), data);
        } catch (retryError) {
          console.error(
            "[EventLogger] Failed to write logs after quota recovery:",
            retryError
          );
        }
      } else {
        console.error("[EventLogger] Failed to flush logs:", error);
      }
    }
  }

  /**
   * Aggressively clear oldest logs
   * AC4: Clear 50% of logs on quota exceeded
   */
  private aggressiveClear(): void {
    const removeCount = Math.ceil(this.buffer.length * QUOTA_RECOVERY_RATIO);
    this.buffer.splice(0, removeCount);
  }

  /**
   * Get all event logs sorted by timestamp (newest first)
   * AC6: Developer API
   */
  getEventLogs(): EventLogEntry[] {
    this.initialize();
    return [...this.buffer].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Clear all event logs
   * AC6: Developer API
   */
  clearEventLogs(): void {
    this.buffer = [];
    this.isAppOpenedLogged = false; // Reset app_opened guard
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.error("[EventLogger] Failed to clear logs:", error);
    }
    this.isInitialized = true; // Mark as initialized to prevent re-loading
  }

  /**
   * Get current session ID
   * Useful for debugging
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Force immediate flush (for testing or cleanup)
   */
  flushSync(): void {
    if (this.flushTimeoutId !== null) {
      clearTimeout(this.flushTimeoutId);
      this.flushTimeoutId = null;
    }
    this.flush();
  }
}

// Singleton instance
const eventLogger = new EventLogger();

// Export singleton instance methods
export const logger = {
  log: (eventType: EventType, metadata?: Record<string, unknown>) =>
    eventLogger.log(eventType, metadata),
  getEventLogs: () => eventLogger.getEventLogs(),
  clearEventLogs: () => eventLogger.clearEventLogs(),
  getSessionId: () => eventLogger.getSessionId(),
  flushSync: () => eventLogger.flushSync(),
};

// Export for testing
export { EventLogger, getStorageKey, MAX_ENTRIES, METADATA_BLACKLIST };
