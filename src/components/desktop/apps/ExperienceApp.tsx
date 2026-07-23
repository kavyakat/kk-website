"use client";

import { useState } from "react";
import { experience } from "@/data/experience";

export default function ExperienceApp() {
  const [selected, setSelected] = useState(0);
  const role = experience[selected];

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: 160, borderRight: "1px solid #808080", overflowY: "auto" }}>
        {experience.map((r, i) => (
          <button
            key={`${r.company}-${r.period}`}
            onClick={() => setSelected(i)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
              padding: 6,
              background: i === selected ? "#000080" : "transparent",
              color: i === selected ? "#fff" : "#000",
              border: "none",
              fontSize: 11,
              textAlign: "left",
            }}
          >
            📁 {r.company}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, padding: 10, fontSize: 12, overflowY: "auto", color: "#000" }}>
        <p style={{ fontWeight: "bold" }}>{role.title}</p>
        <p style={{ color: "#444" }}>
          {role.company} · {role.location}
        </p>
        <p style={{ color: "#666", marginBottom: 8 }}>{role.period}</p>
        <ul style={{ paddingLeft: 16 }}>
          {role.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
