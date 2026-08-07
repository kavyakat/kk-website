import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/agents/qtState", () => ({
  getActiveSession: vi.fn(),
  setHumanReply: vi.fn().mockResolvedValue(undefined),
  setHumanLive: vi.fn().mockResolvedValue(undefined),
  clearHumanLive: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/agents/telegram", () => ({
  sendTelegramMessage: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./telegram/webhook/route";
import { getActiveSession, setHumanReply, setHumanLive, clearHumanLive } from "@/lib/agents/qtState";
import { sendTelegramMessage } from "@/lib/agents/telegram";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("TELEGRAM_CHAT_ID", "99999");
});

function makeWebhookRequest(message: object) {
  return new Request("http://localhost/api/agents/telegram/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
}

describe("POST /api/agents/telegram/webhook", () => {
  it("ignores messages from unknown chat IDs", async () => {
    const req = makeWebhookRequest({ from: { id: 11111 }, text: "hello" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(setHumanReply).not.toHaveBeenCalled();
  });

  it("stores human reply for the active session", async () => {
    vi.mocked(getActiveSession).mockResolvedValue("sess-1");
    const req = makeWebhookRequest({ from: { id: 99999 }, text: "hey you ❤️" });
    await POST(req);
    expect(setHumanReply).toHaveBeenCalledWith("sess-1", "hey you ❤️");
    expect(setHumanLive).toHaveBeenCalledWith("sess-1");
  });

  it("replies 'no active session' to Kavya when none exists", async () => {
    vi.mocked(getActiveSession).mockResolvedValue(null);
    const req = makeWebhookRequest({ from: { id: 99999 }, text: "hey" });
    await POST(req);
    expect(sendTelegramMessage).toHaveBeenCalledWith("no active qt session");
    expect(setHumanReply).not.toHaveBeenCalled();
  });

  it("clears human_live and confirms on /done", async () => {
    const req = makeWebhookRequest({ from: { id: 99999 }, text: "/done" });
    await POST(req);
    expect(clearHumanLive).toHaveBeenCalled();
    expect(sendTelegramMessage).toHaveBeenCalledWith("ok, AI is back 🤖");
  });

  it("clears human_live and confirms on /afk", async () => {
    const req = makeWebhookRequest({ from: { id: 99999 }, text: "/afk" });
    await POST(req);
    expect(clearHumanLive).toHaveBeenCalled();
    expect(sendTelegramMessage).toHaveBeenCalledWith("ok, AI is back 🤖");
  });

  it("returns 200 for malformed body (no message field)", async () => {
    const req = new Request("http://localhost/api/agents/telegram/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
