"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatRequest, ChatResponse, Delegation, HistoryEntry } from "@/lib/agents/types";

export interface ChatEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  agent?: "kavya" | "funFacts";
  delegation?: Delegation;
  waiting?: boolean;
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
  const [qtModel, setQtModel] = useState<"groq" | "openai">("openai");
  const [waiting, setWaiting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setWaiting(false);
  }, []);

  const startPolling = useCallback(
    (sessionId: string, originalBody: ChatRequest) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch("/api/agents/kavya/poll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, ...originalBody }),
          });
          const data = (await res.json()) as ChatResponse;
          if (data.status === "pending") return;
          stopPolling();
          if (data.flirty) setFlirtyMode(true);
          if (data.resetFlirty) setFlirtyMode(false);
          setMessages((m) => [
            ...m.filter((msg) => !msg.waiting),
            {
              id: crypto.randomUUID(),
              role: "agent",
              text: data.reply || "Sorry, I couldn't answer that one.",
              agent: data.agent,
              delegation: data.delegation,
            },
          ]);
        } catch {
          // keep polling on transient errors
        }
      }, 2000);
    },
    [stopPolling]
  );

  const send = useCallback(
    async (body: ChatRequest) => {
      const userText = body.text?.trim() || (body.action ? LABELS[body.action] : "");
      if (!userText || sending) return;

      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user" as const, text: userText }]);

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

        if (data.status === "pending" && data.sessionId) {
          if (data.flirty) setFlirtyMode(true);
          setWaiting(true);
          setMessages((m) => [
            ...m,
            { id: crypto.randomUUID(), role: "agent", text: "checking if Kavya's around... ✨", waiting: true },
          ]);
          const enrichedBody: ChatRequest = {
            ...body,
            flirty: true,
            model: qtModel,
            history: history.length ? history : undefined,
          };
          startPolling(data.sessionId, enrichedBody);
          return;
        }

        if (data.flirty) setFlirtyMode(true);
        if (data.resetFlirty) setFlirtyMode(false);
        if (data.resting) {
          setResting(true);
          return;
        }
        const text =
          res.status === 429
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
    },
    [sending, flirtyMode, qtModel, messages, startPolling]
  );

  return { messages, sending, resting, send, flirtyMode, qtModel, setQtModel, waiting };
}
