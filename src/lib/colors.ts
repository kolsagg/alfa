/**
 * OKLCH Color Utilities
 */

/**
 * Extract lightness from an oklch string: oklch(L C H)
 * @param oklch oklch color string
 * @returns lightness value (0 to 1)
 */
export function getLightnessFromOklch(oklch: string): number {
  const match = oklch.match(/oklch\(\s*([\d.]+)/);
  if (!match) return 0.5; // Default to middle ground if not oklch
  return parseFloat(match[1]);
}

// OKLCH Lightness threshold for text contrast
const LIGHTNESS_THRESHOLD = 0.6;

/**
 * Determine if text should be light or dark based on background lightness
 * @param oklch oklch background color string
 * @returns 'light' | 'dark'
 */
export function getContrastType(oklch: string): "light" | "dark" {
  const l = getLightnessFromOklch(oklch);
  return l > LIGHTNESS_THRESHOLD ? "dark" : "light";
}
