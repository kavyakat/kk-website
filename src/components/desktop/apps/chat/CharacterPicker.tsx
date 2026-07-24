"use client";

import { characters, type Character } from "@/lib/agents/characters";
import Avatar from "./Avatar";

export default function CharacterPicker({ onPick }: { onPick: (id: Character["id"]) => void }) {
  return (
    <div style={{ padding: 16, height: "100%", overflowY: "auto", background: "#c0c0c0", color: "#000" }}>
      <p style={{ fontSize: 12, marginBottom: 12 }}>Choose your assistant:</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {characters.map((c) => (
          <button
            key={c.id}
            onClick={() => onPick(c.id)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: 10, fontSize: 12, color: "#000" }}
          >
            <Avatar character={c} size={40} />
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
