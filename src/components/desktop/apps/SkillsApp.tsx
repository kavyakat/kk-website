"use client";

import { useState } from "react";
import { skills } from "@/data/skills";

const PILL_COLORS = ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#d35400", "#16a085", "#2c3e50", "#b7950b"];

function pillColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return PILL_COLORS[hash % PILL_COLORS.length];
}

export default function SkillsApp() {
  const [activeTab, setActiveTab] = useState(0);
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
      </div>
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
    </div>
  );
}
