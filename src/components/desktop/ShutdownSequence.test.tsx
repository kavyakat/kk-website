import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen, act } from "@testing-library/react";
import ShutdownSequence from "./ShutdownSequence";

describe("ShutdownSequence", () => {
  it("reaches the safe-to-turn-off screen and reboots on click", () => {
    vi.useFakeTimers();
    const onReboot = vi.fn();
    render(<ShutdownSequence onReboot={onReboot} />);

    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(550);
      });
    }

    const powerOn = screen.getByRole("button", { name: /power on/i });
    fireEvent.click(powerOn);
    expect(onReboot).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
