/**
 * AboutSettings Component Tests
 *
 * Story 8.7: Comprehensive test coverage for About section
 * AC1: Enhanced UI rendering
 * AC2: Storage tracking with BACKUP_SIZE_THRESHOLD
 * AC3: Privacy statements
 * AC4: Accessibility
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AboutSettings } from "./about-settings";
import { SETTINGS_STRINGS } from "@/lib/i18n/settings";
import { BACKUP_SIZE_THRESHOLD } from "@/types/backup";

// Mock __APP_VERSION__ global
vi.stubGlobal("__APP_VERSION__", "1.0.0");

// Mock storage-utils
vi.mock("@/lib/storage-utils", async () => {
  const actual = await vi.importActual("@/lib/storage-utils");
  return {
    ...actual,
    isPWAMode: vi.fn(() => false),
    calculateStorageUsage: vi.fn(() => ({
      usedBytes: 1024 * 100, // 100 KB
      limitBytes: BACKUP_SIZE_THRESHOLD,
      usagePercentage: 2,
      isWarning: false,
    })),
  };
});

// Get mocked functions
import * as storageUtils from "@/lib/storage-utils";

describe("AboutSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AC1: Enhanced About Section UI", () => {
    it("renders identity header with app name and tagline", () => {
      render(<AboutSettings />);

      expect(screen.getByText(SETTINGS_STRINGS.APP_NAME)).toBeInTheDocument();
      expect(screen.getByText(SETTINGS_STRINGS.TAGLINE)).toBeInTheDocument();
      expect(screen.getByTestId("about-identity")).toBeInTheDocument();
    });

    it("displays version from __APP_VERSION__", () => {
      render(<AboutSettings />);

      const versionElement = screen.getByTestId("about-version");
      expect(versionElement).toHaveTextContent("1.0.0");
    });

    it("shows platform indicator for browser mode", () => {
      vi.mocked(storageUtils.isPWAMode).mockReturnValue(false);
      render(<AboutSettings />);

      expect(screen.getByTestId("about-platform")).toHaveTextContent(
        SETTINGS_STRINGS.BROWSER_MODE
      );
    });

    it("shows platform indicator for PWA mode", () => {
      vi.mocked(storageUtils.isPWAMode).mockReturnValue(true);
      render(<AboutSettings />);

      expect(screen.getByTestId("about-platform")).toHaveTextContent(
        SETTINGS_STRINGS.PWA_MODE
      );
    });

    it("renders credits footer", () => {
      render(<AboutSettings />);

      expect(screen.getByTestId("about-credits")).toBeInTheDocument();
      expect(
        screen.getByText(SETTINGS_STRINGS.MADE_WITH_LOVE)
      ).toBeInTheDocument();
    });
  });

  describe("AC2: Storage Tracking", () => {
    it("displays storage usage with correct format", () => {
      vi.mocked(storageUtils.calculateStorageUsage).mockReturnValue({
        usedBytes: 1024 * 512, // 512 KB
        limitBytes: BACKUP_SIZE_THRESHOLD,
        usagePercentage: 10,
        isWarning: false,
      });

      render(<AboutSettings />);

      const storageValue = screen.getByTestId("about-storage-value");
      expect(storageValue).toHaveTextContent("512.0 KB");
      expect(storageValue).toHaveTextContent("5.00 MB");
    });

    it("applies warning style when storage >80%", () => {
      vi.mocked(storageUtils.calculateStorageUsage).mockReturnValue({
        usedBytes: 4.5 * 1024 * 1024, // 4.5 MB
        limitBytes: BACKUP_SIZE_THRESHOLD,
        usagePercentage: 90,
        isWarning: true,
      });

      render(<AboutSettings />);

      const storageValue = screen.getByTestId("about-storage-value");
      expect(storageValue).toHaveClass("text-destructive");
      expect(storageValue).toHaveClass("font-medium");
    });

    it("does not apply warning style when storage <= 80%", () => {
      vi.mocked(storageUtils.calculateStorageUsage).mockReturnValue({
        usedBytes: 1024 * 100,
        limitBytes: BACKUP_SIZE_THRESHOLD,
        usagePercentage: 2,
        isWarning: false,
      });

      render(<AboutSettings />);

      const storageValue = screen.getByTestId("about-storage-value");
      expect(storageValue).not.toHaveClass("text-destructive");
    });
  });

  describe("AC3: Privacy & Transparency", () => {
    it("displays privacy section with shield icon", () => {
      render(<AboutSettings />);

      expect(screen.getByTestId("about-privacy")).toBeInTheDocument();
      expect(
        screen.getByText(SETTINGS_STRINGS.PRIVACY_TITLE)
      ).toBeInTheDocument();
    });

    it("shows no tracking statement", () => {
      render(<AboutSettings />);

      expect(
        screen.getByText(SETTINGS_STRINGS.NO_TRACKING_STATEMENT)
      ).toBeInTheDocument();
    });

    it("shows no third-party statement", () => {
      render(<AboutSettings />);

      expect(
        screen.getByText(SETTINGS_STRINGS.NO_THIRD_PARTY)
      ).toBeInTheDocument();
    });
  });

  describe("AC4: Accessibility", () => {
    it("has proper testids for all sections", () => {
      render(<AboutSettings />);

      expect(screen.getByTestId("about-settings")).toBeInTheDocument();
      expect(screen.getByTestId("about-identity")).toBeInTheDocument();
      expect(screen.getByTestId("about-storage")).toBeInTheDocument();
      expect(screen.getByTestId("about-privacy")).toBeInTheDocument();
      expect(screen.getByTestId("about-credits")).toBeInTheDocument();
    });

    it("icons have aria-hidden attribute", () => {
      const { container } = render(<AboutSettings />);

      // All lucide icons should have aria-hidden
      const svgs = container.querySelectorAll("svg");
      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute("aria-hidden", "true");
      });
    });
  });
});
