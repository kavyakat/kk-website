"use client";

import { useEffect, useState } from "react";
import { appRegistry, type AppId } from "@/lib/appRegistry";
import type { WindowState } from "@/hooks/useWindowManager";
import { contactLinks } from "@/data/content";
import { useTheme } from "@/hooks/useTheme";
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
  const { theme } = useTheme();
  const xp = theme === "winxp";
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  const openApps = appRegistry.filter((app) => windows[app.id]?.open);

  const socialStyle: React.CSSProperties = xp
    ? { display: "flex", alignItems: "center", padding: 3, background: "#fff", borderRadius: 3, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.15)" }
    : { display: "flex", alignItems: "center", padding: 2 };

  return (
    <>
    {startOpen && (
      <div
        style={{ position: "fixed", inset: 0, zIndex: 299 }}
        onClick={() => setStartOpen(false)}
      />
    )}
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: xp ? 34 : 30,
        background: xp
          ? "linear-gradient(180deg,#3f8cf3 0%,#2265e0 8%,#245edb 42%,#2158d4 90%,#1c50c8 100%)"
          : "#c0c0c0",
        borderTop: xp ? "1px solid #1042c4" : "2px solid #fff",
        display: "flex",
        alignItems: "center",
        padding: "0 4px",
        gap: 4,
        zIndex: 300,
      }}
    >
      <button
        onClick={() => setStartOpen((v) => !v)}
        style={
          xp
            ? {
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 34,
                padding: "0 22px 3px 12px",
                marginRight: 8,
                fontStyle: "italic",
                fontWeight: "bold",
                fontSize: 15,
                color: "#fff",
                textShadow: "1px 1px 2px rgba(0,0,0,.5)",
                border: "none",
                borderRadius: "0 12px 12px 0",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.4)",
                background: "linear-gradient(180deg,#59b158 0%,#39923a 46%,#2e8b2e 52%,#0f6d0f 100%)",
              }
            : { display: "flex", alignItems: "center", gap: 4, fontWeight: "bold", fontSize: 11, color: "#000", height: 22, padding: "0 8px" }
        }
      >
        <img
          src={xp ? "/icons/xp/start-flag.png" : "/icons/start.png"}
          alt=""
          width={xp ? 22 : 16}
          height={16}
          style={{ imageRendering: xp ? "auto" : "pixelated" }}
        />{" "}
        {xp ? "start" : "Start"}
      </button>
      {startOpen && <StartMenu isMobile={isMobile} onSelect={(id) => onSelectApp(id)} onShutDown={onShutDown} onClose={() => setStartOpen(false)} />}

      <Separator />
      <a
        href={contactLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        title="LinkedIn"
        aria-label="LinkedIn"
        style={socialStyle}
      >
        <img src="/icons/linkedin.svg" alt="" width={22} height={22} />
      </a>
      <a
        href={contactLinks.github}
        target="_blank"
        rel="noopener noreferrer"
        title="GitHub"
        aria-label="GitHub"
        style={socialStyle}
      >
        <img src="/icons/github.svg" alt="" width={22} height={22} />
      </a>
      <a
        href={contactLinks.instagram}
        target="_blank"
        rel="noopener noreferrer"
        title="Instagram"
        aria-label="Instagram"
        style={socialStyle}
      >
        <img src="/icons/instagram.svg" alt="" width={22} height={22} />
      </a>
      <Separator />

      {openApps.map((app) => (
        <button
          key={app.id}
          onClick={() => onSelectApp(app.id)}
          style={
            xp
              ? {
                  fontSize: 11,
                  color: "#fff",
                  height: 24,
                  padding: "0 10px",
                  minWidth: 100,
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid #1b52c8",
                  borderRadius: 3,
                  background: "linear-gradient(180deg,#4993f0,#2360d8)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)",
                }
              : { fontSize: 11, color: "#000", height: 22, padding: "0 10px", minWidth: 100, textAlign: "left", display: "flex", alignItems: "center", gap: 6 }
          }
        >
          <img
            src={xp ? (app.xpIconSrc ?? app.iconSrc) : app.iconSrc}
            alt=""
            width={16}
            height={16}
            style={{ imageRendering: xp ? "auto" : "pixelated" }}
          />{" "}
          {app.label}
        </button>
      ))}

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: xp ? "#fff" : "#000",
          padding: "2px 8px",
          border: xp ? "none" : "1px solid",
          borderColor: "#808080 #fff #fff #808080",
        }}
      >
        {!isMobile && <span style={{ fontSize: 12, lineHeight: 1 }} title="Volume">🔊</span>}
        <span>{time}</span>
      </div>
    </div>
    </>
  );
}
