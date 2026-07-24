"use client";

import type { ChatAction } from "@/lib/agents/types";

const ACTIONS: { action: ChatAction; label: string }[] = [
  { action: "about", label: "About Me" },
  { action: "experience", label: "My Experience" },
  { action: "skills", label: "My Skills" },
  { action: "funFacts", label: "Fun Facts 🏓" },
];

export default function QuickActions({
  disabled,
  onAction,
  onOpenResume,
}: {
  disabled: boolean;
  onAction: (a: ChatAction) => void;
  onOpenResume: () => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 6, borderTop: "1px solid #808080", background: "#c0c0c0" }}>
      {ACTIONS.map((a) => (
        <button key={a.action} disabled={disabled} onClick={() => onAction(a.action)} style={{ fontSize: 11, color: "#000", padding: "3px 8px" }}>
          {a.label}
        </button>
      ))}
      <button onClick={onOpenResume} style={{ fontSize: 11, color: "#000", padding: "3px 8px" }}>
        Open Resume
      </button>
    </div>
  );
}
