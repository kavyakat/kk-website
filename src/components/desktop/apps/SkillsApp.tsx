"use client";

import { useTheme, type Theme } from "@/hooks/useTheme";
import { useCharacter } from "@/hooks/useCharacter";
import { useWallpaper } from "@/hooks/useWallpaper";
import { WALLPAPERS } from "@/data/wallpapers";
import { characters } from "@/lib/agents/characters";

const LABEL_W = 100;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
      <span style={{ width: LABEL_W, flexShrink: 0, color: "#555", fontSize: 12, paddingTop: 3 }}>{label}:</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export default function SkillsApp() {
  const { theme, setTheme } = useTheme();
  const { character, setCharacter } = useCharacter();
  const { wallpaperId, setWallpaper } = useWallpaper();
  const xp = theme === "winxp";
  const osName = xp ? "Kavya OS XP" : "Kavya OS 98";
  const osBuild = xp ? "Luna Edition · Build 5.1.2600" : "Second Edition · Build 4.10.1998";
  const wallpaperOptions = WALLPAPERS[theme];

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

        <Row label="Background">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {wallpaperOptions.map((w) => {
              const selected = w.id === wallpaperId;
              return (
                <button
                  key={w.id}
                  aria-label={w.label}
                  aria-pressed={selected}
                  onClick={() => setWallpaper(w.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    background: "transparent",
                    border: "none",
                    padding: 2,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 38,
                      background: w.background,
                      border: selected
                        ? "2px solid #000080"
                        : "2px solid #808080",
                      boxShadow: selected ? "0 0 0 1px #fff inset" : undefined,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 10, color: selected ? "#000080" : "#555", fontWeight: selected ? 700 : 400 }}>
                    {w.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Row>

        <div style={{ color: "#777", fontSize: 11, marginTop: 4 }}>
          Changes apply instantly.
        </div>
      </div>
    </div>
  );
}
