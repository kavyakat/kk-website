import { useCallback, useState } from "react";
import type { AppId } from "@/lib/appRegistry";

export interface WindowState {
  open: boolean;
  minimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
}

export interface WindowManager {
  windows: Record<string, WindowState>;
  openWindow: (id: AppId, defaults: { x: number; y: number }) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  moveWindow: (id: AppId, position: { x: number; y: number }) => void;
}

const EMPTY_STATE: WindowState = { open: false, minimized: false, zIndex: 0, position: { x: 0, y: 0 } };

export function useWindowManager(): WindowManager {
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [topZ, setTopZ] = useState(1);

  const openWindow = useCallback(
    (id: AppId, defaults: { x: number; y: number }) => {
      const nextZ = topZ + 1;
      setWindows((prev) => {
        const existing = prev[id];
        if (existing && existing.open) {
          return { ...prev, [id]: { ...existing, minimized: false, zIndex: nextZ } };
        }
        return { ...prev, [id]: { open: true, minimized: false, zIndex: nextZ, position: existing?.position ?? defaults } };
      });
      setTopZ(nextZ);
    },
    [topZ]
  );

  const closeWindow = useCallback((id: AppId) => {
    setWindows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_STATE), open: false } }));
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

  return { windows, openWindow, closeWindow, minimizeWindow, focusWindow, moveWindow };
}
