import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatMessageView from "./ChatMessageView";
import type { ChatEntry } from "@/hooks/useAgentChat";

const delegated: ChatEntry = {
  id: "1",
  role: "agent",
  text: "Kavya plays for TTC 1992 München.",
  agent: "funFacts",
  delegation: {
    to: "funFacts",
    request: { jsonrpc: "2.0", id: "r1", method: "tasks/send", params: { message: { role: "user", parts: [{ type: "text", text: "club?" }] } } },
    response: { jsonrpc: "2.0", id: "r1", result: { status: "completed", message: { role: "agent", parts: [{ type: "text", text: "TTC" }] } } },
  },
};

describe("ChatMessageView", () => {
  it("shows a delegation badge and reveals the raw JSON-RPC payload on toggle", () => {
    render(<ChatMessageView entry={delegated} />);
    expect(screen.getByText(/Fun Facts Agent/i)).toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: /view payload/i });
    fireEvent.click(toggle);
    expect(screen.getAllByText(/tasks\/send/)).toHaveLength(2);
  });

  it("renders a plain user message with no delegation UI", () => {
    render(<ChatMessageView entry={{ id: "2", role: "user", text: "hello" }} />);
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /view payload/i })).toBeNull();
  });
});
