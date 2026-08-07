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

  it("setHumanReply posts SET with 60s TTL", async () => {
    mockRedis("OK");
    const fetchMock = vi.mocked(globalThis.fetch);
    const { setHumanReply } = await import("./qtState");
    await setHumanReply("sess-1", "hey you");
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body).toEqual(["SET", "qt:human_reply:sess-1", "hey you", "EX", 60]);
  });

  it("getAndConsumeHumanReply returns null when key missing", async () => {
    mockRedis(null);
    const { getAndConsumeHumanReply } = await import("./qtState");
    expect(await getAndConsumeHumanReply("sess-1")).toBeNull();
  });

  it("getAndConsumeHumanReply returns text and deletes key", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://fake.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "fake-token");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: "hey you" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ result: 1 }) });
    vi.stubGlobal("fetch", fetchMock);
    const { getAndConsumeHumanReply } = await import("./qtState");
    const reply = await getAndConsumeHumanReply("sess-1");
    expect(reply).toBe("hey you");
    const delBody = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
    expect(delBody).toEqual(["DEL", "qt:human_reply:sess-1"]);
  });
});
