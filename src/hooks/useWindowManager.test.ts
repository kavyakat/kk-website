import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWindowManager, type WindowDefaults } from "./useWindowManager";

const defaults = (x: number, y: number): WindowDefaults => ({
  position: { x, y },
  size: { width: 360, height: 260 },
});

describe("useWindowManager", () => {
  it("opens a window with the given default position and size", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", defaults(10, 20)));
    expect(result.current.windows.about.open).toBe(true);
    expect(result.current.windows.about.position).toEqual({ x: 10, y: 20 });
    expect(result.current.windows.about.size).toEqual({ width: 360, height: 260 });
  });

  it("raises z-index above all other open windows when focused", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", defaults(0, 0)));
    act(() => result.current.openWindow("skills", defaults(0, 0)));
    const skillsZ = result.current.windows.skills.zIndex;
    act(() => result.current.focusWindow("about"));
    expect(result.current.windows.about.zIndex).toBeGreaterThan(skillsZ);
  });

  it("re-opening an already-open window focuses it instead of resetting its position", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", defaults(10, 20)));
    act(() => result.current.moveWindow("about", { x: 99, y: 99 }));
    act(() => result.current.openWindow("about", defaults(10, 20)));
    expect(result.current.windows.about.position).toEqual({ x: 99, y: 99 });
  });

  it("cascades the second window's position by a fixed offset", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", defaults(40, 40)));
    act(() => result.current.openWindow("skills", defaults(40, 40)));
    expect(result.current.windows.skills.position).toEqual({ x: 66, y: 66 });
  });

  it("minimizing hides the window without closing it", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", defaults(0, 0)));
    act(() => result.current.minimizeWindow("about"));
    expect(result.current.windows.about.open).toBe(true);
    expect(result.current.windows.about.minimized).toBe(true);
  });

  it("closing sets open to false", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", defaults(0, 0)));
    act(() => result.current.closeWindow("about"));
    expect(result.current.windows.about.open).toBe(false);
  });

  it("resizeWindow updates the stored size", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", defaults(0, 0)));
    act(() => result.current.resizeWindow("about", { width: 500, height: 400 }));
    expect(result.current.windows.about.size).toEqual({ width: 500, height: 400 });
  });

  it("toggleMaximize sets maximized then restores prior geometry", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", defaults(30, 40)));
    act(() => result.current.toggleMaximize("about"));
    expect(result.current.windows.about.maximized).toBe(true);
    act(() => result.current.toggleMaximize("about"));
    expect(result.current.windows.about.maximized).toBe(false);
    expect(result.current.windows.about.position).toEqual({ x: 30, y: 40 });
    expect(result.current.windows.about.size).toEqual({ width: 360, height: 260 });
  });
});
