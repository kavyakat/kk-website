"use client";

import { useState } from "react";
import type { Character } from "@/lib/agents/characters";

export default function Avatar({ character, size }: { character: Character; size: number }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <span
        aria-label={character.name}
        style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.5, fontWeight: 700, background: "#000080", color: "#fff", border: "1px solid #000" }}
      >
        {character.name[0]}
      </span>
    );
  }
  return (
    <img
      src={character.avatarSrc}
      alt={character.name}
      width={size}
      height={size}
      onError={() => setBroken(true)}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
