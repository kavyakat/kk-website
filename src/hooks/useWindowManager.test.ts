import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWindowManager } from "./useWindowManager";

describe("useWindowManager", () => {
  it("opens a window with the given default position", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", { x: 10, y: 20 }));
    expect(result.current.windows.about.open).toBe(true);
    expect(result.current.windows.about.position).toEqual({ x: 10, y: 20 });
  });

  it("raises z-index above all other open windows when focused", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", { x: 0, y: 0 }));
    act(() => result.current.openWindow("skills", { x: 0, y: 0 }));
    const skillsZ = result.current.windows.skills.zIndex;
    act(() => result.current.focusWindow("about"));
    expect(result.current.windows.about.zIndex).toBeGreaterThan(skillsZ);
  });

  it("re-opening an already-open window focuses it instead of resetting its position", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", { x: 10, y: 20 }));
    act(() => result.current.moveWindow("about", { x: 99, y: 99 }));
    act(() => result.current.openWindow("about", { x: 10, y: 20 }));
    expect(result.current.windows.about.position).toEqual({ x: 99, y: 99 });
  });

  it("minimizing hides the window without closing it", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", { x: 0, y: 0 }));
    act(() => result.current.minimizeWindow("about"));
    expect(result.current.windows.about.open).toBe(true);
    expect(result.current.windows.about.minimized).toBe(true);
  });

  it("closing sets open to false", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", { x: 0, y: 0 }));
    act(() => result.current.closeWindow("about"));
    expect(result.current.windows.about.open).toBe(false);
  });
});
