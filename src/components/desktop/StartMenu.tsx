"use client";

import { appRegistry, type AppId } from "@/lib/appRegistry";

interface StartMenuProps {
  isMobile: boolean;
  onSelect: (id: AppId) => void;
  onClose: () => void;
}

export default function StartMenu({ isMobile, onSelect, onClose }: StartMenuProps) {
  return (
    <div
      role="menu"
      style={
        isMobile
          ? { position: "fixed", inset: 0, background: "#c0c0c0", zIndex: 200, padding: 16 }
          : { position: "absolute", bottom: 30, left: 0, width: 200, background: "#c0c0c0", border: "2px solid", borderColor: "#fff #000 #000 #fff", zIndex: 200 }
      }
    >
      {isMobile && (
        <button onClick={onClose} style={{ marginBottom: 12, color: "#000" }}>
          Close
        </button>
      )}
      {appRegistry.map((app) => (
        <button
          key={app.id}
          role="menuitem"
          onClick={() => {
            onSelect(app.id);
            onClose();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            textAlign: "left",
            padding: "6px 10px",
            background: "transparent",
            border: "none",
            fontSize: 12,
            color: "#000",
          }}
        >
          <span>{app.icon}</span>
          {app.label}
        </button>
      ))}
    </div>
  );
}
