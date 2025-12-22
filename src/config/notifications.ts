/**
 * Notification Configuration Constants
 *
 * Centralized configuration for notification-related logic,
 * timings, and assets.
 */

export const NOTIFICATION_CONFIG = {
  /**
   * How many days to show the notification banner after permission is denied?
   * AC4 logic uses this to periodically remind user.
   */
  BANNER_VISIBILITY_DAYS: 7,

  /**
   * How many days before a payment is considered "imminent" for graceful degradation?
   * Used in CountdownHero and NotificationBanner.
   */
  IMMINENT_PAYMENT_DAYS: 3,

  /**
   * How many days to snooze the iOS install prompt after dismissal?
   */
  IOS_PROMPT_RESIDENCY_DAYS: 7,

  /**
   * Assets for notification guidance
   */
  ASSETS: {
    IOS_GUIDANCE: "/assets/ios-guidance.png",
  },

  /**
   * Persistence durations
   */
  SUCCESS_STATE_DURATION_MS: 3000,
} as const;
