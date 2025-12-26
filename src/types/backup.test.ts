/**
 * Backup Schema & Types Tests
 *
 * Story 8.6: Unit tests for schema validation and whitelisting
 * Task 5.1: Validates schema rules and version compatibility
 */

import { describe, it, expect } from "vitest";
import {
  BackupSchema,
  BACKUP_FORMAT_VERSION,
  CURRENT_STORE_VERSIONS,
  SETTINGS_IMPORT_WHITELIST,
  SETTINGS_IMPORT_BLACKLIST,
  isBackupVersionCompatible,
  ImportableSettingsSchema,
} from "@/types/backup";

describe("BackupSchema", () => {
  const validSubscription = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Netflix",
    amount: 49.99,
    currency: "TRY",
    billingCycle: "monthly",
    nextPaymentDate: "2025-01-15T00:00:00.000Z",
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };

  const validBackup = {
    version: BACKUP_FORMAT_VERSION,
    storeVersions: { subscriptions: 2, settings: 4 },
    exportDate: "2025-01-01T10:00:00.000Z",
    subscriptions: [validSubscription],
    settings: {
      theme: "dark",
      notificationsEnabled: true,
      notificationDaysBefore: 3,
      notificationTime: "09:00",
    },
  };

  describe("valid backup parsing", () => {
    it("should parse a valid backup object", () => {
      const result = BackupSchema.safeParse(validBackup);
      expect(result.success).toBe(true);
    });

    it("should accept backup without optional settings", () => {
      const backupWithoutSettings = {
        version: BACKUP_FORMAT_VERSION,
        storeVersions: { subscriptions: 2, settings: 4 },
        exportDate: "2025-01-01T10:00:00.000Z",
        subscriptions: [validSubscription],
      };

      const result = BackupSchema.safeParse(backupWithoutSettings);
      expect(result.success).toBe(true);
    });

    it("should accept partial settings", () => {
      const backupWithPartialSettings = {
        ...validBackup,
        settings: { theme: "light" },
      };

      const result = BackupSchema.safeParse(backupWithPartialSettings);
      expect(result.success).toBe(true);
    });
  });

  describe("AC4: 0-subscription rejection", () => {
    it("should reject backup with empty subscriptions array", () => {
      const emptyBackup = {
        ...validBackup,
        subscriptions: [],
      };

      const result = BackupSchema.safeParse(emptyBackup);
      expect(result.success).toBe(false);

      if (!result.success) {
        const subscriptionError = result.error.issues.find((issue) =>
          issue.path.includes("subscriptions")
        );
        expect(subscriptionError).toBeDefined();
      }
    });
  });

  describe("version field validation", () => {
    it("should accept any version string", () => {
      const backupWithOldVersion = {
        ...validBackup,
        version: "0.9",
      };

      const result = BackupSchema.safeParse(backupWithOldVersion);
      expect(result.success).toBe(true);
    });

    it("should reject missing version", () => {
      const backupWithoutVersion = { ...validBackup };
      delete (backupWithoutVersion as Record<string, unknown>).version;

      const result = BackupSchema.safeParse(backupWithoutVersion);
      expect(result.success).toBe(false);
    });
  });

  describe("storeVersions validation", () => {
    it("should accept valid store versions", () => {
      const result = BackupSchema.safeParse(validBackup);
      expect(result.success).toBe(true);
    });

    it("should reject negative store versions", () => {
      const backupWithNegativeVersion = {
        ...validBackup,
        storeVersions: { subscriptions: -1, settings: 4 },
      };

      const result = BackupSchema.safeParse(backupWithNegativeVersion);
      expect(result.success).toBe(false);
    });
  });

  describe("exportDate validation", () => {
    it("should accept valid ISO datetime", () => {
      const result = BackupSchema.safeParse(validBackup);
      expect(result.success).toBe(true);
    });

    it("should reject invalid date format", () => {
      const backupWithBadDate = {
        ...validBackup,
        exportDate: "2025-01-01",
      };

      const result = BackupSchema.safeParse(backupWithBadDate);
      expect(result.success).toBe(false);
    });
  });
});

describe("ImportableSettingsSchema", () => {
  it("should accept all whitelisted settings", () => {
    const settings = {
      theme: "system",
      notificationsEnabled: true,
      notificationDaysBefore: 5,
      notificationTime: "18:30",
    };

    const result = ImportableSettingsSchema.safeParse(settings);
    expect(result.success).toBe(true);
  });

  it("should accept partial whitelisted settings", () => {
    const partialSettings = {
      theme: "dark",
    };

    const result = ImportableSettingsSchema.safeParse(partialSettings);
    expect(result.success).toBe(true);
  });

  it("should accept empty object", () => {
    const result = ImportableSettingsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should reject invalid theme value", () => {
    const invalidSettings = {
      theme: "invalid-theme",
    };

    const result = ImportableSettingsSchema.safeParse(invalidSettings);
    expect(result.success).toBe(false);
  });

  it("should reject invalid notification time format", () => {
    const invalidSettings = {
      notificationTime: "25:00",
    };

    const result = ImportableSettingsSchema.safeParse(invalidSettings);
    expect(result.success).toBe(false);
  });

  it("should reject notificationDaysBefore outside range", () => {
    const tooSmall = { notificationDaysBefore: 0 };
    const tooLarge = { notificationDaysBefore: 31 };

    expect(ImportableSettingsSchema.safeParse(tooSmall).success).toBe(false);
    expect(ImportableSettingsSchema.safeParse(tooLarge).success).toBe(false);
  });
});

describe("isBackupVersionCompatible", () => {
  it("should return true for matching versions", () => {
    expect(isBackupVersionCompatible(CURRENT_STORE_VERSIONS)).toBe(true);
  });

  it("should return true for older backup versions", () => {
    const olderVersions = { subscriptions: 1, settings: 3 };
    expect(isBackupVersionCompatible(olderVersions)).toBe(true);
  });

  it("should return false for newer subscription version", () => {
    const newerSubscriptions = {
      subscriptions: CURRENT_STORE_VERSIONS.subscriptions + 1,
      settings: CURRENT_STORE_VERSIONS.settings,
    };
    expect(isBackupVersionCompatible(newerSubscriptions)).toBe(false);
  });

  it("should return false for newer settings version", () => {
    const newerSettings = {
      subscriptions: CURRENT_STORE_VERSIONS.subscriptions,
      settings: CURRENT_STORE_VERSIONS.settings + 1,
    };
    expect(isBackupVersionCompatible(newerSettings)).toBe(false);
  });
});

describe("AC3: Settings Whitelisting", () => {
  it("should have correct whitelisted fields", () => {
    expect(SETTINGS_IMPORT_WHITELIST).toContain("theme");
    expect(SETTINGS_IMPORT_WHITELIST).toContain("notificationsEnabled");
    expect(SETTINGS_IMPORT_WHITELIST).toContain("notificationDaysBefore");
    expect(SETTINGS_IMPORT_WHITELIST).toContain("notificationTime");
  });

  it("should have correct blacklisted fields (device-specific)", () => {
    expect(SETTINGS_IMPORT_BLACKLIST).toContain("notificationPermission");
    expect(SETTINGS_IMPORT_BLACKLIST).toContain(
      "notificationPermissionDeniedAt"
    );
    expect(SETTINGS_IMPORT_BLACKLIST).toContain("onboardingCompleted");
    expect(SETTINGS_IMPORT_BLACKLIST).toContain("lastIOSPromptDismissed");
  });

  it("whitelist and blacklist should not overlap", () => {
    const blacklistSet = new Set<string>(SETTINGS_IMPORT_BLACKLIST);

    for (const field of SETTINGS_IMPORT_WHITELIST) {
      expect(blacklistSet.has(field)).toBe(false);
    }
  });
});

describe("Constants", () => {
  it("should export expected backup format version", () => {
    expect(BACKUP_FORMAT_VERSION).toBe("1.1");
  });

  it("should export expected store versions", () => {
    expect(CURRENT_STORE_VERSIONS.subscriptions).toBe(2);
    expect(CURRENT_STORE_VERSIONS.settings).toBe(6);
  });
});
