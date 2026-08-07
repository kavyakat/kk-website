# Qt Mode Human Takeover — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a message arrives in flirty/qt mode, notify Kavya via Telegram; if he replies within 30s his reply is delivered to the visitor; otherwise the AI takes over seamlessly.

**Architecture:** Flirty messages to `/api/agents/kavya` now return `{status:"pending", sessionId}` immediately, write a 30s TTL flag to Upstash Redis, and fire a Telegram notification. The frontend polls `/api/agents/kavya/poll` (POST with original body + sessionId) every 2s. The poll endpoint checks Redis for Kavya's reply (written by the Telegram webhook handler) or falls back to the AI coordinator once the TTL key expires. Kavya stays "live" (every future message notifies him) until he sends `/done` to the bot.

**Tech Stack:** Next.js 14 App Router, Upstash Redis (REST API via `fetch`), Telegram Bot API, Vitest + Testing Library, TypeScript

---

### Task 1: Extend types

**Files:**
- Modify: `src/lib/agents/types.ts`
- Modify: `src/hooks/useAgentChat.ts` (ChatEntry interface only, no logic changes)

- [ ] **Step 1: Add `status` and `sessionId` to `ChatResponse` in `src/lib/agents/types.ts`**

Replace the existing `ChatResponse` interface:

```ts
export interface ChatResponse {
  reply: string;
  agent: "kavya" | "funFacts";
  delegation?: Delegation;
  resting?: boolean;
  error?: string;
  flirty?: boolean;
  resetFlirty?: boolean;
  status?: "pending";
  sessionId?: string;
}
```

- [ ] **Step 2: Add `waiting` to `ChatEntry` in `src/hooks/useAgentChat.ts`**

Replace the existing `ChatEntry` interface:

```ts
export interface ChatEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  agent?: "kavya" | "funFacts";
  delegation?: Delegation;
  waiting?: boolean;
}
```

- [ ] **Step 3: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/agents/types.ts src/hooks/useAgentChat.ts
git commit -m "feat(qt): extend types for pending status and waiting bubble"
```

---

### Task 2: Redis helpers for qt state

**Files:**
- Create: `src/lib/agents/qtState.ts`
- Create: `src/lib/agents/qtState.test.ts`

- [ ] **Step 1: Write failing tests in `src/lib/agents/qtState.test.ts`**

```ts
import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(() => vi.unstubAllGlobals());

function mockRedis(result: unknown) {
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/agents/qtState.test.ts
```
Expected: FAIL — `qtState` module not found.

- [ ] **Step 3: Create `src/lib/agents/qtState.ts`**

```ts
function cfg() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash not configured");
  return { url, token };
}

async function redis<T = unknown>(...cmd: (string | number)[]): Promise<T> {
  const { url, token } = cfg();
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = await res.json();
  return data.result as T;
}

export async function setActiveSession(sessionId: string) {
  await redis("SET", "qt:active_session", sessionId, "EX", 3600);
}

export async function getActiveSession(): Promise<string | null> {
  return redis<string | null>("GET", "qt:active_session");
}

export async function setPending(sessionId: string) {
  await redis("SET", `qt:pending:${sessionId}`, "1", "EX", 30);
}

export async function checkPending(sessionId: string): Promise<boolean> {
  const result = await redis<string | null>("GET", `qt:pending:${sessionId}`);
  return result !== null;
}

export async function setHumanLive(sessionId: string) {
  await redis("SET", "qt:human_live", sessionId);
}

export async function checkHumanLive(): Promise<boolean> {
  const result = await redis<string | null>("GET", "qt:human_live");
  return result !== null;
}

export async function clearHumanLive() {
  await redis("DEL", "qt:human_live");
}

export async function setHumanReply(sessionId: string, text: string) {
  await redis("SET", `qt:human_reply:${sessionId}`, text, "EX", 60);
}

export async function getAndConsumeHumanReply(sessionId: string): Promise<string | null> {
  const text = await redis<string | null>("GET", `qt:human_reply:${sessionId}`);
  if (text === null) return null;
  await redis("DEL", `qt:human_reply:${sessionId}`);
  return text;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/agents/qtState.test.ts
```
Expected: all 12 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/agents/qtState.ts src/lib/agents/qtState.test.ts
git commit -m "feat(qt): Redis state helpers for human-handoff session tracking"
```

---

### Task 3: Telegram client

**Files:**
- Create: `src/lib/agents/telegram.ts`
- Create: `src/lib/agents/telegram.test.ts`

- [ ] **Step 1: Write failing tests in `src/lib/agents/telegram.test.ts`**

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/agents/telegram.test.ts
```
Expected: FAIL — `telegram` module not found.

- [ ] **Step 3: Create `src/lib/agents/telegram.ts`**

```ts
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID is not set");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) throw new Error(`Telegram ${res.status}`);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/agents/telegram.test.ts
```
Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/agents/telegram.ts src/lib/agents/telegram.test.ts
git commit -m "feat(qt): Telegram Bot API client for human-handoff notifications"
```

---

### Task 4: Export isBye from coordinator + wire human-handoff into kavya route

**Files:**
- Modify: `src/lib/agents/coordinator.ts` (export `isBye`)
- Modify: `src/app/api/agents/kavya/route.ts`
- Modify: `src/app/api/agents/kavya.route.test.ts`

- [ ] **Step 1: Export `isBye` from `src/lib/agents/coordinator.ts`**

Change the `isBye` function declaration from:
```ts
function isBye(body: ChatRequest): boolean {
```
to:
```ts
export function isBye(body: ChatRequest): boolean {
```

- [ ] **Step 2: Run existing coordinator tests to confirm they still pass**

```bash
npx vitest run src/lib/agents/coordinator.test.ts
```
Expected: all tests PASS (export doesn't break anything).

- [ ] **Step 3: Add failing tests for the human-handoff path to `src/app/api/agents/kavya.route.test.ts`**

First read the existing test file to understand its structure, then append these tests inside the existing `describe` block (or add a new nested `describe`). Add these imports at the top of the file if not already present:

```ts
vi.mock("@/lib/agents/qtState", () => ({
  setActiveSession: vi.fn().mockResolvedValue(undefined),
  setPending: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/agents/telegram", () => ({
  sendTelegramMessage: vi.fn().mockResolvedValue(undefined),
}));
```

Then add these test cases:

```ts
describe("human-handoff (flirty messages)", () => {
  it("returns pending status and sessionId for flirty messages", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(runCoordinator).mockResolvedValue({ reply: "AI reply", agent: "kavya" });

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
    // coordinator should NOT have been called
    expect(runCoordinator).not.toHaveBeenCalled();
  });

  it("does NOT intercept bye messages in flirty mode (passes to coordinator)", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true });
    vi.mocked(runCoordinator).mockResolvedValue({ reply: "bye qt", agent: "kavya", resetFlirty: true });

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
```

- [ ] **Step 4: Run the new tests to verify they fail**

```bash
npx vitest run src/app/api/agents/kavya.route.test.ts
```
Expected: the three new tests FAIL (route doesn't do human-handoff yet).

- [ ] **Step 5: Update `src/app/api/agents/kavya/route.ts`**

```ts
import { checkRateLimit } from "@/lib/agents/rateLimit";
import { runCoordinator, isBye } from "@/lib/agents/coordinator";
import { setActiveSession, setPending } from "@/lib/agents/qtState";
import { sendTelegramMessage } from "@/lib/agents/telegram";
import type { ChatRequest } from "@/lib/agents/types";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const limit = await checkRateLimit(ip);
  if (!limit.allowed) {
    if (limit.reason === "daily") {
      return Response.json({ reply: "", agent: "kavya", resting: true });
    }
    return Response.json({ reply: "", agent: "kavya", error: "rate" }, { status: 429 });
  }

  const body = (await request.json()) as ChatRequest;

  if (body.flirty && !isBye(body)) {
    const sessionId = crypto.randomUUID();
    await setActiveSession(sessionId);
    await setPending(sessionId);
    sendTelegramMessage(
      `💬 qt is messaging you\n\n"${body.text ?? ""}"\n\nReply here within 30s. Send /done when you're done.`
    ).catch(() => {});
    return Response.json({ reply: "", agent: "kavya", status: "pending", sessionId });
  }

  const result = await runCoordinator(body);
  return Response.json(result);
}
```

- [ ] **Step 6: Run all route tests to verify they pass**

```bash
npx vitest run src/app/api/agents/kavya.route.test.ts
```
Expected: all tests PASS.

- [ ] **Step 7: Run the full suite to check for regressions**

```bash
npx vitest run
```
Expected: all tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/agents/coordinator.ts src/app/api/agents/kavya/route.ts src/app/api/agents/kavya.route.test.ts
git commit -m "feat(qt): intercept flirty messages for human-handoff, notify Kavya via Telegram"
```

---

### Task 5: Poll endpoint

**Files:**
- Create: `src/app/api/agents/kavya/poll/route.ts`
- Create: `src/app/api/agents/kavya/poll.route.test.ts`

- [ ] **Step 1: Write failing tests in `src/app/api/agents/kavya/poll.route.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/agents/qtState", () => ({
  getAndConsumeHumanReply: vi.fn(),
  checkPending: vi.fn(),
  setHumanLive: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/agents/coordinator", () => ({
  runCoordinator: vi.fn(),
  isBye: vi.fn(),
}));
vi.mock("@/lib/agents/rateLimit", () => ({ checkRateLimit: vi.fn() }));

import { POST } from "./kavya/poll/route";
import { getAndConsumeHumanReply, checkPending, setHumanLive } from "@/lib/agents/qtState";
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
  it("returns human reply and sets live when reply exists in Redis", async () => {
    vi.mocked(getAndConsumeHumanReply).mockResolvedValue("hey you ❤️");

    const res = await POST(makeRequest({ sessionId: "sess-1", flirty: true, text: "hey" }));
    const data = await res.json();

    expect(data.reply).toBe("hey you ❤️");
    expect(data.agent).toBe("kavya");
    expect(setHumanLive).toHaveBeenCalledWith("sess-1");
    expect(runCoordinator).not.toHaveBeenCalled();
  });

  it("falls back to AI when pending TTL has expired", async () => {
    vi.mocked(getAndConsumeHumanReply).mockResolvedValue(null);
    vi.mocked(checkPending).mockResolvedValue(false);
    vi.mocked(runCoordinator).mockResolvedValue({ reply: "AI fallback reply.", agent: "kavya" });

    const res = await POST(makeRequest({ sessionId: "sess-1", flirty: true, text: "hey" }));
    const data = await res.json();

    expect(data.reply).toBe("AI fallback reply.");
    expect(runCoordinator).toHaveBeenCalledWith({ flirty: true, text: "hey" });
  });

  it("returns still-pending when TTL is alive and no human reply", async () => {
    vi.mocked(getAndConsumeHumanReply).mockResolvedValue(null);
    vi.mocked(checkPending).mockResolvedValue(true);

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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/app/api/agents/kavya/poll.route.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/app/api/agents/kavya/poll/route.ts`**

```ts
import { getAndConsumeHumanReply, checkPending, setHumanLive } from "@/lib/agents/qtState";
import { runCoordinator } from "@/lib/agents/coordinator";
import type { ChatRequest } from "@/lib/agents/types";

export async function POST(request: Request) {
  const { sessionId, ...chatBody } = (await request.json()) as { sessionId?: string } & ChatRequest;

  if (!sessionId) {
    return Response.json({ error: "missing sessionId" }, { status: 400 });
  }

  const humanReply = await getAndConsumeHumanReply(sessionId);
  if (humanReply !== null) {
    await setHumanLive(sessionId);
    return Response.json({ reply: humanReply, agent: "kavya" });
  }

  const stillPending = await checkPending(sessionId);
  if (stillPending) {
    return Response.json({ status: "pending" });
  }

  const result = await runCoordinator(chatBody as ChatRequest);
  return Response.json(result);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/app/api/agents/kavya/poll.route.test.ts
```
Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/agents/kavya/poll/route.ts src/app/api/agents/kavya/poll.route.test.ts
git commit -m "feat(qt): poll endpoint — deliver human reply or fall back to AI"
```

---

### Task 6: Telegram webhook handler

**Files:**
- Create: `src/app/api/agents/telegram/webhook/route.ts`
- Create: `src/app/api/agents/telegram/webhook.route.test.ts`

- [ ] **Step 1: Write failing tests in `src/app/api/agents/telegram/webhook.route.test.ts`**

```ts
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
import { getActiveSession, setHumanReply, clearHumanLive } from "@/lib/agents/qtState";
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/app/api/agents/telegram/webhook.route.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/app/api/agents/telegram/webhook/route.ts`**

```ts
import { getActiveSession, setHumanReply, setHumanLive, clearHumanLive } from "@/lib/agents/qtState";
import { sendTelegramMessage } from "@/lib/agents/telegram";

interface TelegramUpdate {
  message?: {
    from?: { id: number };
    text?: string;
  };
}

export async function POST(request: Request) {
  try {
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;
    if (!message) return Response.json({ ok: true });

    const fromId = String(message.from?.id ?? "");
    const expectedId = process.env.TELEGRAM_CHAT_ID ?? "";
    if (fromId !== expectedId) return Response.json({ ok: true });

    const text = (message.text ?? "").trim();

    if (text === "/done" || text === "/afk") {
      await clearHumanLive();
      await sendTelegramMessage("ok, AI is back 🤖");
      return Response.json({ ok: true });
    }

    const sessionId = await getActiveSession();
    if (!sessionId) {
      await sendTelegramMessage("no active qt session");
      return Response.json({ ok: true });
    }

    await setHumanReply(sessionId, text);
    await setHumanLive(sessionId);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/app/api/agents/telegram/webhook.route.test.ts
```
Expected: all 6 tests PASS.

- [ ] **Step 5: Run full suite**

```bash
npx vitest run
```
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/agents/telegram/webhook/route.ts src/app/api/agents/telegram/webhook.route.test.ts
git commit -m "feat(qt): Telegram webhook — store human replies, handle /done and /afk"
```

---

### Task 7: Update useAgentChat hook

**Files:**
- Modify: `src/hooks/useAgentChat.ts`
- Modify: `src/hooks/useAgentChat.test.ts`

- [ ] **Step 1: Add a failing test for the pending/polling path in `src/hooks/useAgentChat.test.ts`**

Add this test inside the existing `describe("useAgentChat")` block:

```ts
it("shows waiting bubble and resolves it when poll returns a reply", async () => {
  vi.useFakeTimers();

  const fetchMock = vi.fn()
    // initial send → pending
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: "pending", sessionId: "sess-1" }),
    })
    // first poll → still pending
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "pending" }),
    })
    // second poll → human reply
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "hey you ❤️", agent: "kavya" }),
    });
  vi.stubGlobal("fetch", fetchMock);

  const { result } = renderHook(() => useAgentChat());

  // set flirtyMode manually by triggering a qt greeting first
  await act(async () => {
    await result.current.send({ text: "hey qt" });
  });
  // The qt greeting returns normally (no pending) - but we need flirtyMode on
  // Instead, send directly with the mocked fetch that returns pending
  // Reset and test the pending path directly
  await act(async () => {
    // Manually set flirtyMode by sending a fake send with stubbed flirty response
  });

  // Simpler: test pending path by checking that after the initial send returns pending,
  // a waiting bubble appears
  const { result: r2 } = renderHook(() => useAgentChat());
  // Override fetchMock for this hook instance
  // Note: the hook starts with flirtyMode=false; pending only triggers on flirty=true
  // We test the polling mechanics by directly checking messages after a pending response
  
  // Advance timers to trigger polls
  await act(async () => { vi.advanceTimersByTime(2000); });
  await act(async () => { vi.advanceTimersByTime(2000); });

  vi.useRealTimers();
});
```

Actually, testing the full polling loop with the hook is complex due to flirtyMode state bootstrapping. Write a simpler, direct test for the polling resolution instead:

```ts
it("transitions from waiting bubble to real reply after poll resolves", async () => {
  vi.useFakeTimers();

  let pollCount = 0;
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (url.includes("/poll")) {
      pollCount++;
      if (pollCount < 2) {
        return Promise.resolve({ ok: true, json: async () => ({ status: "pending" }) });
      }
      return Promise.resolve({ ok: true, json: async () => ({ reply: "hey you ❤️", agent: "kavya" }) });
    }
    // initial send
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ status: "pending", sessionId: "sess-1" }),
    });
  });
  vi.stubGlobal("fetch", fetchMock);

  const { result } = renderHook(() => useAgentChat());

  // Directly call send with flirty:true (bypassing the normal flirtyMode gate
  // by passing it explicitly in the body — the hook sends it as-is to the API,
  // but the pending response path only triggers when the API returns status:"pending")
  // We test by patching the hook's internal flirtyMode through a qt greeting first.
  // For simplicity, verify the waiting state appears and resolves:
  
  // Trigger send that returns pending
  act(() => { result.current.send({ text: "hey", flirty: true } as never); });
  await act(async () => { await Promise.resolve(); });

  await waitFor(() => expect(result.current.waiting).toBe(true));
  expect(result.current.messages.some((m) => m.waiting)).toBe(true);

  // Advance timer to trigger polls
  await act(async () => { vi.advanceTimersByTime(2000); });
  await act(async () => { vi.advanceTimersByTime(2000); });

  await waitFor(() => expect(result.current.waiting).toBe(false));
  expect(result.current.messages.find((m) => m.text === "hey you ❤️")).toBeDefined();
  expect(result.current.messages.some((m) => m.waiting)).toBe(false);

  vi.useRealTimers();
});
```

- [ ] **Step 2: Run tests to verify the new test fails**

```bash
npx vitest run src/hooks/useAgentChat.test.ts
```
Expected: new test FAILS — `waiting` is not a property of the hook result yet.

- [ ] **Step 3: Rewrite `src/hooks/useAgentChat.ts` with polling logic**

```ts
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatRequest, ChatResponse, Delegation, HistoryEntry } from "@/lib/agents/types";

export interface ChatEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  agent?: "kavya" | "funFacts";
  delegation?: Delegation;
  waiting?: boolean;
}

const LABELS: Record<string, string> = {
  about: "Tell me about Kavya",
  experience: "What's his experience?",
  skills: "What are his skills?",
  funFacts: "Any fun facts? 🏓",
};

function toHistory(messages: ChatEntry[]): HistoryEntry[] {
  return messages.map((m) => ({
    role: m.role === "agent" ? "assistant" : "user",
    content: m.text,
  }));
}

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [resting, setResting] = useState(false);
  const [flirtyMode, setFlirtyMode] = useState(false);
  const [qtModel, setQtModel] = useState<"groq" | "openai">("openai");
  const [waiting, setWaiting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setWaiting(false);
  }, []);

  const startPolling = useCallback(
    (sessionId: string, originalBody: ChatRequest) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch("/api/agents/kavya/poll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, ...originalBody }),
          });
          const data = (await res.json()) as ChatResponse;
          if (data.status === "pending") return;
          stopPolling();
          setMessages((m) => [
            ...m.filter((msg) => !msg.waiting),
            {
              id: crypto.randomUUID(),
              role: "agent",
              text: data.reply || "Sorry, I couldn't answer that one.",
              agent: data.agent,
              delegation: data.delegation,
            },
          ]);
        } catch {
          // keep polling on transient errors
        }
      }, 2000);
    },
    [stopPolling]
  );

  const send = useCallback(
    async (body: ChatRequest) => {
      const userText = body.text?.trim() || (body.action ? LABELS[body.action] : "");
      if (!userText || sending) return;

      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user" as const, text: userText }]);

      setSending(true);
      try {
        const history = toHistory(messages);
        const res = await fetch("/api/agents/kavya", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            flirty: flirtyMode || undefined,
            model: flirtyMode ? qtModel : undefined,
            history: history.length ? history : undefined,
          }),
        });
        const data = (await res.json()) as ChatResponse;

        if (data.status === "pending" && data.sessionId) {
          setWaiting(true);
          setMessages((m) => [
            ...m,
            { id: crypto.randomUUID(), role: "agent", text: "checking if Kavya's around... ✨", waiting: true },
          ]);
          const enrichedBody: ChatRequest = {
            ...body,
            flirty: true,
            model: qtModel,
            history: history.length ? history : undefined,
          };
          startPolling(data.sessionId, enrichedBody);
          return;
        }

        if (data.flirty) setFlirtyMode(true);
        if (data.resetFlirty) setFlirtyMode(false);
        if (data.resting) {
          setResting(true);
          return;
        }
        const text =
          res.status === 429
            ? "The agents are catching their breath — please try again in a minute."
            : data.reply || "Sorry, I couldn't answer that one.";
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "agent", text, agent: data.agent, delegation: data.delegation },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "agent", text: "Something went wrong reaching the agents." },
        ]);
      } finally {
        setSending(false);
      }
    },
    [sending, flirtyMode, qtModel, messages, startPolling]
  );

  return { messages, sending, resting, send, flirtyMode, qtModel, setQtModel, waiting };
}
```

- [ ] **Step 4: Run hook tests to verify they pass**

```bash
npx vitest run src/hooks/useAgentChat.test.ts
```
Expected: all tests PASS.

- [ ] **Step 5: Run full suite**

```bash
npx vitest run
```
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useAgentChat.ts src/hooks/useAgentChat.test.ts
git commit -m "feat(qt): hook polls for human reply, shows waiting bubble until resolved"
```

---

### Task 8: Update AgentChatApp and Desktop

**Files:**
- Modify: `src/components/desktop/apps/AgentChatApp.tsx`
- Modify: `src/components/desktop/Desktop.tsx`

- [ ] **Step 1: Add `waiting` prop to `AgentChatApp`**

In `src/components/desktop/apps/AgentChatApp.tsx`, update the props interface to add `waiting: boolean`:

```ts
interface AgentChatAppProps {
  onLaunchApp: (id: AppId) => void;
  character: Character;
  onChangeCharacter: (character: Character) => void;
  messages: ChatEntry[];
  sending: boolean;
  resting: boolean;
  waiting: boolean;
  send: (body: ChatRequest) => void;
  flirtyMode: boolean;
  qtModel: "groq" | "openai";
  onToggleQtModel: () => void;
}
```

Update the destructuring to include `waiting`:

```ts
export default function AgentChatApp({
  onLaunchApp,
  character,
  onChangeCharacter,
  messages,
  sending,
  resting,
  waiting,
  send,
  flirtyMode,
  qtModel,
  onToggleQtModel,
}: AgentChatAppProps) {
```

- [ ] **Step 2: Render the waiting bubble and disable input while waiting**

Replace the messages section and the `…thinking` indicator. Change:

```tsx
        {messages.map((m) => (
          <ChatMessageView key={m.id} entry={m} />
        ))}
        {sending && <div style={{ fontSize: 11, color: "#666" }}>…thinking</div>}
```

to:

```tsx
        {messages.map((m) =>
          m.waiting ? (
            <div key={m.id} style={{ fontSize: 11, color: "#888", fontStyle: "italic", padding: "4px 0" }}>
              checking if Kavya&apos;s around... ✨
            </div>
          ) : (
            <ChatMessageView key={m.id} entry={m} />
          )
        )}
        {sending && !waiting && <div style={{ fontSize: 11, color: "#666" }}>…thinking</div>}
```

Update both the input and send button to disable while waiting:

```tsx
        <input
          value={input}
          maxLength={MAX_INPUT}
          disabled={sending || resting || waiting}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything…"
          aria-label="Message"
          style={{ flex: 1, fontSize: 12, padding: "3px 6px" }}
        />
        <button type="submit" disabled={sending || resting || waiting} style={{ fontSize: 11, color: "#000", padding: "3px 10px" }}>
          Send
        </button>
```

- [ ] **Step 3: Pass `waiting` from Desktop.tsx**

In `src/components/desktop/Desktop.tsx`, find the `<AgentChatApp` usage and add `waiting={chat.waiting}`:

```tsx
              <AgentChatApp
                onLaunchApp={launch}
                character={character}
                onChangeCharacter={setCharacter}
                messages={chat.messages}
                sending={chat.sending}
                resting={chat.resting}
                waiting={chat.waiting}
                send={chat.send}
                flirtyMode={chat.flirtyMode}
                qtModel={chat.qtModel}
                onToggleQtModel={() => chat.setQtModel(chat.qtModel === "groq" ? "openai" : "groq")}
              />
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/desktop/apps/AgentChatApp.tsx src/components/desktop/Desktop.tsx
git commit -m "feat(qt): waiting bubble and disabled input while polling for human reply"
```

---

### Task 9: Register Telegram webhook + add env vars to Vercel

**Files:** None (config + deployment step)

- [ ] **Step 1: Add env vars to Vercel dashboard**

Go to your Vercel project settings → Environment Variables. Add all four values from `.env.local`:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

- [ ] **Step 2: Push to main to trigger deploy**

```bash
git push origin main
```

Wait for the Vercel deploy to finish (check vercel.com dashboard or `vercel` CLI).

- [ ] **Step 3: Register the Telegram webhook**

Open this URL in your browser (replace `<TOKEN>` with your actual bot token):

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://kavyakat.de/api/agents/telegram/webhook
```

Expected response:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

- [ ] **Step 4: Smoke test**

1. Open https://kavyakat.de
2. Type "hey qt" in the agent chat — flirty mode activates with a canned greeting
3. Type any follow-up message — you should see "checking if Kavya's around... ✨"
4. Check your Telegram — the bot should have sent you the message
5. Reply in Telegram — the reply should appear in the website chat within 2s
6. Do nothing for 30s — the AI should reply instead

---

## Self-Review Checklist

- **Spec coverage:**
  - ✅ Telegram notification on flirty message
  - ✅ 30s Redis TTL pending window
  - ✅ Poll endpoint with human reply → AI fallback
  - ✅ Telegram webhook handles replies + `/done`/`/afk`
  - ✅ `qt:human_live` set on first reply, cleared on `/done`
  - ✅ Subtle waiting hint in visitor UI
  - ✅ Input disabled while waiting
  - ✅ One conversation at a time (single `qt:active_session` key)

- **Type consistency:**
  - `ChatResponse.status: "pending"` used in route.ts Task 4, poll route Task 5, hook Task 7 ✅
  - `ChatEntry.waiting` defined in Task 1, used in Task 7 (hook) and Task 8 (component) ✅
  - `setHumanLive(sessionId)` called in both poll route and webhook — consistent signature ✅
  - `isBye` exported in Task 4, imported in kavya route Task 4 ✅
