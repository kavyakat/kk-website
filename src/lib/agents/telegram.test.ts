import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(() => vi.unstubAllGlobals());

describe("sendTelegramMessage", () => {
  it("posts to the correct Bot API URL with the right body", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token");
    vi.stubEnv("TELEGRAM_CHAT_ID", "12345");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    const { sendTelegramMessage } = await import("./telegram");
    await sendTelegramMessage("hello qt");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.telegram.org/bottest-token/sendMessage");
    const body = JSON.parse(init.body);
    expect(body).toEqual({ chat_id: "12345", text: "hello qt" });
  });

  it("throws when TELEGRAM_BOT_TOKEN is missing", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.stubEnv("TELEGRAM_CHAT_ID", "12345");
    const { sendTelegramMessage } = await import("./telegram");
    await expect(sendTelegramMessage("hello")).rejects.toThrow("TELEGRAM_BOT_TOKEN");
  });

  it("throws when Telegram API returns non-ok", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token");
    vi.stubEnv("TELEGRAM_CHAT_ID", "12345");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400 }));
    const { sendTelegramMessage } = await import("./telegram");
    await expect(sendTelegramMessage("hello")).rejects.toThrow("Telegram 400");
  });
});
