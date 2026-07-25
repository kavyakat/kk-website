"use client";

import { useState, useCallback } from "react";
import type { ChatRequest, ChatResponse, Delegation } from "@/lib/agents/types";

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

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [resting, setResting] = useState(false);

  const send = useCallback(async (body: ChatRequest) => {
    const userText = body.text?.trim() || (body.action ? LABELS[body.action] : "");
    if (!userText || sending) return;

    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: userText }]);
    setSending(true);
    try {
      const res = await fetch("/api/agents/kavya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as ChatResponse;
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
  }, [sending]);

  return { messages, sending, resting, send };
}
