import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SettingsApp from "./SettingsApp";

describe("SettingsApp", () => {
  it("renders both themes with Windows XP disabled", () => {
    render(<SettingsApp />);
    expect(screen.getByLabelText(/Windows 98 \(current\)/)).toBeEnabled();
    expect(screen.getByLabelText(/Windows XP/)).toBeDisabled();
  });

  it("calls onClose from OK", () => {
    const onClose = vi.fn();
    render(<SettingsApp onClose={onClose} />);
    fireEvent.click(screen.getByText("OK"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
