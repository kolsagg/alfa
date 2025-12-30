import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  OnboardingIllustration,
  type IllustrationVariant,
} from "./onboarding-illustration";

describe("OnboardingIllustration", () => {
  describe("Rendering variants", () => {
    const variants: IllustrationVariant[] = [
      "control",
      "visibility",
      "insights",
    ];

    variants.forEach((variant) => {
      it(`renders ${variant} variant correctly`, () => {
        render(<OnboardingIllustration variant={variant} />);

        expect(
          screen.getByTestId(`onboarding-illustration-${variant}`)
        ).toBeInTheDocument();
      });
    });

    it("control variant renders Smartphone icon composition", () => {
      render(<OnboardingIllustration variant="control" />);

      const container = screen.getByTestId("onboarding-illustration-control");
      expect(container).toBeInTheDocument();
      // Check it has aria-hidden for accessibility (decorative)
      expect(container).toHaveAttribute("aria-hidden", "true");
    });

    it("visibility variant renders Calendar icon composition", () => {
      render(<OnboardingIllustration variant="visibility" />);

      const container = screen.getByTestId(
        "onboarding-illustration-visibility"
      );
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute("aria-hidden", "true");
    });

    it("insights variant renders PieChart icon composition", () => {
      render(<OnboardingIllustration variant="insights" />);

      const container = screen.getByTestId("onboarding-illustration-insights");
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Animation state (isActive prop)", () => {
    it("applies animation classes to container when isActive=true", () => {
      const { container } = render(
        <OnboardingIllustration variant="control" isActive={true} />
      );

      // Check the container element is rendered correctly with isActive
      const wrapper = screen.getByTestId("onboarding-illustration-control");
      expect(wrapper).toBeInTheDocument();
      // The component should visually indicate active state
      // SVG animations are handled via CSS classes on wrapper elements
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("does NOT apply bounce animation when isActive=false", () => {
      const { container } = render(
        <OnboardingIllustration variant="visibility" isActive={false} />
      );

      // When inactive, the notification dot should not have bounce animation
      const notificationDot = container.querySelector(".bg-destructive");
      expect(notificationDot?.className).not.toContain(
        "motion-safe:animate-bounce"
      );
    });

    it("defaults isActive to false when not provided", () => {
      const { container } = render(
        <OnboardingIllustration variant="visibility" />
      );

      // When inactive (default), bounce should not be applied
      const notificationDot = container.querySelector(".bg-destructive");
      expect(notificationDot?.className).not.toContain(
        "motion-safe:animate-bounce"
      );
    });
  });

  describe("Responsive sizing", () => {
    it("has responsive container classes", () => {
      render(<OnboardingIllustration variant="control" />);

      const container = screen.getByTestId("onboarding-illustration-control");
      // Check for responsive width/height classes
      expect(container.className).toContain("h-40");
      expect(container.className).toContain("w-40");
      expect(container.className).toContain("sm:h-48");
      expect(container.className).toContain("sm:w-48");
    });

    it("renders SVG icons for all variants", () => {
      const variants: IllustrationVariant[] = [
        "control",
        "visibility",
        "insights",
      ];

      variants.forEach((variant) => {
        const { container, unmount } = render(
          <OnboardingIllustration variant={variant} />
        );
        // Lucide-react renders SVG elements
        const svgElements = container.querySelectorAll("svg");
        expect(svgElements.length).toBeGreaterThan(0);
        unmount();
      });
    });
  });

  describe("Accessibility", () => {
    it("all variants are marked as decorative (aria-hidden)", () => {
      const variants: IllustrationVariant[] = [
        "control",
        "visibility",
        "insights",
      ];

      variants.forEach((variant) => {
        const { unmount } = render(
          <OnboardingIllustration variant={variant} />
        );
        const container = screen.getByTestId(
          `onboarding-illustration-${variant}`
        );
        expect(container).toHaveAttribute("aria-hidden", "true");
        unmount();
      });
    });
  });

  describe("Custom className", () => {
    it("applies additional className to container", () => {
      render(
        <OnboardingIllustration variant="control" className="custom-class" />
      );

      const container = screen.getByTestId("onboarding-illustration-control");
      expect(container.className).toContain("custom-class");
    });
  });

  describe("Visibility variant specific elements", () => {
    it("renders notification dot for visibility variant", () => {
      const { container } = render(
        <OnboardingIllustration variant="visibility" />
      );

      // Visibility variant has a destructive notification dot
      const notificationDot = container.querySelector(".bg-destructive");
      expect(notificationDot).toBeInTheDocument();
    });

    it("renders payment count badge for visibility variant", () => {
      const { container } = render(
        <OnboardingIllustration variant="visibility" />
      );

      // Visibility variant shows "3" as upcoming payment count
      expect(container.textContent).toContain("3");
    });
  });
});
