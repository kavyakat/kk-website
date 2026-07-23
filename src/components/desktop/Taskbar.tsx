"use client";

import { useEffect, useState } from "react";
import { appRegistry, type AppId } from "@/lib/appRegistry";
import type { WindowState } from "@/hooks/useWindowManager";
import StartMenu from "./StartMenu";

interface TaskbarProps {
  isMobile: boolean;
  windows: Record<string, WindowState>;
  onSelectApp: (id: AppId) => void;
}

export default function Taskbar({ isMobile, windows, onSelectApp }: TaskbarProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  const openApps = appRegistry.filter((app) => windows[app.id]?.open);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        background: "#c0c0c0",
        borderTop: "2px solid #fff",
        display: "flex",
        alignItems: "center",
        padding: "0 4px",
        gap: 4,
        zIndex: 300,
      }}
    >
      <button onClick={() => setStartOpen((v) => !v)} style={{ fontWeight: "bold", fontSize: 11, color: "#000", height: 22, padding: "0 10px" }}>
        Start
      </button>
      {startOpen && <StartMenu isMobile={isMobile} onSelect={(id) => onSelectApp(id)} onClose={() => setStartOpen(false)} />}
      {openApps.map((app) => (
        <button
          key={app.id}
          onClick={() => onSelectApp(app.id)}
          style={{ fontSize: 11, color: "#000", height: 22, padding: "0 10px", minWidth: 100, textAlign: "left" }}
        >
          {app.icon} {app.label}
        </button>
      ))}
      <div style={{ marginLeft: "auto", fontSize: 11, color: "#000", padding: "4px 10px", border: "1px solid #808080" }}>{time}</div>
    </div>
  );
}
