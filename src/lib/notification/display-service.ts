import { differenceInCalendarDays, startOfDay } from "date-fns";
import { NOTIFICATION_CONFIG } from "@/config/notifications";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency } from "@/lib/formatters";
import { logger } from "@/lib/event-logger";

export const NotificationUrgency = {
  STANDARD: "standard",
  IMMINENT: "imminent",
} as const;

export type NotificationUrgencyType =
  (typeof NotificationUrgency)[keyof typeof NotificationUrgency];

export interface DisplaySubscriptionData {
  id: string;
  name: string;
  cost: number;
  currency: string;
  icon?: string;
  color?: string;
}

export interface DisplayNotificationParams {
  subscription: DisplaySubscriptionData;
  paymentDueAt: string;
}

export function calculateUrgency(daysDiff: number): NotificationUrgencyType {
  return daysDiff <= NOTIFICATION_CONFIG.IMMINENT_PAYMENT_DAYS
    ? NotificationUrgency.IMMINENT
    : NotificationUrgency.STANDARD;
}

export function displayNotification(
  params: DisplayNotificationParams
): Notification | null {
  if (
    typeof Notification === "undefined" ||
    Notification.permission !== "granted"
  ) {
    console.warn("[DisplayService] Notification permission not granted");
    return null;
  }

  const { subscription, paymentDueAt } = params;
  const now = new Date();
  const paymentDate = new Date(paymentDueAt);
  const daysDiff = differenceInCalendarDays(
    startOfDay(paymentDate),
    startOfDay(now)
  );

  const urgency = calculateUrgency(daysDiff);
  const isImminent = urgency === NotificationUrgency.IMMINENT;

  const title = `Yaklaşan Ödeme: ${subscription.name}`;

  let daysText = "";
  if (daysDiff === 0) {
    daysText = "bugün";
  } else if (daysDiff === 1) {
    daysText = "yarın";
  } else {
    daysText = `${daysDiff} gün içinde`;
  }

  const formattedAmount = formatCurrency(
    subscription.cost,
    subscription.currency
  );
  const body = `${formattedAmount} ödemesi ${daysText}.`;

  const vibrate = isImminent ? [200, 100, 200] : [200];

  const options: NotificationOptions & { vibrate?: number[] } = {
    body,
    tag: subscription.id,
    icon: "/icons/android-chrome-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate,
    data: {
      subscriptionId: subscription.id,
      url: `/dashboard?subscriptionId=${subscription.id}`,
    },
  };

  // Attempt SW notification for better persistence/background handling if supported (AC5)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options as NotificationOptions);
    });
  }

  const notification = new Notification(title, options as NotificationOptions);

  // Story 7.1: Log notification shown event
  logger.log("notification_shown", {
    urgency,
    days_until_due: daysDiff,
  });

  notification.onclick = (event) => {
    event.preventDefault();
    window.focus();

    // Open edit/detail modal
    useUIStore.getState().openModal("editSubscription", subscription.id);

    notification.close();
  };

  return notification;
}

/**
 * Parameters for grouped notification display
 * Story 4.5 - Grouped Notifications
 */
export interface GroupedNotificationParams {
  subscriptions: DisplaySubscriptionData[];
  paymentDueAt: string;
}

/**
 * Display a grouped notification for multiple payments on the same day
 * Story 4.5 - AC2: Aggregated Notification Content
 */
export function displayGroupedNotification(
  params: GroupedNotificationParams
): Notification | null {
  if (
    typeof Notification === "undefined" ||
    Notification.permission !== "granted"
  ) {
    console.warn("[DisplayService] Notification permission not granted");
    return null;
  }

  const { subscriptions, paymentDueAt } = params;
  const now = new Date();
  const paymentDate = new Date(paymentDueAt);
  const daysDiff = differenceInCalendarDays(
    startOfDay(paymentDate),
    startOfDay(now)
  );

  // AC5: Use imminent urgency if payment is urgent
  const urgency = calculateUrgency(daysDiff);
  const isImminent = urgency === NotificationUrgency.IMMINENT;

  // Calculate total amount
  const totalAmount = subscriptions.reduce((sum, sub) => sum + sub.cost, 0);
  // Assume all subscriptions have the same currency (grouped by day)
  const currency = subscriptions[0]?.currency || "TRY";

  // AC2: Localized title
  const title = "Birden Fazla Ödeme Yaklaşıyor";

  // Generate days text
  let daysText = "";
  if (daysDiff === 0) {
    daysText = "bugün";
  } else if (daysDiff === 1) {
    daysText = "yarın";
  } else {
    daysText = `${daysDiff} gün içinde`;
  }

  // AC2: Format body as "{{count}} adet ödeme {{daysText}} yapılacak - Toplam {{totalAmount}}"
  const formattedTotal = formatCurrency(totalAmount, currency);
  const body = `${subscriptions.length} adet ödeme ${daysText} yapılacak - Toplam ${formattedTotal}`;

  const vibrate = isImminent ? [200, 100, 200] : [200];

  // Create a unique tag for grouped notifications
  const tag = `grouped-${paymentDate.toISOString().split("T")[0]}`;

  const options: NotificationOptions & { vibrate?: number[] } = {
    body,
    tag,
    icon: "/icons/android-chrome-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate,
    data: {
      isGrouped: true,
      subscriptionIds: subscriptions.map((s) => s.id),
      dateFilter: paymentDate.toISOString().split("T")[0],
      url: `/dashboard?dateFilter=${paymentDate.toISOString().split("T")[0]}`,
    },
  };

  // Attempt SW notification for better persistence/background handling
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options as NotificationOptions);
    });
  }

  const notification = new Notification(title, options as NotificationOptions);

  // Story 7.1: Log notification shown event (grouped)
  logger.log("notification_shown", {
    urgency,
    days_until_due: daysDiff,
    is_grouped: true,
    subscription_count: subscriptions.length,
  });

  // AC4: Close any open modals and set dateFilter on click
  const dateFilterValue = paymentDate.toISOString().split("T")[0];
  notification.onclick = (event) => {
    event.preventDefault();
    window.focus();

    // Close any open modals
    useUIStore.getState().closeModal();

    // AC4: Set dateFilter state to filter subscription list
    useUIStore.getState().setDateFilter(dateFilterValue);

    notification.close();
  };

  return notification;
}
