"use client";

interface DesktopIconProps {
  label: string;
  iconSrc: string;
  isMobile: boolean;
  onOpen: () => void;
}

export default function DesktopIcon({ label, iconSrc, isMobile, onOpen }: DesktopIconProps) {
  const size = isMobile ? 40 : 32;
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
      <img src={iconSrc} alt="" width={size} height={size} style={{ imageRendering: "pixelated" }} />
      <span style={{ color: "#fff", fontSize: 11, textShadow: "1px 1px 1px #000", textAlign: "center", lineHeight: 1.3 }}>
        {label}
      </span>
    </button>
  );
}
