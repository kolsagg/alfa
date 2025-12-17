import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { Header } from "../components/layout/header";
import { BottomNav } from "../components/layout/bottom-nav";
import { CountdownHeroPlaceholder } from "../components/dashboard/countdown-hero-placeholder";

describe("Dashboard Layout Components", () => {
  describe("Header", () => {
    it("renders app title", () => {
      render(<Header />);
      expect(screen.getByText("SubTracker")).toBeInTheDocument();
    });

    it("renders theme toggle", () => {
      render(<Header />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("BottomNav", () => {
    it("renders all navigation items", () => {
      render(<BottomNav />);
      expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
      expect(screen.getByLabelText("Ekle")).toBeInTheDocument();
      expect(screen.getByLabelText("Ayarlar")).toBeInTheDocument();
    });

    it("highlights active item", () => {
      render(<BottomNav activeItem="settings" />);
      const settingsButton = screen.getByLabelText("Ayarlar");
      expect(settingsButton).toHaveAttribute("aria-current", "page");
    });

    it("has proper touch target size", () => {
      render(<BottomNav />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("touch-target");
      });
    });
  });

  describe("CountdownHeroPlaceholder", () => {
    it("renders placeholder text", () => {
      render(<CountdownHeroPlaceholder />);
      expect(screen.getByText("Bir sonraki ödeme")).toBeInTheDocument();
      expect(screen.getByText("--:--:--")).toBeInTheDocument();
    });

    it("has tabular-nums for countdown display", () => {
      render(<CountdownHeroPlaceholder />);
      const countdown = screen.getByText("--:--:--");
      expect(countdown).toHaveClass("tabular-nums");
    });
  });

  describe("DashboardLayout", () => {
    it("renders children within main area", () => {
      render(
        <DashboardLayout>
          <div data-testid="child">Test Child</div>
        </DashboardLayout>
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("renders header and bottom nav", () => {
      render(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );
      expect(screen.getByText("SubTracker")).toBeInTheDocument();
      expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
    });
  });
});
