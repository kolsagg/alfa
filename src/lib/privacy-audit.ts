/**
 * Privacy Audit Utility
 *
 * Story 7.2: Privacy-First Data Handling
 *
 * Key Features:
 * - Network request allowlist enforcement (AC1, AC3)
 * - Third-party tracking script detection (AC2)
 * - Resource hint auditing (AC3)
 * - Beacon API monitoring (AC1)
 * - Fetch interception for audit (AC1)
 */

/**
 * Allowed external origins for network requests
 * AC3: Only these origins are permitted
 */
export const ALLOWED_ORIGINS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
] as const;

/**
 * Known tracking globals to detect
 * AC2: Third-party analytics detection
 */
export const TRACKING_GLOBALS = [
  "gtag",
  "ga",
  "mixpanel",
  "analytics",
  "_gaq",
  "fbq",
  "heap",
  "amplitude",
  "hotjar",
  "hj",
  "Intercom",
  "FS", // FullStory
  "posthog",
  "segment",
  "Sentry", // May be acceptable in some contexts, but flagged for awareness
  "LogRocket",
] as const;

/**
 * Known tracking script patterns
 * AC2: Detection of analytics script sources
 */
export const TRACKING_SCRIPT_PATTERNS = [
  "google-analytics.com",
  "googletagmanager.com",
  "segment.com",
  "segment.io",
  "mixpanel.com",
  "amplitude.com",
  "hotjar.com",
  "fullstory.com",
  "logrocket.com",
  "intercom.io",
  "posthog.com",
  "sentry.io",
] as const;

/**
 * Audit result structure
 */
export interface AuditResult {
  passed: boolean;
  violations: AuditViolation[];
}

export interface AuditViolation {
  type:
    | "tracking_global"
    | "tracking_script"
    | "unauthorized_origin"
    | "resource_hint"
    | "beacon_call"
    | "fetch_leak";
  detail: string;
  severity: "high" | "medium" | "low";
}

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(url: string): boolean {
  try {
    const parsedUrl = new URL(url, window.location.origin);

    // Same-origin is always allowed
    if (parsedUrl.origin === window.location.origin) {
      return true;
    }

    // Check against allowlist (AC3: fonts.googleapis.com, fonts.gstatic.com)
    // Secure check: exact match or subdomain with leading dot
    return ALLOWED_ORIGINS.some(
      (allowed) =>
        parsedUrl.hostname === allowed ||
        parsedUrl.hostname.endsWith("." + allowed)
    );
  } catch {
    // Invalid URL - treat as disallowed
    return false;
  }
}

/**
 * Audit window globals for tracking scripts
 * AC2: Detect initialized analytics SDKs
 */
export function auditGlobals(): AuditResult {
  const violations: AuditViolation[] = [];

  for (const globalName of TRACKING_GLOBALS) {
    if (
      globalName in window &&
      (window as unknown as Record<string, unknown>)[globalName] !== undefined
    ) {
      violations.push({
        type: "tracking_global",
        detail: `Found tracking global: window.${globalName}`,
        severity: "high",
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Audit script tags for tracking sources
 * AC2: Scan for non-same-origin scripts
 */
export function auditScripts(): AuditResult {
  const violations: AuditViolation[] = [];
  const scripts = document.querySelectorAll("script[src]");

  scripts.forEach((script) => {
    const src = script.getAttribute("src");
    if (!src) return;

    // Check for known tracking patterns
    for (const pattern of TRACKING_SCRIPT_PATTERNS) {
      if (src.includes(pattern)) {
        violations.push({
          type: "tracking_script",
          detail: `Tracking script detected: ${src}`,
          severity: "high",
        });
        return;
      }
    }

    // Check if non-allowed external origin
    if (!isOriginAllowed(src)) {
      violations.push({
        type: "unauthorized_origin",
        detail: `External script from unauthorized origin: ${src}`,
        severity: "medium",
      });
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Audit resource hints (preconnect, dns-prefetch)
 * AC3: Only allow font domains
 */
export function auditResourceHints(): AuditResult {
  const violations: AuditViolation[] = [];
  const hints = document.querySelectorAll(
    'link[rel="preconnect"], link[rel="dns-prefetch"]'
  );

  hints.forEach((hint) => {
    const href = hint.getAttribute("href");
    if (!href) return;

    if (!isOriginAllowed(href)) {
      violations.push({
        type: "resource_hint",
        detail: `Resource hint to unauthorized origin: ${href}`,
        severity: "medium",
      });
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Beacon call tracker
 * Stores calls made via navigator.sendBeacon for audit
 */
let beaconCalls: { url: string; timestamp: number }[] = [];
let originalSendBeacon: typeof navigator.sendBeacon | null = null;

/**
 * Install beacon spy
 * AC1: Monitor sendBeacon for data leaks
 */
export function installBeaconSpy(): void {
  if (originalSendBeacon) return; // Already installed

  // Check if sendBeacon exists (not available in all environments like jsdom)
  if (
    typeof navigator === "undefined" ||
    typeof navigator.sendBeacon !== "function"
  ) {
    return;
  }

  originalSendBeacon = navigator.sendBeacon.bind(navigator);

  navigator.sendBeacon = (
    url: string | URL,
    data?: BodyInit | null
  ): boolean => {
    const urlString = url.toString();
    beaconCalls.push({ url: urlString, timestamp: Date.now() });

    // Only allow same-origin beacon calls
    if (!isOriginAllowed(urlString)) {
      console.warn(
        `[PrivacyAudit] Blocked sendBeacon to unauthorized origin: ${urlString}`
      );
      return false;
    }

    return originalSendBeacon!(url, data);
  };
}

/**
 * Uninstall beacon spy and restore original
 */
export function uninstallBeaconSpy(): void {
  if (originalSendBeacon) {
    navigator.sendBeacon = originalSendBeacon;
    originalSendBeacon = null;
  }
  beaconCalls = [];
}

/**
 * Audit beacon calls
 * AC1: Check for external beacon transmissions
 */
export function auditBeacon(): AuditResult {
  const violations: AuditViolation[] = [];

  for (const call of beaconCalls) {
    if (!isOriginAllowed(call.url)) {
      violations.push({
        type: "beacon_call",
        detail: `sendBeacon to unauthorized origin: ${call.url}`,
        severity: "high",
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Get beacon call history for debugging
 */
export function getBeaconCalls(): { url: string; timestamp: number }[] {
  return [...beaconCalls];
}

/**
 * Clear beacon call history
 */
export function clearBeaconCalls(): void {
  beaconCalls = [];
}

/**
 * Fetch call tracker
 * Stores non-allowed fetch calls for audit
 */
let fetchViolations: { url: string; timestamp: number }[] = [];
let originalFetch: typeof window.fetch | null = null;

/**
 * Install fetch spy
 * AC1: Monitor fetch for data leaks
 */
export function installFetchSpy(): void {
  if (originalFetch) return; // Already installed

  originalFetch = window.fetch.bind(window);

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;

    if (!isOriginAllowed(url)) {
      fetchViolations.push({ url, timestamp: Date.now() });
      console.warn(
        `[PrivacyAudit] Fetch to unauthorized origin detected: ${url}`
      );
      // Note: We log but don't block - blocking would break the app
      // CSP at server level provides actual blocking
    }

    return originalFetch!(input, init);
  };
}

/**
 * Uninstall fetch spy and restore original
 */
export function uninstallFetchSpy(): void {
  if (originalFetch) {
    window.fetch = originalFetch;
    originalFetch = null;
  }
  fetchViolations = [];
}

/**
 * Audit fetch calls
 * AC1: Check for external fetch transmissions
 */
export function auditFetch(): AuditResult {
  const violations: AuditViolation[] = [];

  for (const call of fetchViolations) {
    violations.push({
      type: "fetch_leak",
      detail: `fetch to unauthorized origin: ${call.url}`,
      severity: "high",
    });
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Get fetch violation history for debugging
 */
export function getFetchViolations(): { url: string; timestamp: number }[] {
  return [...fetchViolations];
}

/**
 * Clear fetch violation history
 */
export function clearFetchViolations(): void {
  fetchViolations = [];
}

/**
 * Run complete privacy audit
 * Returns combined results from all audit functions
 */
export function runPrivacyAudit(): AuditResult {
  const results = [
    auditGlobals(),
    auditScripts(),
    auditResourceHints(),
    auditBeacon(),
    auditFetch(),
  ];

  const allViolations = results.flatMap((r) => r.violations);

  return {
    passed: allViolations.length === 0,
    violations: allViolations,
  };
}

/**
 * Privacy audit summary for display/logging
 */
export function getAuditSummary(): string {
  const result = runPrivacyAudit();

  if (result.passed) {
    return "✅ Privacy audit passed: No violations detected";
  }

  const highCount = result.violations.filter(
    (v) => v.severity === "high"
  ).length;
  const medCount = result.violations.filter(
    (v) => v.severity === "medium"
  ).length;
  const lowCount = result.violations.filter((v) => v.severity === "low").length;

  return `⚠️ Privacy audit failed: ${result.violations.length} violation(s) (${highCount} high, ${medCount} medium, ${lowCount} low)`;
}

/**
 * Initialize privacy monitoring
 * Call this early in app lifecycle to start tracking
 */
export function initializePrivacyMonitoring(): void {
  installBeaconSpy();
  installFetchSpy();
}

/**
 * Cleanup privacy monitoring
 * Call on app unmount/cleanup
 */
export function cleanupPrivacyMonitoring(): void {
  uninstallBeaconSpy();
  uninstallFetchSpy();
}
