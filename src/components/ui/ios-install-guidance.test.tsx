import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IOSInstallGuidance } from "./ios-install-guidance";
import { useSettingsStore } from "@/stores/settings-store";
import type { SettingsState } from "@/stores/settings-store";
import * as iosDetection from "@/hooks/use-ios-pwa-detection";

// Mock iOS detection
vi.mock("@/hooks/use-ios-pwa-detection", () => ({
  useIOSPWADetection: vi.fn(() => ({ shouldShowPrompt: false })),
  detectIOSSafariNonStandalone: vi.fn(() => true),
}));

describe("IOSInstallGuidance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({
      lastIOSPromptDismissed: undefined,
    } as Partial<SettingsState>);
  });

  describe("automatic mode (default)", () => {
    it("should not render when shouldShowPrompt is false", () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: false,
      });

      const { container } = render(<IOSInstallGuidance />);
      expect(container.firstChild).toBeNull();
    });

    it("should render when shouldShowPrompt is true", () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);
      expect(screen.getByText("Ana Ekrana Ekle")).toBeInTheDocument();
    });

    it('should show "Anladım" button in automatic mode', () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);
      expect(
        screen.getByRole("button", { name: "Anladım" })
      ).toBeInTheDocument();
    });

    it("should dismiss when Anladım clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);

      await user.click(screen.getByRole("button", { name: "Anladım" }));

      expect(useSettingsStore.getState().lastIOSPromptDismissed).toBeDefined();
    });
  });

  describe("triggeredBySettings mode", () => {
    it("should render when open=true in controlled mode", () => {
      render(
        <IOSInstallGuidance
          triggeredBySettings
          open={true}
          onOpenChange={() => {}}
        />
      );

      expect(
        screen.getByText("Bildirimler için Ana Ekrana Ekle")
      ).toBeInTheDocument();
    });

    it("should not render when open=false in controlled mode", () => {
      const { container } = render(
        <IOSInstallGuidance
          triggeredBySettings
          open={false}
          onOpenChange={() => {}}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should show "Kurdum" and "Sonra" buttons', () => {
      render(
        <IOSInstallGuidance
          triggeredBySettings
          open={true}
          onOpenChange={() => {}}
        />
      );

      expect(
        screen.getByRole("button", { name: "Kurdum" })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sonra" })).toBeInTheDocument();
    });

    it("should call onOpenChange(false) and dismissIOSPrompt when Sonra clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <IOSInstallGuidance
          triggeredBySettings
          open={true}
          onOpenChange={onOpenChange}
        />
      );

      await user.click(screen.getByRole("button", { name: "Sonra" }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(useSettingsStore.getState().lastIOSPromptDismissed).toBeDefined();
    });

    it("should re-check standalone mode when Kurdum clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      // Still non-standalone after clicking
      vi.mocked(iosDetection.detectIOSSafariNonStandalone).mockReturnValue(
        true
      );

      render(
        <IOSInstallGuidance
          triggeredBySettings
          open={true}
          onOpenChange={onOpenChange}
        />
      );

      await user.click(screen.getByRole("button", { name: "Kurdum" }));

      // Should show loading state
      expect(
        screen.getByRole("button", { name: "Kontrol ediliyor..." })
      ).toBeInTheDocument();

      // Wait for timeout and check
      await waitFor(
        () => {
          expect(onOpenChange).toHaveBeenCalledWith(false);
        },
        { timeout: 1000 }
      );
    });

    it("should show different description in settings mode", () => {
      render(
        <IOSInstallGuidance
          triggeredBySettings
          open={true}
          onOpenChange={() => {}}
        />
      );

      expect(
        screen.getByText(
          "iOS'ta bildirim almak için SubTracker'ı ana ekranınıza eklemeniz gerekiyor."
        )
      ).toBeInTheDocument();
    });
  });

  it("should show step-by-step instructions with Safari share icon", () => {
    vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
      shouldShowPrompt: true,
    });

    render(<IOSInstallGuidance />);

    expect(
      screen.getByText("Safari'de 'Paylaş' simgesine dokunun")
    ).toBeInTheDocument();
    expect(
      screen.getByText("'Ana Ekrana Ekle' seçeneğini seçin")
    ).toBeInTheDocument();
    expect(screen.getByText("1. Paylaş Simgesi")).toBeInTheDocument();
    expect(screen.getByText("2. Ana Ekrana Ekle")).toBeInTheDocument();
  });
});
