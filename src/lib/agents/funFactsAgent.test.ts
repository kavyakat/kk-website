import { describe, it, expect, vi } from "vitest";

vi.mock("./groq", () => ({ callGroq: vi.fn(async () => "Kavya plays for TTC 1992 München.") }));

import { handleFunFactsTask } from "./funFactsAgent";
import type { JsonRpcRequest } from "./types";

const req: JsonRpcRequest = {
  jsonrpc: "2.0",
  id: "abc",
  method: "tasks/send",
  params: { message: { role: "user", parts: [{ type: "text", text: "What club?" }] } },
};

describe("handleFunFactsTask", () => {
  it("returns a completed JSON-RPC response echoing the id", async () => {
    const res = await handleFunFactsTask(req);
    expect(res.jsonrpc).toBe("2.0");
    expect(res.id).toBe("abc");
    expect(res.result.status).toBe("completed");
    expect(res.result.message.parts[0].text).toMatch(/TTC 1992/);
  });
});
