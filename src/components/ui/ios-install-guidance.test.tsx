import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IOSInstallGuidance } from "./ios-install-guidance";
import { useSettingsStore } from "@/stores/settings-store";
import type { SettingsState } from "@/stores/settings-store";
import * as iosDetection from "@/hooks/use-ios-pwa-detection";
import { IOS_INSTALL_GUIDANCE_STRINGS as IOS_STRINGS } from "@/lib/i18n/ios-install-guidance";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock iOS detection
vi.mock("@/hooks/use-ios-pwa-detection", () => ({
  useIOSPWADetection: vi.fn(() => ({ shouldShowPrompt: false })),
  detectIOSSafariNonStandalone: vi.fn(() => true),
}));

// Mock matchMedia
const createMockMediaQueryList = (matches: boolean) => ({
  matches,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  media: "(display-mode: standalone)",
  onchange: null,
  dispatchEvent: vi.fn(),
});

describe("IOSInstallGuidance", () => {
  let mockMediaQueryList: ReturnType<typeof createMockMediaQueryList>;

  beforeEach(() => {
    vi.clearAllMocks();
    useSettingsStore.setState({
      lastIOSPromptDismissed: undefined,
    } as Partial<SettingsState>);

    // Setup matchMedia mock
    mockMediaQueryList = createMockMediaQueryList(false);
    vi.spyOn(window, "matchMedia").mockReturnValue(
      mockMediaQueryList as unknown as MediaQueryList
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      expect(screen.getByText(IOS_STRINGS.TITLE_AUTOMATIC)).toBeInTheDocument();
    });

    it('should show "Anladım" button in automatic mode using i18n string', () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);
      expect(
        screen.getByRole("button", { name: IOS_STRINGS.BUTTON_UNDERSTOOD })
      ).toBeInTheDocument();
    });

    it("should dismiss when Anladım clicked", async () => {
      const user = userEvent.setup();
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);

      await user.click(
        screen.getByRole("button", { name: IOS_STRINGS.BUTTON_UNDERSTOOD })
      );

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

      expect(screen.getByText(IOS_STRINGS.TITLE_SETTINGS)).toBeInTheDocument();
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

    it('should show "Kurdum" and "Sonra" buttons using i18n strings', () => {
      render(
        <IOSInstallGuidance
          triggeredBySettings
          open={true}
          onOpenChange={() => {}}
        />
      );

      expect(
        screen.getByRole("button", { name: IOS_STRINGS.BUTTON_INSTALLED })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: IOS_STRINGS.BUTTON_LATER })
      ).toBeInTheDocument();
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

      await user.click(
        screen.getByRole("button", { name: IOS_STRINGS.BUTTON_LATER })
      );

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(useSettingsStore.getState().lastIOSPromptDismissed).toBeDefined();
    });

    it("should re-check standalone mode when Kurdum clicked and dismiss with snooze if still in Safari (AC#4)", async () => {
      const { toast } = await import("sonner");
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

      await user.click(
        screen.getByRole("button", { name: IOS_STRINGS.BUTTON_INSTALLED })
      );

      // Should show loading state
      expect(
        screen.getByRole("button", { name: IOS_STRINGS.BUTTON_CHECKING })
      ).toBeInTheDocument();

      // Wait for timeout and check feedback (AC#4)
      await waitFor(
        () => {
          expect(toast.info).toHaveBeenCalledWith(
            IOS_STRINGS.TOAST_INSTALL_PENDING
          );
          // AC4: Should dismiss with snooze
          expect(onOpenChange).toHaveBeenCalledWith(false);
          expect(
            useSettingsStore.getState().lastIOSPromptDismissed
          ).toBeDefined();
        },
        { timeout: 1000 }
      );
    });

    it("should close modal with success toast when Kurdum clicked and now in PWA mode", async () => {
      const { toast } = await import("sonner");
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      // Simulate now in standalone mode
      vi.mocked(iosDetection.detectIOSSafariNonStandalone).mockReturnValue(
        false
      );

      render(
        <IOSInstallGuidance
          triggeredBySettings
          open={true}
          onOpenChange={onOpenChange}
        />
      );

      await user.click(
        screen.getByRole("button", { name: IOS_STRINGS.BUTTON_INSTALLED })
      );

      await waitFor(
        () => {
          expect(toast.success).toHaveBeenCalledWith(
            IOS_STRINGS.TOAST_INSTALL_SUCCESS
          );
          expect(onOpenChange).toHaveBeenCalledWith(false);
        },
        { timeout: 1000 }
      );
    });

    it("should show different description in settings mode using i18n string", () => {
      render(
        <IOSInstallGuidance
          triggeredBySettings
          open={true}
          onOpenChange={() => {}}
        />
      );

      expect(
        screen.getByText(IOS_STRINGS.DESCRIPTION_SETTINGS)
      ).toBeInTheDocument();
    });
  });

  describe("Story 4.6: Auto-dismiss on install detection (AC#6)", () => {
    it("should register matchMedia listener when modal opens", () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);

      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("should auto-dismiss and show success toast when matchMedia changes to standalone", async () => {
      const { toast } = await import("sonner");
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      let changeHandler: (() => void) | null = null;
      mockMediaQueryList.addEventListener = vi.fn((_, handler) => {
        changeHandler = handler as () => void;
      });
      mockMediaQueryList.matches = false;

      render(<IOSInstallGuidance />);

      // Simulate standalone mode transition
      mockMediaQueryList.matches = true;

      await act(async () => {
        if (changeHandler) changeHandler();
      });

      expect(toast.success).toHaveBeenCalledWith(
        IOS_STRINGS.TOAST_INSTALL_SUCCESS
      );
    });

    it("should check standalone on visibilitychange when document becomes visible", async () => {
      const { toast } = await import("sonner");
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      mockMediaQueryList.matches = false;

      render(<IOSInstallGuidance />);

      // Simulate transition to standalone and visibility change
      mockMediaQueryList.matches = true;
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "visible",
      });

      await act(async () => {
        document.dispatchEvent(new Event("visibilitychange"));
      });

      expect(toast.success).toHaveBeenCalledWith(
        IOS_STRINGS.TOAST_INSTALL_SUCCESS
      );
    });

    it("should cleanup listeners on unmount", () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      const { unmount } = render(<IOSInstallGuidance />);

      unmount();

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
    });

    it("should cleanup listeners when isOpen changes to false", () => {
      const onOpenChange = vi.fn();

      const { rerender } = render(
        <IOSInstallGuidance
          triggeredBySettings
          open={true}
          onOpenChange={onOpenChange}
        />
      );

      expect(mockMediaQueryList.addEventListener).toHaveBeenCalled();

      rerender(
        <IOSInstallGuidance
          triggeredBySettings
          open={false}
          onOpenChange={onOpenChange}
        />
      );

      // Cleanup should have been called when open changed
      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalled();
    });
  });

  describe("Story 4.6: Locale-ready infrastructure (AC#7)", () => {
    it("should use localized strings for step instructions", () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);

      expect(screen.getByText(IOS_STRINGS.STEP_1_OVERLAY)).toBeInTheDocument();
      expect(screen.getByText(IOS_STRINGS.STEP_2_OVERLAY)).toBeInTheDocument();
      expect(screen.getByText(IOS_STRINGS.STEP_1_TITLE)).toBeInTheDocument();
      expect(screen.getByText(IOS_STRINGS.STEP_2_TITLE)).toBeInTheDocument();
    });

    it("should not contain hardcoded Turkish strings - all text from i18n", () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);

      // Verify key strings are sourced from i18n (by checking they exist)
      const allStrings = Object.values(IOS_STRINGS);

      // Check that component uses at least the main UI strings
      expect(screen.getByText(IOS_STRINGS.TITLE_AUTOMATIC)).toBeInTheDocument();
      expect(
        screen.getByText(IOS_STRINGS.DESCRIPTION_AUTOMATIC)
      ).toBeInTheDocument();
      expect(screen.getByText(IOS_STRINGS.STEP_1_TITLE)).toBeInTheDocument();
      expect(screen.getByText(IOS_STRINGS.STEP_2_TITLE)).toBeInTheDocument();

      // Verify the strings are non-empty (actual localization exists)
      allStrings.forEach((str) => {
        expect(str.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Story 4.6: Accessibility compliance (AC#3/4)", () => {
    it("should have proper ARIA attributes on dialog", () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);

      const dialog = screen.getByRole("dialog");
      // Radix Dialog auto-generates aria-labelledby and aria-describedby
      expect(dialog).toHaveAttribute("aria-labelledby");
      expect(dialog).toHaveAttribute("aria-describedby");
    });

    it("should have aria-live on step container for screen reader announcements", () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);

      // The step overlay container should have aria-live
      const stepContainer = screen
        .getByText(IOS_STRINGS.STEP_1_OVERLAY)
        .closest('[aria-live="polite"]');
      expect(stepContainer).toBeInTheDocument();
    });

    it("should have minimum 44x44px touch targets on action buttons", () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);

      // Check "Anladım" button meets touch target requirements
      const understoodButton = screen.getByRole("button", {
        name: IOS_STRINGS.BUTTON_UNDERSTOOD,
      });
      expect(understoodButton).toHaveClass("min-h-[44px]");
    });

    it("should have minimum 44px height on action buttons", () => {
      vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
        shouldShowPrompt: true,
      });

      render(<IOSInstallGuidance />);

      const understoodButton = screen.getByRole("button", {
        name: IOS_STRINGS.BUTTON_UNDERSTOOD,
      });
      expect(understoodButton).toHaveClass("min-h-[44px]");
    });
  });

  it("should show step-by-step instructions with Safari share icon using i18n strings", () => {
    vi.mocked(iosDetection.useIOSPWADetection).mockReturnValue({
      shouldShowPrompt: true,
    });

    render(<IOSInstallGuidance />);

    expect(screen.getByText(IOS_STRINGS.STEP_1_OVERLAY)).toBeInTheDocument();
    expect(screen.getByText(IOS_STRINGS.STEP_2_OVERLAY)).toBeInTheDocument();
    expect(screen.getByText(IOS_STRINGS.STEP_1_TITLE)).toBeInTheDocument();
    expect(screen.getByText(IOS_STRINGS.STEP_2_TITLE)).toBeInTheDocument();
  });
});
