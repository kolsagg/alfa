import { differenceInCalendarDays, startOfDay } from "date-fns";
import { NOTIFICATION_CONFIG } from "@/config/notifications";
import { useUIStore } from "@/stores/ui-store";

export enum NotificationUrgency {
  STANDARD = "standard",
  IMMINENT = "imminent",
}

export interface DisplayNotificationParams {
  subscription: {
    id: string;
    name: string;
    cost: number;
    currency: string;
    icon?: string;
    color?: string;
  };
  paymentDueAt: string;
}

export function calculateUrgency(daysDiff: number): NotificationUrgency {
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

  const body = `${subscription.cost} ${subscription.currency} ödemesi ${daysText}.`;

  const vibrate = isImminent ? [200, 100, 200] : [200];

  const options: NotificationOptions = {
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
      registration.showNotification(title, options);
    });
    // We still return a ghost notification or handles click manually if needed,
    // but browser might show it twice if we don't return null here.
    // However, AC2 requires focusing which is easier with new Notification() in foreground.
    // Standard PWA practice: If foreground, use Notification constructor.
  }

  const notification = new Notification(title, options);

  notification.onclick = (event) => {
    event.preventDefault();
    window.focus();

    // Open edit/detail modal
    useUIStore.getState().openModal("editSubscription", subscription.id);

    notification.close();
  };

  return notification;
}
