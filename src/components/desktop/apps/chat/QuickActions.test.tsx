import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuickActions from "./QuickActions";

describe("QuickActions", () => {
  it("fires onAction for content buttons and onOpenResume for the resume button", () => {
    const onAction = vi.fn();
    const onOpenResume = vi.fn();
    render(<QuickActions disabled={false} onAction={onAction} onOpenResume={onOpenResume} />);

    fireEvent.click(screen.getByRole("button", { name: /About Me/i }));
    expect(onAction).toHaveBeenCalledWith("about");

    fireEvent.click(screen.getByRole("button", { name: /Fun Facts/i }));
    expect(onAction).toHaveBeenCalledWith("funFacts");

    fireEvent.click(screen.getByRole("button", { name: /Open Resume/i }));
    expect(onOpenResume).toHaveBeenCalled();
  });

  it("disables the content buttons while sending", () => {
    render(<QuickActions disabled onAction={vi.fn()} onOpenResume={vi.fn()} />);
    expect(screen.getByRole("button", { name: /About Me/i })).toBeDisabled();
  });
});
