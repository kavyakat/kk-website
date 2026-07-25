"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

interface ShutdownSequenceProps {
  onReboot: () => void;
}

const SHUTDOWN_LINES = [
  "Saving your settings...",
  "Closing portfolio drivers...",
  "Windows is shutting down...",
];
const LINE_DELAY_MS = 550;

export default function ShutdownSequence({ onReboot }: ShutdownSequenceProps) {
  const { theme } = useTheme();
  const [visibleLines, setVisibleLines] = useState(0);
  const [safeToTurnOff, setSafeToTurnOff] = useState(false);

  useEffect(() => {
    if (visibleLines >= SHUTDOWN_LINES.length) {
      const timeout = setTimeout(() => setSafeToTurnOff(true), LINE_DELAY_MS);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setVisibleLines((n) => n + 1), LINE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [visibleLines]);

  if (theme === "winxp" && !safeToTurnOff) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "linear-gradient(180deg,#5a7edc,#2b4a9b)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          fontFamily: "Tahoma, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22 }}>
          <img src="/icons/xp/start-flag.png" alt="" width={32} height={32} /> Windows
          <span style={{ color: "#ff7a00" }}>xp</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 15 }}>Windows is shutting down&hellip;</div>
      </div>
    );
  }

  if (safeToTurnOff) {
    return (
      <div
        role="button"
        aria-label="Power on"
        onClick={onReboot}
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            color: "#e8a33d",
            fontFamily: "'Courier New', monospace",
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          It&apos;s now safe to turn off
          <br />
          your computer.
          <div style={{ marginTop: 24, fontSize: 12, color: "#888", fontWeight: "normal" }}>(click to power back on)</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "#fff",
        fontFamily: "'Courier New', monospace",
        fontSize: 14,
        padding: 24,
        zIndex: 1000,
      }}
    >
      {SHUTDOWN_LINES.slice(0, visibleLines).map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}
