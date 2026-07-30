import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./groq", () => ({ callGroq: vi.fn(async () => "Direct answer about Kavya.") }));
vi.mock("./openai", () => ({ callOpenAI: vi.fn(async () => "Flirty reply.") }));
vi.mock("./funFactsAgent", () => ({
  handleFunFactsTask: vi.fn(async (req) => ({
    jsonrpc: "2.0",
    id: req.id,
    result: { status: "completed", message: { role: "agent", parts: [{ type: "text", text: "Table tennis answer." }] } },
  })),
}));

import { runCoordinator } from "./coordinator";
import { callGroq } from "./groq";
import { callOpenAI } from "./openai";
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

  it("returns flirty:true and a canned reply when message contains 'qt' as a word", async () => {
    const res = await runCoordinator({ text: "hey qt" });
    expect(res.flirty).toBe(true);
    expect(res.agent).toBe("kavya");
    expect(res.reply.length).toBeGreaterThan(0);
    expect(callGroq).not.toHaveBeenCalled();
    expect(callOpenAI).not.toHaveBeenCalled();
  });

  it("routes to Groq when flirty is true", async () => {
    const res = await runCoordinator({ text: "hello", flirty: true });
    expect(res.agent).toBe("kavya");
    expect(callGroq).toHaveBeenCalled();
    expect(callOpenAI).not.toHaveBeenCalled();
  });

  it("passes history to callGroq", async () => {
    const history = [
      { role: "user" as const, content: "prev" },
      { role: "assistant" as const, content: "reply" },
    ];
    await runCoordinator({ text: "hello", history });
    expect(callGroq).toHaveBeenCalledWith(expect.any(String), "hello", history);
  });

  it("passes history to callGroq in flirty mode", async () => {
    const history = [
      { role: "user" as const, content: "prev" },
      { role: "assistant" as const, content: "reply" },
    ];
    await runCoordinator({ text: "hello", flirty: true, history });
    expect(callGroq).toHaveBeenCalledWith(expect.any(String), "hello", history, 0.75);
  });

  it("routes to OpenAI when flirty and model is openai", async () => {
    const res = await runCoordinator({ text: "hello", flirty: true, model: "openai" });
    expect(res.agent).toBe("kavya");
    expect(callOpenAI).toHaveBeenCalled();
    expect(callGroq).not.toHaveBeenCalled();
  });

  it("routes to Groq when flirty and model is groq (default)", async () => {
    const res = await runCoordinator({ text: "hello", flirty: true, model: "groq" });
    expect(res.agent).toBe("kavya");
    expect(callGroq).toHaveBeenCalled();
    expect(callOpenAI).not.toHaveBeenCalled();
  });
});
