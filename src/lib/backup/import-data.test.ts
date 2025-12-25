/**
 * Import Data Tests
 *
 * Story 8.6: Unit tests for import validation
 * Task 5.1: Schema validation and whitelisting
 * Task 5.2: Integration tests for validation flow
 */

import { describe, it, expect } from "vitest";
import { getCurrentStoreVersions } from "./import-data";
import { CURRENT_STORE_VERSIONS, BACKUP_FORMAT_VERSION } from "@/types/backup";

// Note: parseAndValidateBackup tests are in data-settings.test.tsx as integration tests
// because File API mocking in unit tests is unreliable in jsdom

describe("getCurrentStoreVersions", () => {
  it("should return current store versions", () => {
    const versions = getCurrentStoreVersions();

    expect(versions.subscriptions).toBe(CURRENT_STORE_VERSIONS.subscriptions);
    expect(versions.settings).toBe(CURRENT_STORE_VERSIONS.settings);
  });

  it("should return a copy, not the original object", () => {
    const versions = getCurrentStoreVersions();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (versions as any).subscriptions = 999;

    expect(CURRENT_STORE_VERSIONS.subscriptions).toBe(2);
  });

  it("should have subscription version 2", () => {
    const versions = getCurrentStoreVersions();
    expect(versions.subscriptions).toBe(2);
  });

  it("should have settings version 4", () => {
    const versions = getCurrentStoreVersions();
    expect(versions.settings).toBe(4);
  });
});

describe("BACKUP_FORMAT_VERSION", () => {
  it("should be 1.0", () => {
    expect(BACKUP_FORMAT_VERSION).toBe("1.0");
  });
});
