import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/agents/qtState", () => ({
  popHumanReply: vi.fn(),
  checkPending: vi.fn(),
  checkHumanLive: vi.fn(),
  setHumanLive: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/agents/coordinator", () => ({
  runCoordinator: vi.fn(),
  isBye: vi.fn(),
}));
vi.mock("@/lib/agents/rateLimit", () => ({ checkRateLimit: vi.fn() }));

import { POST } from "./kavya/poll/route";
import { popHumanReply, checkPending, checkHumanLive, setHumanLive } from "@/lib/agents/qtState";
import { runCoordinator } from "@/lib/agents/coordinator";

beforeEach(() => vi.clearAllMocks());

function makeRequest(body: object) {
  return new Request("http://localhost/api/agents/kavya/poll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/agents/kavya/poll", () => {
  it("returns human reply with keepPolling when reply is queued", async () => {
    vi.mocked(popHumanReply).mockResolvedValue("hey you");

    const res = await POST(makeRequest({ sessionId: "sess-1", flirty: true, text: "hey" }));
    const data = await res.json();

    expect(data.reply).toBe("hey you");
    expect(data.agent).toBe("kavya");
    expect(data.keepPolling).toBe(true);
    expect(setHumanLive).toHaveBeenCalledWith("sess-1");
    expect(runCoordinator).not.toHaveBeenCalled();
  });

  it("falls back to AI when pending TTL has expired and human not live", async () => {
    vi.mocked(popHumanReply).mockResolvedValue(null);
    vi.mocked(checkPending).mockResolvedValue(false);
    vi.mocked(checkHumanLive).mockResolvedValue(false);
    vi.mocked(runCoordinator).mockResolvedValue({ reply: "AI fallback reply.", agent: "kavya" });

    const res = await POST(makeRequest({ sessionId: "sess-1", flirty: true, text: "hey" }));
    const data = await res.json();

    expect(data.reply).toBe("AI fallback reply.");
    expect(data.aiTookOver).toBe(true);
    expect(runCoordinator).toHaveBeenCalledWith({ flirty: true, text: "hey" });
  });

  it("returns still-pending when TTL is alive and no human reply", async () => {
    vi.mocked(popHumanReply).mockResolvedValue(null);
    vi.mocked(checkPending).mockResolvedValue(true);

    const res = await POST(makeRequest({ sessionId: "sess-1", flirty: true, text: "hey" }));
    const data = await res.json();

    expect(data.status).toBe("pending");
    expect(runCoordinator).not.toHaveBeenCalled();
  });

  it("returns still-pending during drain window when human is live", async () => {
    vi.mocked(popHumanReply).mockResolvedValue(null);
    vi.mocked(checkPending).mockResolvedValue(false);
    vi.mocked(checkHumanLive).mockResolvedValue(true);

    const res = await POST(makeRequest({ sessionId: "sess-1", flirty: true, text: "hey" }));
    const data = await res.json();

    expect(data.status).toBe("pending");
    expect(runCoordinator).not.toHaveBeenCalled();
  });

  it("returns 400 when sessionId is missing", async () => {
    const res = await POST(makeRequest({ flirty: true, text: "hey" }));
    expect(res.status).toBe(400);
  });
});
