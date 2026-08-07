import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/agents/rateLimit", () => ({ checkRateLimit: vi.fn(async () => ({ allowed: true })) }));
vi.mock("@/lib/agents/coordinator", () => ({
  runCoordinator: vi.fn(async () => ({ reply: "hi", agent: "kavya" })),
  isBye: vi.fn(() => false),
}));
vi.mock("@/lib/agents/qtState", () => ({
  setActiveSession: vi.fn().mockResolvedValue(undefined),
  setPending: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/agents/telegram", () => ({
  sendTelegramMessage: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./kavya/route";
import { checkRateLimit } from "@/lib/agents/rateLimit";
import { runCoordinator, isBye } from "@/lib/agents/coordinator";

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

describe("human-handoff (flirty messages)", () => {
  it("returns pending status and sessionId for flirty messages", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(runCoordinator).mockResolvedValue({ reply: "AI reply", agent: "kavya" });
    vi.mocked(isBye).mockReturnValue(false);

    const req = new Request("http://localhost/api/agents/kavya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "hey", flirty: true }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.status).toBe("pending");
    expect(data.sessionId).toBeDefined();
    expect(typeof data.sessionId).toBe("string");
    expect(runCoordinator).not.toHaveBeenCalled();
  });

  it("does NOT intercept bye messages in flirty mode (passes to coordinator)", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(runCoordinator).mockResolvedValue({ reply: "bye qt", agent: "kavya", resetFlirty: true });
    vi.mocked(isBye).mockReturnValue(true);

    const req = new Request("http://localhost/api/agents/kavya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "bye", flirty: true }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.status).toBeUndefined();
    expect(runCoordinator).toHaveBeenCalled();
  });

  it("does NOT intercept non-flirty messages", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(runCoordinator).mockResolvedValue({ reply: "Normal reply.", agent: "kavya" });
    vi.mocked(isBye).mockReturnValue(false);

    const req = new Request("http://localhost/api/agents/kavya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Where does Kavya work?" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.status).toBeUndefined();
    expect(runCoordinator).toHaveBeenCalled();
  });
});
