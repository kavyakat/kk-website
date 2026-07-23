"use client";

import { useEffect, useState } from "react";
import { appRegistry, type AppId } from "@/lib/appRegistry";
import type { WindowState } from "@/hooks/useWindowManager";
import { contactLinks } from "@/data/content";
import StartMenu from "./StartMenu";

interface TaskbarProps {
  isMobile: boolean;
  windows: Record<string, WindowState>;
  onSelectApp: (id: AppId) => void;
  onShutDown: () => void;
}

function Separator() {
  return <div style={{ width: 0, height: 20, borderLeft: "1px solid #808080", borderRight: "1px solid #fff", margin: "0 3px" }} />;
}

export default function Taskbar({ isMobile, windows, onSelectApp, onShutDown }: TaskbarProps) {
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
      <button
        onClick={() => setStartOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: "bold", fontSize: 11, color: "#000", height: 22, padding: "0 8px" }}
      >
        <img src="/icons/start.png" alt="" width={16} height={16} style={{ imageRendering: "pixelated" }} /> Start
      </button>
      {startOpen && <StartMenu isMobile={isMobile} onSelect={(id) => onSelectApp(id)} onShutDown={onShutDown} onClose={() => setStartOpen(false)} />}

      {!isMobile && (
        <>
          <Separator />
          {appRegistry.map((app) => (
            <button
              key={app.id}
              title={app.label}
              aria-label={app.label}
              onClick={() => onSelectApp(app.id)}
              style={{ color: "#000", fontSize: 11, height: 22, padding: "0 8px", display: "flex", alignItems: "center", gap: 5 }}
            >
              <img src={app.iconSrc} alt="" width={16} height={16} style={{ imageRendering: "pixelated" }} /> {app.label}
            </button>
          ))}
          <Separator />
        </>
      )}

      {openApps.map((app) => (
        <button
          key={app.id}
          onClick={() => onSelectApp(app.id)}
          style={{ fontSize: 11, color: "#000", height: 22, padding: "0 10px", minWidth: 100, textAlign: "left", display: "flex", alignItems: "center", gap: 6 }}
        >
          <img src={app.iconSrc} alt="" width={16} height={16} style={{ imageRendering: "pixelated" }} /> {app.label}
        </button>
      ))}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: "#000",
          padding: "2px 8px",
          border: "1px solid",
          borderColor: "#808080 #fff #fff #808080",
        }}
      >
        <a
          href={contactLinks.github}
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
          aria-label="GitHub"
          style={{ fontSize: 13, lineHeight: 1, textDecoration: "none" }}
        >
          🐙
        </a>
        <a
          href={contactLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
          aria-label="LinkedIn"
          style={{ fontSize: 13, lineHeight: 1, textDecoration: "none" }}
        >
          💼
        </a>
        {!isMobile && <span style={{ fontSize: 12, lineHeight: 1 }} title="Volume">🔊</span>}
        <span>{time}</span>
      </div>
    </div>
  );
}
