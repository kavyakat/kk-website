"use client";

import { useEffect, useState } from "react";

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = ["KAVYA-OS 98 Setup", "Loading HIMEM.SYS...", "Loading portfolio drivers...", "Starting Windows 98..."];
const LINE_DELAY_MS = 500;

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) {
      const timeout = setTimeout(onComplete, LINE_DELAY_MS);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setVisibleLines((n) => n + 1), LINE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [visibleLines, onComplete]);

  return (
    <div
      role="button"
      aria-label="Skip boot sequence"
      onClick={onComplete}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "#fff",
        fontFamily: "'Courier New', monospace",
        fontSize: 14,
        padding: 24,
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}
