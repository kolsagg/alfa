import { describe, it, expect } from "vitest";
import { categories, CATEGORY_METADATA } from "./categories";

describe("categories", () => {
  describe("get", () => {
    it("should return correct metadata for each category", () => {
      const result = categories.get("entertainment");
      expect(result.label).toBe("Eğlence");
      expect(result.id).toBe("entertainment");
      expect(result.icon).toBeDefined();
      expect(result.color).toContain("var(--color-");
      expect(result.colorClass).toBeDefined();
    });

    it("should return productivity metadata correctly", () => {
      const result = categories.get("productivity");
      expect(result.label).toBe("İş");
      expect(result.id).toBe("productivity");
    });

    it("should return tools metadata correctly", () => {
      const result = categories.get("tools");
      expect(result.label).toBe("Araçlar");
    });

    it("should return education metadata correctly", () => {
      const result = categories.get("education");
      expect(result.label).toBe("Eğitim");
    });

    it("should return health metadata correctly", () => {
      const result = categories.get("health");
      expect(result.label).toBe("Sağlık");
    });

    it("should return other metadata correctly", () => {
      const result = categories.get("other");
      expect(result.label).toBe("Diğer");
    });

    it("should fallback to other for unknown ID", () => {
      const result = categories.get("invalid");
      expect(result.id).toBe("other");
      expect(result.label).toBe("Diğer");
    });

    it("should fallback to other for undefined", () => {
      const result = categories.get(undefined);
      expect(result.id).toBe("other");
      expect(result.label).toBe("Diğer");
    });
  });

  describe("all", () => {
    it("should return all 6 categories", () => {
      expect(categories.all()).toHaveLength(6);
    });

    it("should contain all category IDs", () => {
      const all = categories.all();
      const ids = all.map((c) => c.id);
      expect(ids).toContain("entertainment");
      expect(ids).toContain("productivity");
      expect(ids).toContain("tools");
      expect(ids).toContain("education");
      expect(ids).toContain("health");
      expect(ids).toContain("other");
    });
  });

  describe("options", () => {
    it("should return value/label/icon for Select component", () => {
      const options = categories.options();
      expect(options[0]).toHaveProperty("value");
      expect(options[0]).toHaveProperty("label");
      expect(options[0]).toHaveProperty("icon");
    });

    it("should return 6 options", () => {
      expect(categories.options()).toHaveLength(6);
    });
  });

  describe("isValid", () => {
    it("should return true for valid category ID", () => {
      expect(categories.isValid("entertainment")).toBe(true);
      expect(categories.isValid("other")).toBe(true);
    });

    it("should return false for invalid category ID", () => {
      expect(categories.isValid("invalid")).toBe(false);
      expect(categories.isValid("")).toBe(false);
    });
  });

  describe("CATEGORY_METADATA", () => {
    it("should have all required categories", () => {
      expect(Object.keys(CATEGORY_METADATA)).toHaveLength(6);
    });

    it("should have consistent structure for all categories", () => {
      Object.values(CATEGORY_METADATA).forEach((meta) => {
        expect(meta).toHaveProperty("id");
        expect(meta).toHaveProperty("label");
        expect(meta).toHaveProperty("icon");
        expect(meta).toHaveProperty("color");
        expect(meta).toHaveProperty("colorClass");
      });
    });
  });
});
