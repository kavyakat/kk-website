"use client";

import { useEffect } from "react";

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_DURATION_MS = 3400;

const FLAG_COLORS = ["#ff3b30", "#4cd964", "#007aff", "#ffcc00"];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, BOOT_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div
      role="button"
      aria-label="Skip boot sequence"
      onClick={onComplete}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 4,
            width: 96,
            height: 96,
            transform: "perspective(300px) rotateY(-18deg)",
          }}
        >
          {FLAG_COLORS.map((c) => (
            <div key={c} style={{ background: c, borderRadius: 2 }} />
          ))}
        </div>
        <div style={{ color: "#fff", fontFamily: "Arial, sans-serif", lineHeight: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 400 }}>Microsoft</div>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2 }}>Windows98</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 56,
          width: 260,
          height: 16,
          border: "2px solid",
          borderColor: "#808080 #fff #fff #808080",
          background: "#000",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "25%",
            background: "linear-gradient(90deg, #001a4d, #3b7dff, #001a4d)",
            animation: "boot-bar 1.6s linear infinite",
          }}
        />
      </div>

      <div style={{ marginTop: 40, color: "#8a8a8a", fontFamily: "Arial, sans-serif", fontSize: 12 }}>
        click anywhere to skip
      </div>
    </div>
  );
}
