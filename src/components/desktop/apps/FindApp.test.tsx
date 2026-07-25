import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FindApp from "./FindApp";

describe("FindApp", () => {
  it("reveals results after Find Now", () => {
    render(<FindApp onLaunchApp={vi.fn()} />);
    expect(screen.queryByText("Kavya_Kathuria_Resume.pdf")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Find Now"));
    expect(screen.getByText("Kavya_Kathuria_Resume.pdf")).toBeInTheDocument();
  });

  it("opens the resume when its result is double-clicked", () => {
    const onLaunchApp = vi.fn();
    render(<FindApp onLaunchApp={onLaunchApp} />);
    fireEvent.click(screen.getByText("Find Now"));
    fireEvent.doubleClick(screen.getByText("Kavya_Kathuria_Resume.pdf"));
    expect(onLaunchApp).toHaveBeenCalledWith("resume");
  });

  it("calls onClose from Close", () => {
    const onClose = vi.fn();
    render(<FindApp onLaunchApp={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
