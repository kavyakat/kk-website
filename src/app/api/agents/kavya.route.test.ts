import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/agents/rateLimit", () => ({ checkRateLimit: vi.fn(async () => ({ allowed: true })) }));
vi.mock("@/lib/agents/coordinator", () => ({
  runCoordinator: vi.fn(async () => ({ reply: "hi", agent: "kavya" })),
  isBye: vi.fn(() => false),
  isQT: vi.fn(() => false),
}));
vi.mock("@/lib/agents/qtState", () => ({
  setActiveSession: vi.fn().mockResolvedValue(undefined),
  setPending: vi.fn().mockResolvedValue(undefined),
  checkHumanLive: vi.fn().mockResolvedValue(false),
  checkAiMode: vi.fn().mockResolvedValue(false),
  clearAiMode: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/agents/telegram", () => ({
  sendTelegramMessage: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./kavya/route";
import { checkRateLimit } from "@/lib/agents/rateLimit";
import { runCoordinator, isBye, isQT } from "@/lib/agents/coordinator";
import { checkHumanLive, checkAiMode, clearAiMode } from "@/lib/agents/qtState";

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

  it("intercepts qt activation messages (hey qt) before flirty mode is set", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(isQT).mockReturnValue(true);

    const req = new Request("http://localhost/api/agents/kavya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "hey qt" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.status).toBe("pending");
    expect(data.sessionId).toBeDefined();
    expect(runCoordinator).not.toHaveBeenCalled();
  });

  it("clears ai_mode on fresh qt trigger", async () => {
    vi.mocked(isQT).mockReturnValue(true);
    const req = new Request("http://localhost/api/agents/kavya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "hey qt" }),
    });
    await POST(req);
    expect(clearAiMode).toHaveBeenCalled();
  });

  it("skips to AI immediately when ai_mode is set and human is not live", async () => {
    vi.mocked(isQT).mockReturnValue(false);
    vi.mocked(checkHumanLive).mockResolvedValue(false);
    vi.mocked(checkAiMode).mockResolvedValue(true);
    vi.mocked(runCoordinator).mockResolvedValue({ reply: "AI reply", agent: "kavya" });

    const req = new Request("http://localhost/api/agents/kavya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "how are you?", flirty: true }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.status).toBeUndefined();
    expect(data.reply).toBe("AI reply");
    expect(runCoordinator).toHaveBeenCalled();
  });

  it("still creates pending when human is live even if ai_mode is set", async () => {
    vi.mocked(isQT).mockReturnValue(false);
    vi.mocked(checkHumanLive).mockResolvedValue(true);
    vi.mocked(checkAiMode).mockResolvedValue(true);

    const req = new Request("http://localhost/api/agents/kavya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "hey", flirty: true }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.status).toBe("pending");
    expect(runCoordinator).not.toHaveBeenCalled();
  });
});
