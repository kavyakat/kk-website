"use client";

import type { AppId } from "@/lib/appRegistry";

export default function HelpApp({ onLaunchApp, onClose }: { onLaunchApp?: (id: AppId) => void; onClose?: () => void }) {
  return (
    <div style={{ padding: 14, fontSize: 12, color: "#000", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
      <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>Welcome to Kavya OS 98</h2>
      <p style={{ margin: "0 0 8px" }}>
        A Windows 98 tribute portfolio for <strong>Kavya Kathuria</strong>, Senior Data &amp; AI Engineer at SAP in Munich.
      </p>
      <p style={{ margin: "0 0 8px" }}>
        Double-click the desktop icons to explore, or open the Start menu for programs and games. Drag windows around,
        minimize them, and stack them like it&apos;s 1998.
      </p>
      <p style={{ margin: "0 0 12px" }}>
        The quickest tour is below — or type <code>help</code> in the MS-DOS Prompt to chat with Kavya&apos;s agent.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => onLaunchApp?.("agents")}>Ask About Kavya</button>
        <button type="button" onClick={() => onLaunchApp?.("resume")}>Open Résumé</button>
        <button type="button" onClick={() => onLaunchApp?.("contact")}>Contact</button>
      </div>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", paddingTop: 12 }}>
        <button type="button" onClick={onClose} style={{ minWidth: 75 }}>OK</button>
      </div>
    </div>
  );
}
