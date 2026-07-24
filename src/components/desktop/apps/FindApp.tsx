"use client";

import { useState } from "react";
import type { AppId } from "@/lib/appRegistry";

interface Result {
  name: string;
  size: string;
  open?: AppId;
}

const RESULTS: Result[] = [
  { name: "Kavya_Kathuria_Resume.pdf", size: "142 KB", open: "resume" },
  { name: "table_tennis_stats.xls", size: "27 KB" },
  { name: "reasons_to_hire_kavya.txt", size: "1,024 matches" },
  { name: "side_projects\\", size: "<DIR>" },
  { name: "munich_coffee_spots.map", size: "88 KB" },
];

export default function FindApp({ onLaunchApp, onClose }: { onLaunchApp?: (id: AppId) => void; onClose?: () => void }) {
  const [named, setNamed] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div style={{ padding: 12, fontSize: 12, color: "#000", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ width: 48 }}>Named:</span>
        <input
          value={named}
          onChange={(e) => setNamed(e.target.value)}
          aria-label="Named"
          style={{ flex: 1 }}
        />
        <button type="button" onClick={() => setSearched(true)} style={{ minWidth: 75 }}>
          Find Now
        </button>
      </div>

      <div style={{ flex: 1, background: "#fff", border: "2px solid", borderColor: "#808080 #fff #fff #808080", overflowY: "auto", padding: 2 }}>
        {!searched ? (
          <div style={{ padding: 8, color: "#666" }}>Enter a name and click Find Now.</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {RESULTS.map((r) => (
              <li
                key={r.name}
                onDoubleClick={() => r.open && onLaunchApp?.(r.open)}
                style={{ display: "flex", justifyContent: "space-between", padding: "3px 8px", cursor: r.open ? "pointer" : "default" }}
                title={r.open ? "Double-click to open" : undefined}
              >
                <span>{r.name}</span>
                <span style={{ color: "#666" }}>{r.size}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
        <span style={{ color: "#666" }}>{searched ? `${RESULTS.length} file(s) found` : ""}</span>
        <button type="button" onClick={onClose} style={{ minWidth: 75 }}>Close</button>
      </div>
    </div>
  );
}
