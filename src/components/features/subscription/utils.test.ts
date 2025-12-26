import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateNextPaymentDate } from "./utils";
import { startOfDay } from "date-fns";

describe("calculateNextPaymentDate", () => {
  beforeEach(() => {
    // Today is Dec 26, 2025
    vi.setSystemTime(new Date("2025-12-26T10:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return same date if it is today", () => {
    const date = new Date("2025-12-26");
    const result = calculateNextPaymentDate(date, "monthly");
    expect(startOfDay(result)).toEqual(startOfDay(new Date("2025-12-26")));
  });

  it("should return the date in the current month if it is today or in the future of the current month", () => {
    // Today is 26th. If I set it to 26th of previous month, next payment should be today.
    const date = new Date("2025-11-26");
    const result = calculateNextPaymentDate(date, "monthly");
    expect(startOfDay(result)).toEqual(startOfDay(new Date("2025-12-26")));
  });

  it("should return the date in the current month if set to few days ago but same month", () => {
    // Today 26 Dec. Set to 24 Dec. Next payment should be 24 Jan 2026.
    const date = new Date("2025-12-24");
    const result = calculateNextPaymentDate(date, "monthly");
    expect(startOfDay(result)).toEqual(startOfDay(new Date("2026-01-24")));
  });

  it("should return January if December date has passed (User example fix)", () => {
    // Today 26 Dec. User sets 26 Nov.
    // This was failing: 26 Nov -> 26 Dec (<= today is true) -> 26 Jan.
    // Now it should stop at 26 Dec.
    const date = new Date("2025-11-26");
    const result = calculateNextPaymentDate(date, "monthly");
    expect(startOfDay(result)).toEqual(startOfDay(new Date("2025-12-26")));
  });

  it("should return future date directly if provided", () => {
    const date = new Date("2026-01-15");
    const result = calculateNextPaymentDate(date, "monthly");
    expect(startOfDay(result)).toEqual(startOfDay(new Date("2026-01-15")));
  });

  it("should handle yearly cycles correctly", () => {
    // Today 26 Dec 2025. Set to 26 Dec 2024. Next is today.
    const date = new Date("2024-12-26");
    const result = calculateNextPaymentDate(date, "yearly");
    expect(startOfDay(result)).toEqual(startOfDay(new Date("2025-12-26")));
  });
});
