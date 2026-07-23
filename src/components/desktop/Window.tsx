"use client";

import { useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";

interface WindowProps {
  title: string;
  isFocused: boolean;
  isMobile: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMove: (position: { x: number; y: number }) => void;
  children: ReactNode;
}

export default function Window({
  title,
  isFocused,
  isMobile,
  position,
  size,
  onFocus,
  onClose,
  onMinimize,
  onMove,
  children,
}: WindowProps) {
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const handleTitlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isMobile) return;
    onFocus();
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: position.x, originY: position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleTitlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    onMove({ x: dragState.current.originX + dx, y: dragState.current.originY + dy });
  };

  const handleTitlePointerUp = () => {
    dragState.current = null;
  };

  const style = isMobile
    ? { position: "fixed" as const, inset: 0, zIndex: isFocused ? 100 : 1 }
    : {
        position: "absolute" as const,
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isFocused ? 100 : 1,
      };

  return (
    <div className="window" style={style} onMouseDown={onFocus}>
      <div
        className="title-bar"
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        style={{ cursor: isMobile ? "default" : "move" }}
      >
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize} />
          <button aria-label="Close" onClick={onClose} />
        </div>
      </div>
      <div className="window-body" style={{ height: isMobile ? "calc(100% - 33px)" : size.height - 33, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
