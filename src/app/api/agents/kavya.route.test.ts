import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/agents/rateLimit", () => ({ checkRateLimit: vi.fn(async () => ({ allowed: true })) }));
vi.mock("@/lib/agents/coordinator", () => ({
  runCoordinator: vi.fn(async () => ({ reply: "hi", agent: "kavya" })),
}));

import { POST } from "./kavya/route";
import { checkRateLimit } from "@/lib/agents/rateLimit";

beforeEach(() => vi.clearAllMocks());

function post(body: unknown) {
  return POST(new Request("http://x/api/agents/kavya", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "x-forwarded-for": "9.9.9.9" },
  }));
}

describe("kavya route", () => {
  it("returns the coordinator reply on success", async () => {
    const res = await post({ action: "about" });
    expect(res.status).toBe(200);
    expect((await res.json()).reply).toBe("hi");
  });

  it("returns 429 when the per-IP limit is hit", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ allowed: false, reason: "ip" });
    const res = await post({ text: "hi" });
    expect(res.status).toBe(429);
  });

  it("returns a resting body when the daily cap is hit", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ allowed: false, reason: "daily" });
    const res = await post({ text: "hi" });
    expect(res.status).toBe(200);
    expect((await res.json()).resting).toBe(true);
  });
});
