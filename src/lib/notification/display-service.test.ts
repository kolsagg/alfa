import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { displayNotification, NotificationUrgency } from "./display-service";
import { useUIStore } from "@/stores/ui-store";
import { addDays } from "date-fns";
import { NOTIFICATION_CONFIG } from "@/config/notifications";

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

  // We need to capture the instance to access onclick
  let lastNotificationInstance: MockNotification | null = null;

  class MockNotification {
    onclick: ((event: Event) => void) | null = null;

    constructor(public title: string, public options?: NotificationOptions) {
      mockNotificationConstructor(title, options);
      this.close = vi.fn();
      lastNotificationInstance = this;
    }
    static permission = "granted";
    close: any;
  }

  beforeEach(() => {
    mockNotificationConstructor.mockClear();
    lastNotificationInstance = null;
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
          body: "15.99 USD ödemesi bugün.",
          tag: "sub-123",
        })
      );
    });

    it(`should use 'imminent' urgency vibration pattern when payment is <= ${NOTIFICATION_CONFIG.IMMINENT_PAYMENT_DAYS} days`, () => {
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
      result!.onclick!(mockEvent as any);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();

      expect(mockOpenModal).toHaveBeenCalledWith("editSubscription", "sub-123");
      expect(result!.close).toHaveBeenCalled();
    });
  });
});
