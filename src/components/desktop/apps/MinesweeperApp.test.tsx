import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MinesweeperApp from "./MinesweeperApp";

describe("MinesweeperApp", () => {
  it("renders a 9×9 grid of cells and a reset button", () => {
    render(<MinesweeperApp onLaunchApp={vi.fn()} />);
    expect(screen.getByLabelText("cell-0-0")).toBeInTheDocument();
    expect(screen.getByLabelText("cell-8-8")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button").filter((b) => b.getAttribute("aria-label")?.startsWith("cell-")).length
    ).toBe(81);
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("reveals cells on left click (first click never loses)", () => {
    render(<MinesweeperApp onLaunchApp={vi.fn()} />);
    const cell = screen.getByLabelText("cell-4-4");
    fireEvent.click(cell);
    expect(screen.getByRole("button", { name: /reset/i })).not.toHaveTextContent("😵");
  });

  it("flags a cell on right click and updates the mine counter", () => {
    render(<MinesweeperApp onLaunchApp={vi.fn()} />);
    const counter = screen.getByTestId("mine-counter");
    expect(counter).toHaveTextContent("10");
    fireEvent.contextMenu(screen.getByLabelText("cell-0-0"));
    expect(counter).toHaveTextContent("9");
  });

  it("resets to a fresh board", () => {
    render(<MinesweeperApp onLaunchApp={vi.fn()} />);
    fireEvent.contextMenu(screen.getByLabelText("cell-0-0"));
    expect(screen.getByTestId("mine-counter")).toHaveTextContent("9");
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getByTestId("mine-counter")).toHaveTextContent("10");
  });
});
