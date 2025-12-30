import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OnboardingStep } from "./onboarding-step";

describe("OnboardingStep", () => {
  describe("Rendering", () => {
    it("renders with required props", () => {
      render(
        <OnboardingStep
          title="Welcome"
          description="Track your subscriptions easily"
        />
      );

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Welcome"
      );
      expect(
        screen.getByText("Track your subscriptions easily")
      ).toBeInTheDocument();
    });

    it("has correct data-testid", () => {
      render(<OnboardingStep title="Test" description="Test description" />);

      expect(screen.getByTestId("onboarding-step")).toBeInTheDocument();
    });

    it("renders illustration when provided", () => {
      const IllustrationComponent = () => (
        <div data-testid="test-illustration">🎉</div>
      );

      render(
        <OnboardingStep
          title="Test"
          description="Test"
          illustration={<IllustrationComponent />}
        />
      );

      expect(screen.getByTestId("test-illustration")).toBeInTheDocument();
    });

    it("does not render illustration container when not provided", () => {
      const { container } = render(
        <OnboardingStep title="Test" description="Test" />
      );

      // Check that illustration container doesn't exist
      expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    });

    it("applies custom className", () => {
      render(
        <OnboardingStep
          title="Test"
          description="Test"
          className="custom-class"
        />
      );

      expect(screen.getByTestId("onboarding-step")).toHaveClass("custom-class");
    });
  });

  describe("Typography & Styling", () => {
    it("title has correct typography classes", () => {
      render(<OnboardingStep title="Test Title" description="Test" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveClass("text-2xl", "font-bold");
    });

    it("description has muted-foreground style", () => {
      render(<OnboardingStep title="Test" description="Test description" />);

      const description = screen.getByText("Test description");
      expect(description).toHaveClass("text-muted-foreground");
    });

    it("container has centered layout", () => {
      render(<OnboardingStep title="Test" description="Test" />);

      const container = screen.getByTestId("onboarding-step");
      expect(container).toHaveClass(
        "flex",
        "flex-col",
        "items-center",
        "justify-center"
      );
    });

    it("container has minimum height", () => {
      render(<OnboardingStep title="Test" description="Test" />);

      const container = screen.getByTestId("onboarding-step");
      expect(container.className).toMatch(/min-h-/);
    });
  });

  describe("Accessibility", () => {
    it("illustration container has aria-hidden", () => {
      render(
        <OnboardingStep
          title="Test"
          description="Test"
          illustration={<span>🎨</span>}
        />
      );

      const illustrationContainer = screen
        .getByTestId("onboarding-step")
        .querySelector('[aria-hidden="true"]');
      expect(illustrationContainer).toBeInTheDocument();
    });

    it("heading is h2 level for proper document structure", () => {
      render(<OnboardingStep title="Test" description="Test" />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it("text is centered for readability", () => {
      render(<OnboardingStep title="Test" description="Test" />);

      const container = screen.getByTestId("onboarding-step");
      expect(container).toHaveClass("text-center");
    });
  });

  describe("Reduced Motion Support", () => {
    it("uses motion-safe prefix for animations", () => {
      render(
        <OnboardingStep
          title="Test"
          description="Test"
          illustration={<span>🎯</span>}
        />
      );

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading.className).toContain("motion-safe:");
    });
  });

  describe("Content Layout", () => {
    it("limits content width with max-w-md", () => {
      const { container } = render(
        <OnboardingStep title="Test" description="Test" />
      );

      const contentContainer = container.querySelector(".max-w-md");
      expect(contentContainer).toBeInTheDocument();
    });

    it("has proper spacing between elements", () => {
      const { container } = render(
        <OnboardingStep title="Test" description="Test" />
      );

      const contentContainer = container.querySelector(".space-y-4");
      expect(contentContainer).toBeInTheDocument();
    });

    it("has padding for breathing room", () => {
      render(<OnboardingStep title="Test" description="Test" />);

      const container = screen.getByTestId("onboarding-step");
      expect(container.className).toMatch(/px-\d+/);
      expect(container.className).toMatch(/py-\d+/);
    });
  });

  describe("ReactNode Illustration", () => {
    it("renders complex ReactNode as illustration", () => {
      const complexIllustration = (
        <div data-testid="complex-illustration">
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" />
          </svg>
          <span>Label</span>
        </div>
      );

      render(
        <OnboardingStep
          title="Test"
          description="Test"
          illustration={complexIllustration}
        />
      );

      expect(screen.getByTestId("complex-illustration")).toBeInTheDocument();
    });

    it("renders string as illustration", () => {
      render(
        <OnboardingStep title="Test" description="Test" illustration="🚀" />
      );

      // Emoji should be in the document
      expect(screen.getByText("🚀")).toBeInTheDocument();
    });
  });
});
