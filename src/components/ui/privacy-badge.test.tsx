/**
 * Privacy Badge Tests
 *
 * Story 7.2: Privacy-First Data Handling
 * AC5: Privacy UI Tests
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PrivacyBadge } from "./privacy-badge";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";

describe("PrivacyBadge - Story 7.2 AC5", () => {
  describe("Minimal variant", () => {
    it("should render icon only", () => {
      render(<PrivacyBadge variant="minimal" />);

      // Should have aria-label
      const badge = screen.getByLabelText(SETTINGS_STRINGS.PRIVACY_BADGE_TEXT);
      expect(badge).toBeInTheDocument();
    });

    it("should not show text in minimal variant", () => {
      render(<PrivacyBadge variant="minimal" />);

      expect(
        screen.queryByText(SETTINGS_STRINGS.PRIVACY_BADGE_TEXT)
      ).not.toBeInTheDocument();
    });
  });

  describe("Standard variant", () => {
    it("should render with icon and text by default", () => {
      render(<PrivacyBadge variant="standard" />);

      expect(
        screen.getByText(SETTINGS_STRINGS.PRIVACY_BADGE_TEXT)
      ).toBeInTheDocument();
    });

    it("should respect showLabel prop", () => {
      render(<PrivacyBadge variant="standard" showLabel={false} />);

      expect(
        screen.queryByText(SETTINGS_STRINGS.PRIVACY_BADGE_TEXT)
      ).not.toBeInTheDocument();
    });

    it("should have status role for accessibility", () => {
      render(<PrivacyBadge />);

      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Prominent variant", () => {
    it("should render title and description", () => {
      render(<PrivacyBadge variant="prominent" />);

      expect(
        screen.getByText(SETTINGS_STRINGS.PRIVACY_GUARANTEE_TITLE)
      ).toBeInTheDocument();
      expect(
        screen.getByText(SETTINGS_STRINGS.PRIVACY_GUARANTEE_DESC)
      ).toBeInTheDocument();
    });

    it("should have aria-label for accessibility", () => {
      render(<PrivacyBadge variant="prominent" />);

      const badge = screen.getByLabelText(
        SETTINGS_STRINGS.PRIVACY_GUARANTEE_TITLE
      );
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Custom className", () => {
    it("should apply custom className", () => {
      render(<PrivacyBadge className="custom-class" />);

      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("custom-class");
    });
  });

  describe("Default variant", () => {
    it("should default to standard variant", () => {
      render(<PrivacyBadge />);

      // Standard variant shows text
      expect(
        screen.getByText(SETTINGS_STRINGS.PRIVACY_BADGE_TEXT)
      ).toBeInTheDocument();
    });
  });
});
