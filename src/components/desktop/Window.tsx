"use client";

import { useRef, type ReactNode, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import type { Size } from "@/hooks/useWindowManager";

interface WindowProps {
  title: string;
  isFocused: boolean;
  isMobile: boolean;
  maximized: boolean;
  position: { x: number; y: number };
  size: Size;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onResize: (size: Size) => void;
  children: ReactNode;
}

const MIN_W = 220;
const MIN_H = 140;
const SNAP = 16;
const TASKBAR_H = 30;

type Dir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const HANDLES: { dir: Dir; cursor: string; style: CSSProperties }[] = [
  { dir: "n", cursor: "ns-resize", style: { top: -3, left: 8, right: 8, height: 6 } },
  { dir: "s", cursor: "ns-resize", style: { bottom: -3, left: 8, right: 8, height: 6 } },
  { dir: "e", cursor: "ew-resize", style: { top: 8, bottom: 8, right: -3, width: 6 } },
  { dir: "w", cursor: "ew-resize", style: { top: 8, bottom: 8, left: -3, width: 6 } },
  { dir: "ne", cursor: "nesw-resize", style: { top: -3, right: -3, width: 12, height: 12 } },
  { dir: "nw", cursor: "nwse-resize", style: { top: -3, left: -3, width: 12, height: 12 } },
  { dir: "se", cursor: "nwse-resize", style: { bottom: -3, right: -3, width: 12, height: 12 } },
  { dir: "sw", cursor: "nesw-resize", style: { bottom: -3, left: -3, width: 12, height: 12 } },
];

export default function Window({
  title,
  isFocused,
  isMobile,
  maximized,
  position,
  size,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  onResize,
  children,
}: WindowProps) {
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const resizeState = useRef<{
    dir: Dir;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    originW: number;
    originH: number;
  } | null>(null);

  const handleTitlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (isMobile || maximized) return;
    onFocus();
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: position.x, originY: position.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleTitlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    let x = dragState.current.originX + dx;
    let y = dragState.current.originY + dy;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Snap flush to screen edges.
    if (x <= SNAP) x = 0;
    if (y <= SNAP) y = 0;
    if (x + size.width >= vw - SNAP) x = vw - size.width;
    if (y + size.height >= vh - TASKBAR_H - SNAP) y = vh - TASKBAR_H - size.height;
    // Keep the title bar reachable.
    x = Math.max(80 - size.width, Math.min(x, vw - 80));
    y = Math.max(0, Math.min(y, vh - TASKBAR_H - 24));

    onMove({ x, y });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const startResize = (dir: Dir) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onFocus();
    resizeState.current = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
      originW: size.width,
      originH: size.height,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = resizeState.current;
    if (!r) return;
    const dx = e.clientX - r.startX;
    const dy = e.clientY - r.startY;
    let newX = r.originX;
    let newY = r.originY;
    let newW = r.originW;
    let newH = r.originH;

    if (r.dir.includes("e")) newW = Math.max(MIN_W, r.originW + dx);
    if (r.dir.includes("s")) newH = Math.max(MIN_H, r.originH + dy);
    if (r.dir.includes("w")) {
      newW = Math.max(MIN_W, r.originW - dx);
      newX = r.originX + (r.originW - newW);
    }
    if (r.dir.includes("n")) {
      newH = Math.max(MIN_H, r.originH - dy);
      newY = r.originY + (r.originH - newH);
    }

    onResize({ width: newW, height: newH });
    if (newX !== r.originX || newY !== r.originY) onMove({ x: newX, y: newY });
  };

  const endResize = (e: ReactPointerEvent<HTMLDivElement>) => {
    resizeState.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const base: CSSProperties = { display: "flex", flexDirection: "column", zIndex: isFocused ? 100 : 1 };
  const style: CSSProperties =
    isMobile || maximized
      ? { ...base, position: "fixed", left: 0, top: 0, width: "100vw", height: `calc(100dvh - ${TASKBAR_H}px)` }
      : { ...base, position: "absolute", left: position.x, top: position.y, width: size.width, height: size.height };

  const canResize = !isMobile && !maximized;

  return (
    <div className="window" style={style} onMouseDown={onFocus}>
      <div
        className="title-bar"
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={endDrag}
        onDoubleClick={() => !isMobile && onToggleMaximize()}
        style={{ cursor: isMobile || maximized ? "default" : "move" }}
      >
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize} />
          {!isMobile && (
            <button aria-label={maximized ? "Restore" : "Maximize"} onClick={onToggleMaximize} />
          )}
          <button aria-label="Close" onClick={onClose} />
        </div>
      </div>
      <div className="window-body" style={{ flex: 1, margin: 0, overflow: "auto", minHeight: 0 }}>
        {children}
      </div>

      {canResize &&
        HANDLES.map((h) => (
          <div
            key={h.dir}
            onPointerDown={startResize(h.dir)}
            onPointerMove={handleResizeMove}
            onPointerUp={endResize}
            style={{ position: "absolute", cursor: h.cursor, touchAction: "none", ...h.style }}
          />
        ))}
    </div>
  );
}
