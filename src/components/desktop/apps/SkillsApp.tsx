"use client";

import { Fragment } from "react";
import { useTheme, type Theme } from "@/hooks/useTheme";

const INFO: { label: string; value: string }[] = [
  { label: "Registered to", value: "Kavya Kathuria" },
  { label: "Role", value: "Senior Data Engineer & Software Developer" },
  { label: "Organization", value: "SAP — Commerce Cloud Analytics" },
  { label: "Location", value: "Munich, Germany" },
  { label: "Experience", value: "10+ years" },
];

export default function SkillsApp() {
  const { theme, setTheme } = useTheme();
  const xp = theme === "winxp";
  const osName = xp ? "Kavya OS XP" : "Kavya OS 98";
  const osVersion = xp ? "Luna Edition · Build 5.1.2600" : "Second Edition · Build 4.10.1998";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", color: "#000", fontSize: 12 }}>
      <div style={{ display: "flex", borderBottom: "1px solid #808080" }}>
        <div
          style={{
            padding: "6px 14px",
            fontSize: 11,
            background: "#c0c0c0",
            border: "1px solid #808080",
            borderBottom: "none",
            marginBottom: -1,
          }}
        >
          General
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 88 }}>
          <img
            src={xp ? "/icons/xp/start-flag.png" : "/icons/start.png"}
            alt=""
            width={56}
            height={56}
            style={{ imageRendering: xp ? "auto" : "pixelated" }}
          />
          <div style={{ fontSize: 11, color: "#555" }}>System</div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{osName}</div>
          <div style={{ color: "#555", marginBottom: 14 }}>{osVersion}</div>

          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 12, rowGap: 5 }}>
            {INFO.map((row) => (
              <Fragment key={row.label}>
                <span style={{ color: "#555", whiteSpace: "nowrap" }}>{row.label}:</span>
                <span style={{ fontWeight: 600 }}>{row.value}</span>
              </Fragment>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #808080", borderBottom: "1px solid #fff", margin: "16px 0" }} />

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700 }}>Appearance:</span>
            <select
              aria-label="Appearance"
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              style={{ fontSize: 12, padding: "2px 4px" }}
            >
              <option value="win98">Windows 98</option>
              <option value="winxp">Windows XP</option>
            </select>
          </label>
          <div style={{ color: "#555", fontSize: 11, marginTop: 6 }}>
            Choose a look for the desktop. Changes apply instantly.
          </div>
        </div>
      </div>
    </div>
  );
}
