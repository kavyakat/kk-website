import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/agents/funFactsAgent", () => ({
  handleFunFactsTask: vi.fn(async (req) => ({
    jsonrpc: "2.0",
    id: req.id,
    result: { status: "completed", message: { role: "agent", parts: [{ type: "text", text: "ok" }] } },
  })),
}));

import { POST } from "./fun-facts/route";

describe("fun facts route", () => {
  it("accepts a JSON-RPC request and returns a JSON-RPC response", async () => {
    const body = {
      jsonrpc: "2.0",
      id: "1",
      method: "tasks/send",
      params: { message: { role: "user", parts: [{ type: "text", text: "hi" }] } },
    };
    const res = await POST(new Request("http://x/api/agents/fun-facts", { method: "POST", body: JSON.stringify(body) }));
    const out = await res.json();
    expect(out.result.status).toBe("completed");
    expect(out.id).toBe("1");
  });
});
