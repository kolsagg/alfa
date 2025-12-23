/**
 * SettingsSection Component Tests
 *
 * Story 8.2, Task 1: Tests for the reusable SettingsSection component
 * AC3: Consistent section design with icon, title, description
 * AC5: Accessibility with aria-labelledby
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SettingsSection } from "./settings-section";
import { Bell, Palette } from "lucide-react";

describe("SettingsSection", () => {
  it("renders with required props (icon, title, children)", () => {
    render(
      <SettingsSection icon={Bell} title="Bildirimler">
        <p>Test content</p>
      </SettingsSection>
    );

    expect(
      screen.getByRole("heading", { name: "Bildirimler" })
    ).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders optional description when provided", () => {
    render(
      <SettingsSection
        icon={Palette}
        title="Görünüm"
        description="Tema ayarlarını yönetin"
      >
        <p>Content</p>
      </SettingsSection>
    );

    expect(screen.getByText("Tema ayarlarını yönetin")).toBeInTheDocument();
  });

  it("uses h2 heading level for accessibility (AC5)", () => {
    render(
      <SettingsSection icon={Bell} title="Test Section">
        <p>Content</p>
      </SettingsSection>
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Test Section",
    });
    expect(heading).toBeInTheDocument();
  });

  it("applies aria-labelledby to section container (AC5)", () => {
    render(
      <SettingsSection icon={Bell} title="Accessibility Test">
        <p>Content</p>
      </SettingsSection>
    );

    const section = screen.getByRole("region", { name: "Accessibility Test" });
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute("aria-labelledby");
  });

  it("renders icon alongside title", () => {
    render(
      <SettingsSection icon={Bell} title="With Icon">
        <p>Content</p>
      </SettingsSection>
    );

    // Icon should be present (Bell icon is rendered as SVG)
    const heading = screen.getByRole("heading", { name: "With Icon" });
    const svg = heading.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies correct card styling (AC4: bg-muted/50, rounded-xl)", () => {
    render(
      <SettingsSection
        icon={Bell}
        title="Styled Section"
        data-testid="styled-section"
      >
        <p>Content</p>
      </SettingsSection>
    );

    const section = screen.getByTestId("styled-section");
    expect(section).toHaveClass("bg-muted/50");
    expect(section).toHaveClass("rounded-xl");
  });

  it("renders children content correctly", () => {
    render(
      <SettingsSection icon={Bell} title="Parent">
        <button>Click me</button>
        <input placeholder="Type here" />
      </SettingsSection>
    );

    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    render(
      <SettingsSection
        icon={Bell}
        title="Custom Class"
        className="my-custom-class"
        data-testid="custom-section"
      >
        <p>Content</p>
      </SettingsSection>
    );

    const section = screen.getByTestId("custom-section");
    expect(section).toHaveClass("my-custom-class");
  });
});
