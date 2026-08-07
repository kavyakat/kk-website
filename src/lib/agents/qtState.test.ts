import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(() => vi.unstubAllGlobals());

function mockRedis(result: unknown) {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://fake.upstash.io");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "fake-token");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ result }) })
  );
}

describe("qtState", () => {
  it("setActiveSession posts SET with 1hr TTL", async () => {
    mockRedis("OK");
    const fetchMock = vi.mocked(globalThis.fetch);
    const { setActiveSession } = await import("./qtState");
    await setActiveSession("sess-1");
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body).toEqual(["SET", "qt:active_session", "sess-1", "EX", 3600]);
  });

  it("getActiveSession returns null when key missing", async () => {
    mockRedis(null);
    const { getActiveSession } = await import("./qtState");
    expect(await getActiveSession()).toBeNull();
  });

  it("getActiveSession returns session id when key exists", async () => {
    mockRedis("sess-1");
    const { getActiveSession } = await import("./qtState");
    expect(await getActiveSession()).toBe("sess-1");
  });

  it("setPending posts SET with 30s TTL", async () => {
    mockRedis("OK");
    const fetchMock = vi.mocked(globalThis.fetch);
    const { setPending } = await import("./qtState");
    await setPending("sess-1");
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body).toEqual(["SET", "qt:pending:sess-1", "1", "EX", 30]);
  });

  it("checkPending returns true when key exists", async () => {
    mockRedis("1");
    const { checkPending } = await import("./qtState");
    expect(await checkPending("sess-1")).toBe(true);
  });

  it("checkPending returns false when key missing", async () => {
    mockRedis(null);
    const { checkPending } = await import("./qtState");
    expect(await checkPending("sess-1")).toBe(false);
  });

  it("setHumanLive posts SET with no TTL", async () => {
    mockRedis("OK");
    const fetchMock = vi.mocked(globalThis.fetch);
    const { setHumanLive } = await import("./qtState");
    await setHumanLive("sess-1");
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body).toEqual(["SET", "qt:human_live", "sess-1"]);
  });

  it("checkHumanLive returns true when key exists", async () => {
    mockRedis("sess-1");
    const { checkHumanLive } = await import("./qtState");
    expect(await checkHumanLive()).toBe(true);
  });

  it("clearHumanLive posts DEL", async () => {
    mockRedis(1);
    const fetchMock = vi.mocked(globalThis.fetch);
    const { clearHumanLive } = await import("./qtState");
    await clearHumanLive();
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body).toEqual(["DEL", "qt:human_live"]);
  });

  it("setAiMode posts SET with 1hr TTL", async () => {
    mockRedis("OK");
    const fetchMock = vi.mocked(globalThis.fetch);
    const { setAiMode } = await import("./qtState");
    await setAiMode();
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual(["SET", "qt:ai_mode", "1", "EX", 3600]);
  });

  it("checkAiMode returns true when key exists", async () => {
    mockRedis("1");
    const { checkAiMode } = await import("./qtState");
    expect(await checkAiMode()).toBe(true);
  });

  it("checkAiMode returns false when key missing", async () => {
    mockRedis(null);
    const { checkAiMode } = await import("./qtState");
    expect(await checkAiMode()).toBe(false);
  });

  it("clearAiMode posts DEL", async () => {
    mockRedis(1);
    const fetchMock = vi.mocked(globalThis.fetch);
    const { clearAiMode } = await import("./qtState");
    await clearAiMode();
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual(["DEL", "qt:ai_mode"]);
  });

  it("pushHumanReply posts RPUSH then EXPIRE with 300s TTL", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://fake.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "fake-token");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: 1 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: 1 }) });
    vi.stubGlobal("fetch", fetchMock);
    const { pushHumanReply } = await import("./qtState");
    await pushHumanReply("sess-1", "hey you");
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual(["RPUSH", "qt:human_reply:sess-1", "hey you"]);
    expect(JSON.parse(fetchMock.mock.calls[1][1]!.body as string)).toEqual(["EXPIRE", "qt:human_reply:sess-1", 300]);
  });

  it("popHumanReply returns null when list is empty", async () => {
    mockRedis(null);
    const { popHumanReply } = await import("./qtState");
    expect(await popHumanReply("sess-1")).toBeNull();
  });

  it("popHumanReply posts LPOP and returns first item", async () => {
    mockRedis("hey you");
    const fetchMock = vi.mocked(globalThis.fetch);
    const { popHumanReply } = await import("./qtState");
    const reply = await popHumanReply("sess-1");
    expect(reply).toBe("hey you");
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual(["LPOP", "qt:human_reply:sess-1"]);
  });
});
