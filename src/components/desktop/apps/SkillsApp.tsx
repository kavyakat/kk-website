"use client";

import { useTheme, type Theme } from "@/hooks/useTheme";
import { useCharacter } from "@/hooks/useCharacter";
import { characters } from "@/lib/agents/characters";

const LABEL_W = 100;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ width: LABEL_W, flexShrink: 0, color: "#555", fontSize: 12 }}>{label}:</span>
      {children}
    </div>
  );
}

export default function SkillsApp() {
  const { theme, setTheme } = useTheme();
  const { character, setCharacter } = useCharacter();
  const xp = theme === "winxp";
  const osName = xp ? "Kavya OS XP" : "Kavya OS 98";
  const osBuild = xp ? "Luna Edition · Build 5.1.2600" : "Second Edition · Build 4.10.1998";

  const selectStyle: React.CSSProperties = {
    fontSize: 12,
    padding: "2px 4px",
    minWidth: 170,
  };

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

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 12px" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <img
            src={xp ? "/icons/xp/start-flag.png" : "/icons/start.png"}
            alt=""
            width={48}
            height={48}
            style={{ imageRendering: xp ? "auto" : "pixelated", marginTop: 2 }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{osName}</div>
            <div style={{ color: "#555", fontSize: 11 }}>{osBuild}</div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #808080", borderBottom: "1px solid #fff", marginBottom: 16 }} />

        <Row label="Appearance">
          <select
            aria-label="Appearance"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            style={selectStyle}
          >
            <option value="win98">Windows 98</option>
            <option value="winxp">Windows XP</option>
          </select>
        </Row>

        <Row label="Assistant">
          <select
            aria-label="Assistant"
            value={character.id}
            onChange={(e) => {
              const picked = characters.find((c) => c.id === e.target.value);
              if (picked) setCharacter(picked);
            }}
            style={selectStyle}
          >
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Row>

        <div style={{ color: "#777", fontSize: 11, marginTop: 4 }}>
          Changes apply instantly.
        </div>
      </div>
    </div>
  );
}
