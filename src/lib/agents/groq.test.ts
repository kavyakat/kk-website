import { describe, it, expect, vi, afterEach } from "vitest";
import { callGroq } from "./groq";

afterEach(() => vi.unstubAllGlobals());

describe("callGroq", () => {
  it("posts to Groq and returns the message content", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Hello from Groq" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("GROQ_API_KEY", "test-key");

    const out = await callGroq("system", "user");
    expect(out).toBe("Hello from Groq");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/groq\.com/);
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
  });

  it("truncates replies longer than the cap", async () => {
    const long = "x".repeat(2000);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: long } }] }),
    }));
    vi.stubEnv("GROQ_API_KEY", "test-key");

    const out = await callGroq("s", "u");
    expect(out.length).toBeLessThanOrEqual(901); // cap + ellipsis char
  });

  it("throws a friendly error when the key is missing", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    await expect(callGroq("s", "u")).rejects.toThrow(/GROQ_API_KEY/);
  });
});
