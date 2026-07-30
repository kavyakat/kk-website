import { describe, it, expect, vi, afterEach } from "vitest";
import { callOpenAI } from "./openai";

afterEach(() => vi.unstubAllGlobals());

describe("callOpenAI", () => {
  it("posts to OpenAI and returns the message content", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Hello from OpenAI" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    const out = await callOpenAI("system", "user");
    expect(out).toBe("Hello from OpenAI");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/openai\.com/);
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
  });

  it("uses gpt-4o-mini with temperature 0.9", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "reply" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    await callOpenAI("system", "user");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("gpt-4o-mini");
    expect(body.temperature).toBe(0.9);
  });

  it("includes history messages between system and user", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "reply" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    const history = [
      { role: "user" as const, content: "hi" },
      { role: "assistant" as const, content: "hellu" },
    ];
    await callOpenAI("system", "user", history);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages).toEqual([
      { role: "system", content: "system" },
      { role: "user", content: "hi" },
      { role: "assistant", content: "hellu" },
      { role: "user", content: "user" },
    ]);
  });

  it("truncates replies longer than the cap", async () => {
    const long = "x".repeat(2000);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: long } }] }),
    }));
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    const out = await callOpenAI("s", "u");
    expect(out.length).toBeLessThanOrEqual(901);
  });

  it("throws when the key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(callOpenAI("s", "u")).rejects.toThrow(/OPENAI_API_KEY/);
  });
});
