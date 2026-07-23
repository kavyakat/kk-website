"use client";

import { useState, type ReactNode } from "react";
import { appRegistry, type AppId } from "@/lib/appRegistry";

interface StartMenuProps {
  isMobile: boolean;
  onSelect: (id: AppId) => void;
  onShutDown: () => void;
  onClose: () => void;
}

function MenuItem({
  icon,
  iconSrc,
  label,
  arrow,
  onClick,
  onMouseEnter,
}: {
  icon?: string;
  iconSrc?: string;
  label: string;
  arrow?: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      role="menuitem"
      onMouseEnter={() => {
        setHover(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        textAlign: "left",
        padding: "5px 14px 5px 8px",
        border: "none",
        background: hover ? "#000080" : "transparent",
        color: hover ? "#fff" : "#000",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {iconSrc ? (
        <img src={iconSrc} alt="" width={20} height={20} style={{ imageRendering: "pixelated" }} />
      ) : (
        <span style={{ fontSize: 16, width: 20, textAlign: "center", lineHeight: 1 }}>{icon}</span>
      )}
      <span style={{ flex: 1 }}>{label}</span>
      {arrow && <span style={{ fontSize: 10 }}>▶</span>}
    </button>
  );
}

const Separator = () => (
  <div style={{ height: 0, borderTop: "1px solid #808080", borderBottom: "1px solid #fff", margin: "3px 4px" }} />
);

function Panel({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "#c0c0c0",
        border: "2px solid",
        borderColor: "#fff #000 #000 #fff",
        boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function StartMenu({ isMobile, onSelect, onShutDown, onClose }: StartMenuProps) {
  const [programsOpen, setProgramsOpen] = useState(false);

  const pick = (id: AppId) => {
    onSelect(id);
    onClose();
  };

  if (isMobile) {
    return (
      <div role="menu" style={{ position: "fixed", inset: 0, background: "#c0c0c0", zIndex: 200, padding: 12, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#000" }}>Programs</span>
          <button onClick={onClose} style={{ color: "#000" }}>Close</button>
        </div>
        {appRegistry.map((app) => (
          <MenuItem key={app.id} iconSrc={app.iconSrc} label={app.label} onClick={() => pick(app.id)} />
        ))}
        <Separator />
        <MenuItem icon="🔌" label="Shut Down..." onClick={() => { onClose(); onShutDown(); }} />
      </div>
    );
  }

  return (
    <div role="menu" style={{ position: "absolute", bottom: 30, left: 0, display: "flex", zIndex: 200 }}>
      <Panel style={{ display: "flex" }}>
        <div
          style={{
            width: 28,
            background: "linear-gradient(180deg, #1084d0, #000080)",
            display: "flex",
            alignItems: "flex-end",
            padding: "10px 0",
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              color: "#fff",
              fontSize: 18,
              letterSpacing: 1,
              marginLeft: 5,
              lineHeight: 1,
            }}
          >
            <span style={{ fontWeight: 400 }}>Windows</span> <b>98</b>
          </div>
        </div>

        <div style={{ position: "relative", minWidth: 190, padding: "2px 0" }}>
          <MenuItem icon="📂" label="Programs" arrow onClick={() => setProgramsOpen((v) => !v)} onMouseEnter={() => setProgramsOpen(true)} />
          <MenuItem icon="📄" label="Documents" onClick={onClose} onMouseEnter={() => setProgramsOpen(false)} />
          <MenuItem icon="⚙️" label="Settings" onClick={onClose} onMouseEnter={() => setProgramsOpen(false)} />
          <MenuItem icon="🔍" label="Find" onClick={onClose} onMouseEnter={() => setProgramsOpen(false)} />
          <MenuItem icon="❓" label="Help" onClick={onClose} onMouseEnter={() => setProgramsOpen(false)} />
          <MenuItem icon="🏁" label="Run..." onClick={onClose} onMouseEnter={() => setProgramsOpen(false)} />
          <Separator />
          <MenuItem icon="🔌" label="Shut Down..." onClick={() => { onClose(); onShutDown(); }} onMouseEnter={() => setProgramsOpen(false)} />

          {programsOpen && (
            <Panel style={{ position: "absolute", left: "100%", top: 2, minWidth: 180, padding: "2px 0" }}>
              {appRegistry.map((app) => (
                <MenuItem key={app.id} iconSrc={app.iconSrc} label={app.label} onClick={() => pick(app.id)} />
              ))}
            </Panel>
          )}
        </div>
      </Panel>
    </div>
  );
}
