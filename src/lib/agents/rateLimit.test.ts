import { describe, it, expect, vi, afterEach } from "vitest";
import { checkRateLimit } from "./rateLimit";

afterEach(() => vi.unstubAllGlobals());

function withUpstash() {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.test");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "tok");
}

describe("checkRateLimit", () => {
  it("allows when Upstash is not configured (dev)", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const r = await checkRateLimit("1.2.3.4");
    expect(r.allowed).toBe(true);
  });

  it("allows when both counters are under their caps", async () => {
    withUpstash();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: 1 }) }));
    const r = await checkRateLimit("1.2.3.4");
    expect(r.allowed).toBe(true);
  });

  it("blocks with reason 'ip' when the per-IP counter exceeds the cap", async () => {
    withUpstash();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result: 999 }) }));
    const r = await checkRateLimit("1.2.3.4");
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe("ip");
  });
});
