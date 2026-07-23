import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./groq", () => ({ callGroq: vi.fn(async () => "Direct answer about Kavya.") }));
vi.mock("./funFactsAgent", () => ({
  handleFunFactsTask: vi.fn(async (req) => ({
    jsonrpc: "2.0",
    id: req.id,
    result: { status: "completed", message: { role: "agent", parts: [{ type: "text", text: "Table tennis answer." }] } },
  })),
}));

import { runCoordinator } from "./coordinator";
import { callGroq } from "./groq";
import { handleFunFactsTask } from "./funFactsAgent";

beforeEach(() => vi.clearAllMocks());

describe("runCoordinator", () => {
  it("answers directly for the 'about' action without delegating", async () => {
    const res = await runCoordinator({ action: "about" });
    expect(res.agent).toBe("kavya");
    expect(res.delegation).toBeUndefined();
    expect(callGroq).toHaveBeenCalled();
    expect(handleFunFactsTask).not.toHaveBeenCalled();
  });

  it("delegates for the 'funFacts' action and attaches the JSON-RPC payload", async () => {
    const res = await runCoordinator({ action: "funFacts" });
    expect(res.agent).toBe("funFacts");
    expect(res.reply).toMatch(/Table tennis answer/);
    expect(res.delegation?.to).toBe("funFacts");
    expect(res.delegation?.request.method).toBe("tasks/send");
    expect(res.delegation?.response.result.status).toBe("completed");
    expect(handleFunFactsTask).toHaveBeenCalled();
  });

  it("delegates free text that mentions table tennis", async () => {
    const res = await runCoordinator({ text: "Does she play table tennis?" });
    expect(res.agent).toBe("funFacts");
  });

  it("answers free text about work directly", async () => {
    const res = await runCoordinator({ text: "Where does she work?" });
    expect(res.agent).toBe("kavya");
  });
});
