import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SummaryCard } from "./summary-card";

describe("SummaryCard", () => {
  it("renders label and value correctly", () => {
    render(<SummaryCard label="Monthly Total" value="₺1.200" />);

    expect(screen.getByText("Monthly Total")).toBeInTheDocument();
    expect(screen.getByText("₺1.200")).toBeInTheDocument();
  });

  it("renders subtext when provided", () => {
    render(<SummaryCard label="Label" value="Val" subtext="Includes FX" />);
    expect(screen.getByText("Includes FX")).toBeInTheDocument();
  });

  it("renders skeleton when isLoading is true", () => {
    const { container } = render(
      <SummaryCard label="Label" isLoading={true} />
    );
    // Skeleton has animate-pulse class
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("Val")).not.toBeInTheDocument();
  });
});
