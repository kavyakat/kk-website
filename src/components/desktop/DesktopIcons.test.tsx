import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DesktopIcons from "./DesktopIcons";

describe("DesktopIcons", () => {
  it("shows Minesweeper and Solitaire on the desktop", () => {
    render(<DesktopIcons isMobile={false} onOpen={() => {}} />);
    expect(screen.getByText("Minesweeper")).toBeInTheDocument();
    expect(screen.getByText("Solitaire")).toBeInTheDocument();
  });

  it("does not show hidden utility apps on the desktop", () => {
    render(<DesktopIcons isMobile={false} onOpen={() => {}} />);
    expect(screen.queryByText("Find: All Files")).toBeNull();
    expect(screen.queryByText("MS-DOS Prompt")).toBeNull();
  });
});
