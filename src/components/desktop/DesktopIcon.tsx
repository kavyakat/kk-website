"use client";

interface DesktopIconProps {
  label: string;
  icon: string;
  isMobile: boolean;
  onOpen: () => void;
}

export default function DesktopIcon({ label, icon, isMobile, onOpen }: DesktopIconProps) {
  return (
    <button
      className="desktop-icon"
      onDoubleClick={!isMobile ? onOpen : undefined}
      onClick={isMobile ? onOpen : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: isMobile ? 80 : 74,
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: isMobile ? 32 : 24 }}>{icon}</span>
      <span style={{ color: "#fff", fontSize: 11, textShadow: "1px 1px 1px #000", textAlign: "center", lineHeight: 1.3 }}>
        {label}
      </span>
    </button>
  );
}
