/**
 * Import Guard Tests
 *
 * Story 7.2: Privacy-First Data Handling
 * AC4: JSON Import Privacy Guard
 */
import { describe, it, expect } from "vitest";
import {
  isDangerousString,
  isExternalUrl,
  sanitizeStringValue,
  sanitizeObject,
  guardImportData,
  isDataSafe,
  getGuardSummary,
} from "./import-guard";

describe("Import Guard - Story 7.2 AC4", () => {
  describe("isDangerousString", () => {
    it("should detect javascript: protocol", () => {
      expect(isDangerousString("javascript:alert(1)")).toBe(true);
      expect(isDangerousString("JAVASCRIPT:void(0)")).toBe(true);
    });

    it("should detect script tags", () => {
      expect(isDangerousString("<script>alert(1)</script>")).toBe(true);
      expect(isDangerousString("<SCRIPT src='evil.js'>")).toBe(true);
    });

    it("should detect inline event handlers", () => {
      expect(isDangerousString("onclick=alert(1)")).toBe(true);
      expect(isDangerousString("onerror = doEvil()")).toBe(true);
    });

    it("should detect eval patterns", () => {
      expect(isDangerousString("eval(code)")).toBe(true);
      expect(isDangerousString("Function('return this')")).toBe(true);
    });

    it("should detect known tracking domains", () => {
      expect(isDangerousString("https://google-analytics.com/collect")).toBe(
        true
      );
      expect(isDangerousString("https://api.mixpanel.com/track")).toBe(true);
      expect(isDangerousString("https://segment.io/v1/track")).toBe(true);
    });

    it("should allow safe strings", () => {
      expect(isDangerousString("Netflix")).toBe(false);
      expect(isDangerousString("Monthly subscription")).toBe(false);
      expect(isDangerousString("entertainment")).toBe(false);
    });
  });

  describe("isExternalUrl", () => {
    it("should detect external URLs", () => {
      expect(isExternalUrl("https://example.com/data")).toBe(true);
      expect(isExternalUrl("http://api.evil.com")).toBe(true);
    });

    it("should allow font domains", () => {
      expect(isExternalUrl("https://fonts.googleapis.com/css")).toBe(false);
      expect(isExternalUrl("https://fonts.gstatic.com/font.woff")).toBe(false);
    });

    it("should not flag non-URL strings", () => {
      expect(isExternalUrl("Netflix")).toBe(false);
      expect(isExternalUrl("just some text")).toBe(false);
    });
  });

  describe("sanitizeStringValue", () => {
    it("should pass through safe values", () => {
      const result = sanitizeStringValue("Netflix", "name");
      expect(result.value).toBe("Netflix");
      expect(result.warning).toBeUndefined();
    });

    it("should block dangerous values", () => {
      const result = sanitizeStringValue("javascript:alert(1)", "note");
      expect(result.value).toBeUndefined();
      expect(result.warning).toBeDefined();
      expect(result.warning?.severity).toBe("high");
    });

    it("should warn about external URLs in non-URL fields", () => {
      const result = sanitizeStringValue("https://example.com", "note");
      expect(result.value).toBe("https://example.com"); // Allowed but warned
      expect(result.warning).toBeDefined();
      expect(result.warning?.severity).toBe("medium");
    });

    it("should allow URLs in URL-like fields", () => {
      const result = sanitizeStringValue(
        "https://example.com/icon.png",
        "iconUrl"
      );
      expect(result.value).toBe("https://example.com/icon.png");
      expect(result.warning).toBeUndefined();
    });
  });

  describe("sanitizeObject", () => {
    it("should sanitize nested objects", () => {
      const input = {
        name: "Test",
        note: "javascript:alert(1)",
        nested: {
          value: "safe",
        },
      };

      const result = sanitizeObject(input);
      expect(result.data.name).toBe("Test");
      expect(result.data.note).toBe(""); // Blocked, becomes empty
      expect(result.data.nested.value).toBe("safe");
      expect(result.blockedFields).toContain("note");
    });

    it("should sanitize arrays", () => {
      const input = {
        items: ["safe", "<script>bad</script>", "also safe"],
      };

      const result = sanitizeObject(input);
      expect(result.data.items[0]).toBe("safe");
      expect(result.data.items[1]).toBe(""); // Blocked
      expect(result.data.items[2]).toBe("also safe");
      expect(result.blockedFields.length).toBe(1);
    });

    it("should handle null and undefined", () => {
      const input = {
        name: "Test",
        empty: null,
        missing: undefined,
      };

      const result = sanitizeObject(input);
      expect(result.data.name).toBe("Test");
      expect(result.data.empty).toBeNull();
      expect(result.data.missing).toBeUndefined();
    });

    it("should pass through numbers and booleans", () => {
      const input = {
        price: 9.99,
        active: true,
        count: 0,
      };

      const result = sanitizeObject(input);
      expect(result.data.price).toBe(9.99);
      expect(result.data.active).toBe(true);
      expect(result.data.count).toBe(0);
    });
  });

  describe("guardImportData", () => {
    it("should return safe=true for clean data", () => {
      const data = {
        name: "Test Subscription",
        price: 9.99,
        category: "entertainment",
      };

      const result = guardImportData(data);
      expect(result.safe).toBe(true);
      expect(result.sanitized).toBe(false);
      expect(result.warnings).toHaveLength(0);
      expect(result.blockedFields).toHaveLength(0);
    });

    it("should return safe=false when dangerous content blocked", () => {
      const data = {
        name: "Test",
        malicious: "javascript:document.cookie",
      };

      const result = guardImportData(data);
      expect(result.safe).toBe(false);
      expect(result.blockedFields.length).toBeGreaterThan(0);
    });

    it("should sanitize and return warnings for suspicious content", () => {
      const data = {
        name: "Test",
        note: "https://some-external-site.com/page",
      };

      const result = guardImportData(data);
      expect(result.safe).toBe(true); // External URLs warn but don't block
      expect(result.sanitized).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("isDataSafe", () => {
    it("should return true for safe data", () => {
      expect(isDataSafe({ name: "Test", value: 123 })).toBe(true);
    });

    it("should return false for dangerous data", () => {
      expect(isDataSafe({ script: "<script>evil()</script>" })).toBe(false);
    });
  });

  describe("getGuardSummary", () => {
    it("should return success for safe data", () => {
      const result = {
        safe: true,
        sanitized: false,
        warnings: [],
        blockedFields: [],
      };

      const summary = getGuardSummary(result);
      expect(summary).toContain("✅");
    });

    it("should return warning for sanitized data", () => {
      const result = {
        safe: true,
        sanitized: true,
        warnings: [{ field: "test", reason: "test", severity: "low" as const }],
        blockedFields: [],
      };

      const summary = getGuardSummary(result);
      expect(summary).toContain("⚠️");
    });

    it("should return error for blocked data", () => {
      const result = {
        safe: false,
        sanitized: true,
        warnings: [],
        blockedFields: ["malicious"],
      };

      const summary = getGuardSummary(result);
      expect(summary).toContain("❌");
    });
  });
});
