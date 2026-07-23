import { useCallback, useState } from "react";
import type { AppId } from "@/lib/appRegistry";

export interface Size {
  width: number;
  height: number;
}

export interface WindowState {
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: Size;
  restore?: { position: { x: number; y: number }; size: Size };
}

export interface WindowDefaults {
  position: { x: number; y: number };
  size: Size;
}

export interface WindowManager {
  windows: Record<string, WindowState>;
  openWindow: (id: AppId, defaults: WindowDefaults) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  moveWindow: (id: AppId, position: { x: number; y: number }) => void;
  resizeWindow: (id: AppId, size: Size) => void;
  toggleMaximize: (id: AppId) => void;
}

const EMPTY_STATE: WindowState = {
  open: false,
  minimized: false,
  maximized: false,
  zIndex: 0,
  position: { x: 0, y: 0 },
  size: { width: 360, height: 260 },
};

const CASCADE_STEP = 26;
const CASCADE_WRAP = 6;

export function useWindowManager(): WindowManager {
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [topZ, setTopZ] = useState(1);

  const openWindow = useCallback(
    (id: AppId, defaults: WindowDefaults) => {
      const nextZ = topZ + 1;
      setWindows((prev) => {
        const existing = prev[id];
        if (existing && existing.open) {
          return { ...prev, [id]: { ...existing, minimized: false, zIndex: nextZ } };
        }
        const openNow = Object.values(prev).filter((w) => w.open).length;
        const offset = (openNow % CASCADE_WRAP) * CASCADE_STEP;
        const position = existing?.position ?? { x: defaults.position.x + offset, y: defaults.position.y + offset };
        return {
          ...prev,
          [id]: {
            open: true,
            minimized: false,
            maximized: false,
            zIndex: nextZ,
            position,
            size: existing?.size ?? defaults.size,
          },
        };
      });
      setTopZ(nextZ);
    },
    [topZ]
  );

  const closeWindow = useCallback((id: AppId) => {
    setWindows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_STATE), open: false, maximized: false } }));
  }, []);

  const minimizeWindow = useCallback((id: AppId) => {
    setWindows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_STATE), minimized: true } }));
  }, []);

  const focusWindow = useCallback(
    (id: AppId) => {
      const nextZ = topZ + 1;
      setWindows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_STATE), minimized: false, zIndex: nextZ } }));
      setTopZ(nextZ);
    },
    [topZ]
  );

  const moveWindow = useCallback((id: AppId, position: { x: number; y: number }) => {
    setWindows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_STATE), position } }));
  }, []);

  const resizeWindow = useCallback((id: AppId, size: Size) => {
    setWindows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_STATE), size } }));
  }, []);

  const toggleMaximize = useCallback((id: AppId) => {
    setWindows((prev) => {
      const w = prev[id] ?? EMPTY_STATE;
      if (w.maximized) {
        return {
          ...prev,
          [id]: {
            ...w,
            maximized: false,
            position: w.restore?.position ?? w.position,
            size: w.restore?.size ?? w.size,
            restore: undefined,
          },
        };
      }
      return {
        ...prev,
        [id]: { ...w, maximized: true, restore: { position: w.position, size: w.size } },
      };
    });
  }, []);

  return { windows, openWindow, closeWindow, minimizeWindow, focusWindow, moveWindow, resizeWindow, toggleMaximize };
}
