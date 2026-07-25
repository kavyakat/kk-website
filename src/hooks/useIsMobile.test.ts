import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsMobile } from "./useIsMobile";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("useIsMobile", () => {
  it("returns true when the viewport matches the mobile query", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false when the viewport does not match the mobile query", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
