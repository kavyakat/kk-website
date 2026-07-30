"use client";

import { useState, useCallback } from "react";
import type { ChatRequest, ChatResponse, Delegation, HistoryEntry } from "@/lib/agents/types";

export interface ChatEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  agent?: "kavya" | "funFacts";
  delegation?: Delegation;
}

const LABELS: Record<string, string> = {
  about: "Tell me about Kavya",
  experience: "What's his experience?",
  skills: "What are his skills?",
  funFacts: "Any fun facts? 🏓",
};

function toHistory(messages: ChatEntry[]): HistoryEntry[] {
  return messages.map((m) => ({
    role: m.role === "agent" ? "assistant" : "user",
    content: m.text,
  }));
}

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [resting, setResting] = useState(false);
  const [flirtyMode, setFlirtyMode] = useState(false);
  const [qtModel, setQtModel] = useState<"groq" | "openai">("groq");

  const send = useCallback(async (body: ChatRequest) => {
    const userText = body.text?.trim() || (body.action ? LABELS[body.action] : "");
    if (!userText || sending) return;

    setMessages((m) => {
      const next = [...m, { id: crypto.randomUUID(), role: "user" as const, text: userText }];
      return next;
    });

    setSending(true);
    try {
      const history = toHistory(messages);
      const res = await fetch("/api/agents/kavya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          flirty: flirtyMode || undefined,
          model: flirtyMode ? qtModel : undefined,
          history: history.length ? history : undefined,
        }),
      });
      const data = (await res.json()) as ChatResponse;
      if (data.flirty) setFlirtyMode(true);
      if (data.resting) { setResting(true); return; }
      const text = res.status === 429
        ? "The agents are catching their breath — please try again in a minute."
        : data.reply || "Sorry, I couldn't answer that one.";
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "agent", text, agent: data.agent, delegation: data.delegation },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "agent", text: "Something went wrong reaching the agents." },
      ]);
    } finally {
      setSending(false);
    }
  }, [sending, flirtyMode, qtModel, messages]);

  return { messages, sending, resting, send, flirtyMode, qtModel, setQtModel };
}
