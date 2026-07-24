"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { appRegistry } from "@/lib/appRegistry";
import { useAgentChat } from "@/hooks/useAgentChat";

const BANNER = [
  "Microsoft(R) Windows 98",
  "   (C)Copyright Kavya Kathuria 1998-2026.",
  "",
  "Type 'help' for a list of commands, or just ask me anything.",
  "",
];

export default function TerminalApp() {
  const chat = useAgentChat();
  const [lines, setLines] = useState<string[]>(BANNER);
  const [input, setInput] = useState("");
  const seenRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const msgs = chat.messages;
    if (msgs.length > seenRef.current) {
      const fresh = msgs.slice(seenRef.current).filter((m) => m.role === "agent");
      seenRef.current = msgs.length;
      if (fresh.length) setLines((l) => [...l, ...fresh.map((m) => m.text), ""]);
    }
  }, [chat.messages]);

  useEffect(() => {
    if (chat.resting) setLines((l) => [...l, "The agents are resting for today — come back tomorrow.", ""]);
  }, [chat.resting]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, chat.sending]);

  const builtin = (cmd: string): string[] | null => {
    switch (cmd) {
      case "help":
        return [
          "Commands:",
          "  help   - show this list",
          "  dir    - list programs",
          "  cls    - clear the screen",
          "  about  - about this desktop",
          "  exit   - how to quit",
          "",
          "Anything else is sent to Kavya's agent.",
          "Try: what does Kavya do at SAP?",
          "",
        ];
      case "dir":
        return [" Directory of C:\\KAVYA", "", ...appRegistry.filter((a) => !a.hidden).map((a) => `  ${a.label}`), ""];
      case "about":
        return [
          "Kavya OS 98 - a Windows 98 tribute portfolio.",
          "Kavya Kathuria, Senior Data & AI Engineer @ SAP, Munich.",
          "Ask me anything about his work.",
          "",
        ];
      case "exit":
        return ["To quit, close this window with the [X] button. :)", ""];
      default:
        return null;
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const raw = input.trim();
    setInput("");
    if (!raw) {
      setLines((l) => [...l, "C:\\KAVYA>"]);
      return;
    }
    const echo = `C:\\KAVYA>${raw}`;
    const cmd = raw.toLowerCase();
    if (cmd === "cls" || cmd === "clear") {
      setLines([]);
      return;
    }
    const out = builtin(cmd);
    if (out) {
      setLines((l) => [...l, echo, ...out]);
      return;
    }
    setLines((l) => [...l, echo]);
    chat.send({ text: raw });
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        height: "100%",
        background: "#000",
        color: "#c0c0c0",
        fontFamily: "'Courier New', monospace",
        fontSize: 13,
        padding: 8,
        boxSizing: "border-box",
      }}
    >
      <div ref={scrollRef} style={{ height: "100%", overflowY: "auto", whiteSpace: "pre-wrap", lineHeight: 1.35 }}>
        {lines.map((line, i) => (
          <div key={i}>{line || " "}</div>
        ))}
        {chat.sending && <div>…</div>}
        <form onSubmit={submit} style={{ display: "flex" }}>
          <span>{"C:\\KAVYA>"}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chat.sending || chat.resting}
            aria-label="terminal-input"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              boxShadow: "none",
              outline: "none",
              color: "#c0c0c0",
              fontFamily: "inherit",
              fontSize: "inherit",
              padding: 0,
              marginLeft: 4,
              minWidth: 0,
            }}
          />
        </form>
      </div>
    </div>
  );
}
