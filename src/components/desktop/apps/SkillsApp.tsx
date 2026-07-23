"use client";

import { useState } from "react";
import { skills } from "@/data/skills";

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
          <span key={tag} style={{ border: "1px solid #808080", padding: "4px 8px", fontSize: 11, color: "#000", background: "#fff" }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
