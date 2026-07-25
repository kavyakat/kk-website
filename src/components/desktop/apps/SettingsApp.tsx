"use client";

import { useTheme } from "@/hooks/useTheme";

export default function SettingsApp({ onClose }: { onClose?: () => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ padding: 12, fontSize: 12, color: "#000", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
      <fieldset style={{ padding: 10 }}>
        <legend>Appearance</legend>

        <div style={{ background: theme === "winxp" ? "#5a8bd6" : "#008080", border: "2px solid", borderColor: "#808080 #fff #fff #808080", height: 90, marginBottom: 10, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: "#c0c0c0", border: "2px solid", borderColor: "#fff #000 #000 #fff", margin: 8, padding: "3px 10px", fontSize: 11 }}>
            Inactive Window
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ width: 60 }}>Scheme:</span>
          <span>{theme === "winxp" ? "Windows XP (Luna)" : "Windows Standard"}</span>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <input type="radio" name="theme" checked={theme === "win98"} onChange={() => setTheme("win98")} />
          Windows 98
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="radio" name="theme" checked={theme === "winxp"} onChange={() => setTheme("winxp")} />
          Windows XP
        </label>
      </fieldset>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 6, paddingTop: 10 }}>
        <button type="button" onClick={onClose} style={{ minWidth: 75 }}>OK</button>
        <button type="button" onClick={onClose} style={{ minWidth: 75 }}>Cancel</button>
      </div>
    </div>
  );
}
