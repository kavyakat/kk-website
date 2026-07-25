"use client";

import { useState } from "react";
import type { ChatEntry } from "@/hooks/useAgentChat";

export default function ChatMessageView({ entry }: { entry: ChatEntry }) {
  const [showPayload, setShowPayload] = useState(false);
  const isUser = entry.role === "user";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", margin: "4px 0" }}>
      {entry.delegation && (
        <div style={{ fontSize: 10, color: "#000080", marginBottom: 2 }}>
          Kavya Agent → delegated to <b>Fun Facts Agent</b> (A2A tasks/send)
        </div>
      )}
      <div
        style={{
          maxWidth: "80%",
          fontSize: 12,
          color: "#000",
          background: isUser ? "#dfe8ff" : "#fff",
          border: "1px solid #808080",
          padding: "5px 8px",
          whiteSpace: "pre-wrap",
        }}
      >
        {entry.text}
      </div>
      {entry.delegation && (
        <>
          <button onClick={() => setShowPayload((v) => !v)} style={{ fontSize: 10, color: "#000", marginTop: 2, padding: "1px 6px" }}>
            {showPayload ? "Hide payload" : "View payload"}
          </button>
          {showPayload && (
            <pre style={{ fontSize: 10, background: "#000", color: "#0f0", padding: 6, maxWidth: "100%", overflowX: "auto", margin: "2px 0 0" }}>
              {JSON.stringify({ request: entry.delegation.request, response: entry.delegation.response }, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
