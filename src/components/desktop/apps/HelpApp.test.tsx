import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HelpApp from "./HelpApp";

describe("HelpApp", () => {
  it("opens the right apps from its shortcut buttons", () => {
    const onLaunchApp = vi.fn();
    render(<HelpApp onLaunchApp={onLaunchApp} />);
    fireEvent.click(screen.getByText("Ask About Kavya"));
    fireEvent.click(screen.getByText("Open Résumé"));
    fireEvent.click(screen.getByText("Contact"));
    expect(onLaunchApp).toHaveBeenNthCalledWith(1, "agents");
    expect(onLaunchApp).toHaveBeenNthCalledWith(2, "resume");
    expect(onLaunchApp).toHaveBeenNthCalledWith(3, "contact");
  });

  it("calls onClose from OK", () => {
    const onClose = vi.fn();
    render(<HelpApp onLaunchApp={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByText("OK"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
