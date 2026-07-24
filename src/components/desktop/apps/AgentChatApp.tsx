"use client";

import { useState } from "react";
import type { AppId } from "@/lib/appRegistry";
import { characters, type Character } from "@/lib/agents/characters";
import { useAgentChat } from "@/hooks/useAgentChat";
import { DOCK_SIZE } from "../DesktopBuddy";
import CharacterPicker from "./chat/CharacterPicker";
import QuickActions from "./chat/QuickActions";
import ChatMessageView from "./chat/ChatMessageView";

const MAX_INPUT = 200;

interface AgentChatAppProps {
  onLaunchApp: (id: AppId) => void;
  character: Character;
  onChangeCharacter: (character: Character) => void;
}

export default function AgentChatApp({ onLaunchApp, character, onChangeCharacter }: AgentChatAppProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sending, resting, send } = useAgentChat();

  if (pickerOpen) {
    return (
      <CharacterPicker
        onPick={(id) => {
          onChangeCharacter(characters.find((c) => c.id === id)!);
          setPickerOpen(false);
        }}
      />
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    send({ text });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#c0c0c0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 6, borderBottom: "1px solid #808080" }}>
        <span aria-hidden style={{ width: DOCK_SIZE, height: DOCK_SIZE, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#000" }}>{character.name} &mdash; Kavya&apos;s assistant</span>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          style={{ marginLeft: "auto", fontSize: 11, color: "#000", padding: "2px 8px" }}
        >
          Change assistant
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 8, background: "#fff", border: "1px solid #808080", margin: 6 }}>
        <div style={{ fontSize: 12, color: "#333", fontStyle: "italic", marginBottom: 6 }}>{character.greeting}</div>
        {messages.map((m) => (
          <ChatMessageView key={m.id} entry={m} />
        ))}
        {sending && <div style={{ fontSize: 11, color: "#666" }}>…thinking</div>}
        {resting && (
          <div style={{ fontSize: 12, color: "#800", marginTop: 8 }}>
            The agents are resting for today — please come back tomorrow.
          </div>
        )}
      </div>

      <QuickActions disabled={sending || resting} onAction={(a) => send({ action: a })} onOpenResume={() => onLaunchApp("resume")} />

      <form onSubmit={submit} style={{ display: "flex", gap: 4, padding: 6, borderTop: "1px solid #808080" }}>
        <input
          value={input}
          maxLength={MAX_INPUT}
          disabled={sending || resting}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything…"
          aria-label="Message"
          style={{ flex: 1, fontSize: 12, padding: "3px 6px" }}
        />
        <button type="submit" disabled={sending || resting} style={{ fontSize: 11, color: "#000", padding: "3px 10px" }}>
          Send
        </button>
      </form>
    </div>
  );
}
