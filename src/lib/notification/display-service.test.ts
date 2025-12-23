import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  displayNotification,
  displayGroupedNotification,
} from "./display-service";
import type { GroupedNotificationParams } from "./display-service";
import { addDays } from "date-fns";

// Hoist mock setup
const { mockOpenModal } = vi.hoisted(() => ({
  mockOpenModal: vi.fn(),
}));

// Mock useUIStore
vi.mock("@/stores/ui-store", () => ({
  useUIStore: {
    getState: () => ({
      openModal: mockOpenModal,
    }),
  },
}));

describe("Notification Display Service", () => {
  const mockVibrate = vi.fn();
  const mockNotificationConstructor = vi.fn();

  class MockNotification {
    onclick: ((event: Event) => void) | null = null;
    close: () => void;
    title: string;
    options?: NotificationOptions;

    constructor(title: string, options?: NotificationOptions) {
      this.title = title;
      this.options = options;
      mockNotificationConstructor(title, options);
      this.close = vi.fn();
    }
    static permission = "granted";
  }

  beforeEach(() => {
    mockNotificationConstructor.mockClear();
    mockOpenModal.mockClear();

    // Stub global Notification
    vi.stubGlobal("Notification", MockNotification);

    // Mock navigator.vibrate
    Object.defineProperty(navigator, "vibrate", {
      value: mockVibrate,
      writable: true,
    });

    // Reset permissions
    MockNotification.permission = "granted";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockSubscription = {
    id: "sub-123",
    name: "Netflix",
    cost: 15.99,
    currency: "USD",
    icon: "netflix",
    color: "#e50914",
  };
  const paymentDueAt = new Date().toISOString();

  describe("displayNotification", () => {
    it("should not spawn notification if permission is not granted", () => {
      MockNotification.permission = "denied";
      const result = displayNotification({
        subscription: mockSubscription,
        paymentDueAt,
      });
      expect(result).toBeNull();
    });

    it("should spawn notification with correct title and body", () => {
      displayNotification({ subscription: mockSubscription, paymentDueAt });
      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        "Yaklaşan Ödeme: Netflix",
        expect.objectContaining({
          body: "15.99 $ ödemesi bugün.",
          tag: "sub-123",
        })
      );
    });

    it("should use 'imminent' urgency vibration pattern when payment is imminent", () => {
      // 2 days from now should be imminent if threshold is 3
      const imminentDate = addDays(new Date(), 2).toISOString();
      displayNotification({
        subscription: mockSubscription,
        paymentDueAt: imminentDate,
      });
      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ vibrate: [200, 100, 200] })
      );
    });

    it("should set onclick handler that opens modal", () => {
      const result = displayNotification({
        subscription: mockSubscription,
        paymentDueAt,
      });

      expect(result).not.toBeNull();
      expect(result!.onclick).toBeTypeOf("function");

      // Trigger onclick
      const mockEvent = { preventDefault: vi.fn() };
      // Mock window.focus
      const focusSpy = vi.spyOn(window, "focus").mockImplementation(() => {});

      // Call the onclick handler via the captured instance or result
      // Note: result is lastNotificationInstance
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result!.onclick!(mockEvent as any);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();

      expect(mockOpenModal).toHaveBeenCalledWith("editSubscription", "sub-123");
      expect(result!.close).toHaveBeenCalled();
    });
  });

  // Story 4.5 - Grouped Notifications Tests
  describe("displayGroupedNotification", () => {
    const mockSubscriptions: GroupedNotificationParams["subscriptions"] = [
      {
        id: "sub-1",
        name: "Netflix",
        cost: 15.99,
        currency: "TRY",
      },
      {
        id: "sub-2",
        name: "Spotify",
        cost: 24.99,
        currency: "TRY",
      },
    ];

    it("should display grouped notification with correct title and body", () => {
      const paymentDueAt = new Date().toISOString(); // Today

      displayGroupedNotification({
        subscriptions: mockSubscriptions,
        paymentDueAt,
      });

      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        "Birden Fazla Ödeme Yaklaşıyor",
        expect.objectContaining({
          body: expect.stringMatching(/2 adet ödeme.*40\.98 ₺/),
        })
      );
    });

    it("should use imminent vibration when any payment is urgent", () => {
      const imminentDate = new Date().toISOString(); // Today = imminent

      displayGroupedNotification({
        subscriptions: mockSubscriptions,
        paymentDueAt: imminentDate,
      });

      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ vibrate: [200, 100, 200] })
      );
    });

    it("should not display if permission is not granted", () => {
      MockNotification.permission = "denied";

      const result = displayGroupedNotification({
        subscriptions: mockSubscriptions,
        paymentDueAt: new Date().toISOString(),
      });

      expect(result).toBeNull();
    });

    it("should format days text correctly for 'today'", () => {
      displayGroupedNotification({
        subscriptions: mockSubscriptions,
        paymentDueAt: new Date().toISOString(),
      });

      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("bugün"),
        })
      );
    });

    it("should format days text correctly for 'tomorrow'", () => {
      const tomorrow = addDays(new Date(), 1).toISOString();

      displayGroupedNotification({
        subscriptions: mockSubscriptions,
        paymentDueAt: tomorrow,
      });

      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("yarın"),
        })
      );
    });
  });
});
