"use client";

import { useState } from "react";
import { skills } from "@/data/skills";
import { useTheme } from "@/hooks/useTheme";

const PILL_COLORS = ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#d35400", "#16a085", "#2c3e50", "#b7950b"];

function pillColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return PILL_COLORS[hash % PILL_COLORS.length];
}

const APPEARANCE_TAB = skills.length;

export default function SkillsApp() {
  const [activeTab, setActiveTab] = useState(0);
  const { theme, setTheme } = useTheme();
  const isAppearance = activeTab === APPEARANCE_TAB;
  const group = skills[activeTab];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #808080" }}>
        {skills.map((g, i) => (
          <button
            key={g.group}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "6px 10px",
              fontSize: 11,
              color: "#000",
              background: i === activeTab ? "#c0c0c0" : "#dcdcdc",
              border: "1px solid #808080",
              marginBottom: -1,
            }}
          >
            {g.group}
          </button>
        ))}
        <button
          onClick={() => setActiveTab(APPEARANCE_TAB)}
          style={{
            padding: "6px 10px",
            fontSize: 11,
            color: "#000",
            background: isAppearance ? "#c0c0c0" : "#dcdcdc",
            border: "1px solid #808080",
            marginBottom: -1,
          }}
        >
          Appearance
        </button>
      </div>

      {isAppearance ? (
        <div style={{ padding: 12, fontSize: 12, color: "#000" }}>
          <fieldset style={{ padding: 10 }}>
            <legend>Theme</legend>

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
        </div>
      ) : (
        <div style={{ padding: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {group.tags.map((tag) => (
            <span
              key={tag}
              style={{
                border: "1px solid rgba(0,0,0,0.3)",
                borderRadius: 3,
                padding: "4px 10px",
                fontSize: 11,
                color: "#fff",
                background: pillColor(tag),
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
