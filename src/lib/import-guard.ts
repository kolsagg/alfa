/**
 * Import Guard Utility
 *
 * Story 7.2: Privacy-First Data Handling
 * AC4: JSON Import Privacy Guard
 *
 * Ensures imported data is sanitized to prevent:
 * - Code execution via malicious strings
 * - Tracking/analytics URLs in data
 * - Potential XSS vectors
 */

/**
 * Patterns that indicate potentially dangerous content
 * These are blocked or flagged during import
 */
const DANGEROUS_PATTERNS = [
  // JavaScript execution
  /^javascript:/i,
  /^data:text\/html/i,
  /^data:.*base64.*<script/i,

  // Known tracking domains
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /segment\.io/i,
  /segment\.com/i,
  /mixpanel\.com/i,
  /amplitude\.com/i,
  /hotjar\.com/i,
  /fullstory\.com/i,
  /logrocket\.com/i,
  /intercom\.io/i,
  /posthog\.com/i,
  /sentry\.io/i,

  // Script-like patterns
  /<script[\s>]/i,
  /on\w+\s*=/i, // onclick=, onerror=, etc.
  /eval\s*\(/i,
  /Function\s*\(/i,
  /document\.(write|cookie)/i,
  /window\.location/i,
] as const;

/**
 * Suspicious URL patterns that warrant caution
 */
const SUSPICIOUS_URL_PATTERN =
  /^https?:\/\/(?!fonts\.googleapis\.com|fonts\.gstatic\.com)/i;

/**
 * Result of import guard check
 */
export interface ImportGuardResult {
  safe: boolean;
  sanitized: boolean;
  warnings: ImportGuardWarning[];
  blockedFields: string[];
}

export interface ImportGuardWarning {
  field: string;
  reason: string;
  severity: "high" | "medium" | "low";
}

/**
 * Check if a string value contains dangerous patterns
 */
export function isDangerousString(value: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Check if a string looks like an external URL
 */
export function isExternalUrl(value: string): boolean {
  return SUSPICIOUS_URL_PATTERN.test(value);
}

/**
 * Sanitize a string value for safe import
 * Returns the original if safe, or undefined if blocked
 */
export function sanitizeStringValue(
  value: string,
  fieldPath: string
): { value: string | undefined; warning?: ImportGuardWarning } {
  // Check for dangerous patterns - these are always blocked
  if (isDangerousString(value)) {
    return {
      value: undefined,
      warning: {
        field: fieldPath,
        reason: `Blocked dangerous content: pattern detected`,
        severity: "high",
      },
    };
  }

  // Check for external URLs in unexpected places
  // URLs in icon/image fields might be acceptable, but log a warning
  const isUrlField =
    fieldPath.toLowerCase().includes("url") ||
    fieldPath.toLowerCase().includes("icon") ||
    fieldPath.toLowerCase().includes("image");

  if (isExternalUrl(value) && !isUrlField) {
    return {
      value: value, // Allow but warn
      warning: {
        field: fieldPath,
        reason: `External URL detected in non-URL field`,
        severity: "medium",
      },
    };
  }

  return { value };
}

/**
 * Recursively sanitize an object's string values
 */
export function sanitizeObject<T>(
  obj: T,
  path: string = ""
): { data: T; warnings: ImportGuardWarning[]; blockedFields: string[] } {
  const warnings: ImportGuardWarning[] = [];
  const blockedFields: string[] = [];

  if (obj === null || obj === undefined) {
    return { data: obj, warnings, blockedFields };
  }

  if (typeof obj === "string") {
    const result = sanitizeStringValue(obj, path);
    if (result.warning) {
      warnings.push(result.warning);
      if (result.value === undefined) {
        blockedFields.push(path);
      }
    }
    return { data: (result.value ?? "") as T, warnings, blockedFields };
  }

  if (Array.isArray(obj)) {
    const sanitizedArray = obj.map((item, index) => {
      const itemPath = `${path}[${index}]`;
      const result = sanitizeObject(item, itemPath);
      warnings.push(...result.warnings);
      blockedFields.push(...result.blockedFields);
      return result.data;
    });
    return { data: sanitizedArray as T, warnings, blockedFields };
  }

  if (typeof obj === "object") {
    const sanitizedObj: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const fieldPath = path ? `${path}.${key}` : key;
      const result = sanitizeObject(value, fieldPath);
      warnings.push(...result.warnings);
      blockedFields.push(...result.blockedFields);
      sanitizedObj[key] = result.data;
    }

    return { data: sanitizedObj as T, warnings, blockedFields };
  }

  // Primitives (number, boolean) pass through
  return { data: obj, warnings, blockedFields };
}

/**
 * Main import guard function
 * Validates and sanitizes import data before rehydration
 */
export function guardImportData<T>(data: T): ImportGuardResult & { data: T } {
  const { data: sanitizedData, warnings, blockedFields } = sanitizeObject(data);

  return {
    safe: blockedFields.length === 0,
    sanitized: warnings.length > 0,
    warnings,
    blockedFields,
    data: sanitizedData,
  };
}

/**
 * Quick check if data is safe without full sanitization
 * Use for validation before showing import preview
 */
export function isDataSafe(data: unknown): boolean {
  const result = guardImportData(data);
  return result.safe;
}

/**
 * Get human-readable summary of guard results
 */
export function getGuardSummary(result: ImportGuardResult): string {
  if (result.safe && !result.sanitized) {
    return "✅ Veri güvenli ve doğrulandı";
  }

  if (result.safe && result.sanitized) {
    return `⚠️ Veri doğrulandı, ${result.warnings.length} uyarı mevcut`;
  }

  return `❌ Güvenlik ihlali: ${result.blockedFields.length} alan engellendi`;
}
