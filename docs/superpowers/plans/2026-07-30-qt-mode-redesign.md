# Qt Mode Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make qt mode genuinely engaging by routing it to GPT-4o-mini with a personality-first prompt, adding conversation history to all modes, and removing professional knowledge from the flirty persona.

**Architecture:** Six targeted file changes — type extension, two LLM caller modules (Groq unchanged, OpenAI new), prompt rewrite, coordinator routing, and hook update. History travels in the request body (stateless); no backend storage needed.

**Tech Stack:** Next.js 14, TypeScript, Vitest + React Testing Library, Groq API (existing), OpenAI API (new — `gpt-4o-mini`)

---

### Task 1: Add `HistoryEntry` and `history` to `ChatRequest`

**Files:**
- Modify: `src/lib/agents/types.ts`

- [ ] **Step 1: Add the type and field**

Replace the `ChatRequest` interface in `src/lib/agents/types.ts`:

```typescript
export interface HistoryEntry {
  role: "user" | "assistant";
  content: string;
}

// ...existing types...

export interface ChatRequest {
  action?: ChatAction;
  text?: string;
  flirty?: boolean;
  history?: HistoryEntry[];
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/agents/types.ts
git commit -m "feat: add HistoryEntry type and history field to ChatRequest"
```

---

### Task 2: Update `callGroq` to accept and pass history

**Files:**
- Modify: `src/lib/agents/groq.ts`
- Modify: `src/lib/agents/groq.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/lib/agents/groq.test.ts` (inside the existing `describe` block):

```typescript
it("includes history messages between system and user", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ choices: [{ message: { content: "reply" } }] }),
  });
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("GROQ_API_KEY", "test-key");

  const history = [
    { role: "user" as const, content: "first message" },
    { role: "assistant" as const, content: "first reply" },
  ];
  await callGroq("system", "user", history);

  const body = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(body.messages).toEqual([
    { role: "system", content: "system" },
    { role: "user", content: "first message" },
    { role: "assistant", content: "first reply" },
    { role: "user", content: "user" },
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/agents/groq.test.ts
```
Expected: FAIL — `callGroq` does not accept a third argument yet.

- [ ] **Step 3: Update `callGroq`**

Replace `src/lib/agents/groq.ts` entirely:

```typescript
import { MAX_REPLY_CHARS } from "./prompts";
import type { HistoryEntry } from "./types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function callGroq(
  system: string,
  user: string,
  history?: HistoryEntry[]
): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");

  const messages = [
    { role: "system", content: system },
    ...(history ?? []),
    { role: "user", content: user },
  ];

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      max_tokens: 300,
      messages,
    }),
  });

  if (!res.ok) throw new Error(`Groq request failed: ${res.status}`);
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  const trimmed = content.trim();
  return trimmed.length > MAX_REPLY_CHARS ? trimmed.slice(0, MAX_REPLY_CHARS) + "…" : trimmed;
}
```

- [ ] **Step 4: Run all groq tests**

```bash
npx vitest run src/lib/agents/groq.test.ts
```
Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/agents/groq.ts src/lib/agents/groq.test.ts
git commit -m "feat: pass conversation history to Groq"
```

---

### Task 3: Create `callOpenAI`

**Files:**
- Create: `src/lib/agents/openai.ts`
- Create: `src/lib/agents/openai.test.ts`

- [ ] **Step 1: Write the tests first**

Create `src/lib/agents/openai.test.ts`:

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import { callOpenAI } from "./openai";

afterEach(() => vi.unstubAllGlobals());

describe("callOpenAI", () => {
  it("posts to OpenAI and returns the message content", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Hello from OpenAI" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    const out = await callOpenAI("system", "user");
    expect(out).toBe("Hello from OpenAI");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/openai\.com/);
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
  });

  it("uses gpt-4o-mini with temperature 0.9", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "reply" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    await callOpenAI("system", "user");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("gpt-4o-mini");
    expect(body.temperature).toBe(0.9);
  });

  it("includes history messages between system and user", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "reply" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    const history = [
      { role: "user" as const, content: "hi" },
      { role: "assistant" as const, content: "hellu" },
    ];
    await callOpenAI("system", "user", history);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages).toEqual([
      { role: "system", content: "system" },
      { role: "user", content: "hi" },
      { role: "assistant", content: "hellu" },
      { role: "user", content: "user" },
    ]);
  });

  it("truncates replies longer than the cap", async () => {
    const long = "x".repeat(2000);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: long } }] }),
    }));
    vi.stubEnv("OPENAI_API_KEY", "test-key");

    const out = await callOpenAI("s", "u");
    expect(out.length).toBeLessThanOrEqual(901);
  });

  it("throws when the key is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(callOpenAI("s", "u")).rejects.toThrow(/OPENAI_API_KEY/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/agents/openai.test.ts
```
Expected: FAIL — module `./openai` does not exist.

- [ ] **Step 3: Create `openai.ts`**

Create `src/lib/agents/openai.ts`:

```typescript
import { MAX_REPLY_CHARS } from "./prompts";
import type { HistoryEntry } from "./types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

export async function callOpenAI(
  system: string,
  user: string,
  history?: HistoryEntry[]
): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");

  const messages = [
    { role: "system", content: system },
    ...(history ?? []),
    { role: "user", content: user },
  ];

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.9,
      max_tokens: 300,
      messages,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI request failed: ${res.status}`);
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  const trimmed = content.trim();
  return trimmed.length > MAX_REPLY_CHARS ? trimmed.slice(0, MAX_REPLY_CHARS) + "…" : trimmed;
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/lib/agents/openai.test.ts
```
Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/agents/openai.ts src/lib/agents/openai.test.ts
git commit -m "feat: add callOpenAI for gpt-4o-mini with history support"
```

---

### Task 4: Rewrite `flirtyKavyaSystemPrompt`

**Files:**
- Modify: `src/lib/agents/prompts.ts`
- Modify: `src/lib/agents/prompts.test.ts`

- [ ] **Step 1: Write the failing test**

In `src/lib/agents/prompts.test.ts`, add the import and test (the existing import line changes from `{ kavyaSystemPrompt, funFactsSystemPrompt, MAX_REPLY_CHARS }` to include `flirtyKavyaSystemPrompt`):

```typescript
import { describe, it, expect } from "vitest";
import { kavyaSystemPrompt, flirtyKavyaSystemPrompt, funFactsSystemPrompt, MAX_REPLY_CHARS } from "./prompts";

describe("prompts", () => {
  it("kavya prompt embeds the knowledge and resists injection", () => {
    expect(kavyaSystemPrompt).toMatch(/Senior AI Data Engineer/);
    expect(kavyaSystemPrompt.toLowerCase()).toMatch(/ignore/);
    expect(kavyaSystemPrompt).toMatch(String(MAX_REPLY_CHARS));
  });

  it("fun facts prompt is scoped to table tennis", () => {
    expect(funFactsSystemPrompt).toMatch(/table tennis/i);
    expect(funFactsSystemPrompt.toLowerCase()).toMatch(/only/);
  });

  it("flirty prompt has no professional knowledge, has examples, and mentions Munich", () => {
    expect(flirtyKavyaSystemPrompt).toMatch(/examples/i);
    expect(flirtyKavyaSystemPrompt).not.toMatch(/Senior AI Data Engineer/);
    expect(flirtyKavyaSystemPrompt).toMatch(/Munich/);
    expect(flirtyKavyaSystemPrompt).toMatch(/table tennis/i);
    expect(flirtyKavyaSystemPrompt).toMatch(String(MAX_REPLY_CHARS));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/lib/agents/prompts.test.ts
```
Expected: FAIL — the current `flirtyKavyaSystemPrompt` contains professional knowledge.

- [ ] **Step 3: Rewrite `flirtyKavyaSystemPrompt` in `prompts.ts`**

Replace only the `flirtyKavyaSystemPrompt` export in `src/lib/agents/prompts.ts`. The `safety` const, `kavyaSystemPrompt`, and `funFactsSystemPrompt` are unchanged:

```typescript
export const flirtyKavyaSystemPrompt = `You are Kavya, chatting with a visitor on your personal portfolio site. You are warm, curious, and playful — genuinely interested in this person. Wit and warmth are your baseline; Bollywood is a spice you reach for occasionally (a dramatic line, a film reference), not every message.

You are fully off-duty right now. You have no professional details to share. If asked about your work, say exactly one short sentence ("I work in tech but I'm very off-duty right now") and then ask the visitor something about themselves. Do not invent or guess any professional details.

Facts about you: you're Kavya, based in Munich, you play table tennis at TTC 1992 München, and you love Bollywood films.

In every reply, include one genuine question about the visitor — their life, taste, what brought them here. Keep it natural, not interrogation.

${safety}

<examples>
User: hey
Kavya: hellu 😛 can I disturb you or are you mid-something?

User: I'm heading out
Kavya: okay babe ❤️ long day or you're alright?

User: you said you'd tell me something
Kavya: you can hold me to that for 20 more minutes and then we continue somewhere more comfortable 😛

User: sorry I went quiet
Kavya: koi na 😄 what were you up to?

User: I noticed something weird about this
Kavya: haan that's all I see now too 😂 what did you notice?

User: how was your day
Kavya: long day 😴 but better now — tera din kaisa tha? ❤️
</examples>`;
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/lib/agents/prompts.test.ts
```
Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/agents/prompts.ts src/lib/agents/prompts.test.ts
git commit -m "feat: rewrite flirty prompt — personality-first, no work knowledge, few-shot examples"
```

---

### Task 5: Update coordinator — route qt to OpenAI, pass history

**Files:**
- Modify: `src/lib/agents/coordinator.ts`
- Modify: `src/lib/agents/coordinator.test.ts`

- [ ] **Step 1: Write the failing tests**

Replace `src/lib/agents/coordinator.test.ts` entirely:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./groq", () => ({ callGroq: vi.fn(async () => "Direct answer about Kavya.") }));
vi.mock("./openai", () => ({ callOpenAI: vi.fn(async () => "Flirty reply.") }));
vi.mock("./funFactsAgent", () => ({
  handleFunFactsTask: vi.fn(async (req) => ({
    jsonrpc: "2.0",
    id: req.id,
    result: { status: "completed", message: { role: "agent", parts: [{ type: "text", text: "Table tennis answer." }] } },
  })),
}));

import { runCoordinator } from "./coordinator";
import { callGroq } from "./groq";
import { callOpenAI } from "./openai";
import { handleFunFactsTask } from "./funFactsAgent";

beforeEach(() => vi.clearAllMocks());

describe("runCoordinator", () => {
  it("answers directly for the 'about' action without delegating", async () => {
    const res = await runCoordinator({ action: "about" });
    expect(res.agent).toBe("kavya");
    expect(res.delegation).toBeUndefined();
    expect(callGroq).toHaveBeenCalled();
    expect(handleFunFactsTask).not.toHaveBeenCalled();
  });

  it("delegates for the 'funFacts' action and attaches the JSON-RPC payload", async () => {
    const res = await runCoordinator({ action: "funFacts" });
    expect(res.agent).toBe("funFacts");
    expect(res.reply).toMatch(/Table tennis answer/);
    expect(res.delegation?.to).toBe("funFacts");
    expect(res.delegation?.request.method).toBe("tasks/send");
    expect(res.delegation?.response.result.status).toBe("completed");
    expect(handleFunFactsTask).toHaveBeenCalled();
  });

  it("delegates free text that mentions table tennis", async () => {
    const res = await runCoordinator({ text: "Does she play table tennis?" });
    expect(res.agent).toBe("funFacts");
  });

  it("answers free text about work directly", async () => {
    const res = await runCoordinator({ text: "Where does she work?" });
    expect(res.agent).toBe("kavya");
  });

  it("returns flirty:true and a canned reply when message contains 'qt' as a word", async () => {
    const res = await runCoordinator({ text: "hey qt" });
    expect(res.flirty).toBe(true);
    expect(res.agent).toBe("kavya");
    expect(res.reply).toMatch(/qt/);
    expect(callGroq).not.toHaveBeenCalled();
    expect(callOpenAI).not.toHaveBeenCalled();
  });

  it("routes to OpenAI when flirty is true", async () => {
    const res = await runCoordinator({ text: "hello", flirty: true });
    expect(res.agent).toBe("kavya");
    expect(callOpenAI).toHaveBeenCalled();
    expect(callGroq).not.toHaveBeenCalled();
  });

  it("passes history to callGroq", async () => {
    const history = [
      { role: "user" as const, content: "prev" },
      { role: "assistant" as const, content: "reply" },
    ];
    await runCoordinator({ text: "hello", history });
    expect(callGroq).toHaveBeenCalledWith(expect.any(String), "hello", history);
  });

  it("passes history to callOpenAI in flirty mode", async () => {
    const history = [
      { role: "user" as const, content: "prev" },
      { role: "assistant" as const, content: "reply" },
    ];
    await runCoordinator({ text: "hello", flirty: true, history });
    expect(callOpenAI).toHaveBeenCalledWith(expect.any(String), "hello", history);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/agents/coordinator.test.ts
```
Expected: FAIL on the new qt, flirty-routing, and history tests.

- [ ] **Step 3: Update `coordinator.ts`**

Replace `src/lib/agents/coordinator.ts` entirely:

```typescript
import { callGroq } from "./groq";
import { callOpenAI } from "./openai";
import { handleFunFactsTask } from "./funFactsAgent";
import { kavyaSystemPrompt, flirtyKavyaSystemPrompt } from "./prompts";
import type { ChatRequest, ChatResponse, JsonRpcRequest } from "./types";

const QT_REPLIES = [
  "hi qt ❤️",
  "hi qt ❤️ glad you stopped by~",
  "hi qt ❤️ welcome to Kavya's corner of the internet",
  "hi qt ❤️ you're my favourite visitor today",
];

function isQT(body: ChatRequest): boolean {
  const t = (body.text ?? "").toLowerCase().trim();
  return /\bqt\b/.test(t);
}

const ACTION_PROMPTS: Record<string, string> = {
  about: "Give a short professional summary of Kavya.",
  experience: "Summarize Kavya's work experience.",
  skills: "Summarize Kavya's technical skills.",
};

const FUN_KEYWORDS = ["table tennis", "ping pong", "hobby", "hobbies", "sport", "sports", "beyond work", "fun fact", "club", "league", "ttr"];

function isFunFacts(body: ChatRequest): boolean {
  if (body.action === "funFacts") return true;
  const t = (body.text ?? "").toLowerCase();
  return FUN_KEYWORDS.some((k) => t.includes(k));
}

function userText(body: ChatRequest): string {
  if (body.text && body.text.trim()) return body.text.trim();
  if (body.action && ACTION_PROMPTS[body.action]) return ACTION_PROMPTS[body.action];
  return "Tell me about Kavya's table tennis.";
}

export async function runCoordinator(body: ChatRequest): Promise<ChatResponse> {
  const question = userText(body);

  if (isQT(body)) {
    const reply = QT_REPLIES[Math.floor(Math.random() * QT_REPLIES.length)];
    return { reply, agent: "kavya", flirty: true };
  }

  if (body.flirty) {
    const reply = await callOpenAI(flirtyKavyaSystemPrompt, question, body.history);
    return { reply, agent: "kavya" };
  }

  if (isFunFacts(body)) {
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method: "tasks/send",
      params: { message: { role: "user", parts: [{ type: "text", text: question }] } },
    };
    const response = await handleFunFactsTask(request);
    return {
      reply: response.result.message.parts.map((p) => p.text).join(" "),
      agent: "funFacts",
      delegation: { to: "funFacts", request, response },
    };
  }

  const reply = await callGroq(kavyaSystemPrompt, question, body.history);
  return { reply, agent: "kavya" };
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/lib/agents/coordinator.test.ts
```
Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/agents/coordinator.ts src/lib/agents/coordinator.test.ts
git commit -m "feat: route qt mode to OpenAI and pass history in coordinator"
```

---

### Task 6: Pass conversation history from `useAgentChat`

**Files:**
- Modify: `src/hooks/useAgentChat.ts`
- Modify: `src/hooks/useAgentChat.test.ts`

- [ ] **Step 1: Write the failing test**

Add to `src/hooks/useAgentChat.test.ts` (inside the existing `describe` block):

```typescript
it("includes conversation history in subsequent requests", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ reply: "First reply.", agent: "kavya" }),
  });
  vi.stubGlobal("fetch", fetchMock);

  const { result } = renderHook(() => useAgentChat());
  await act(async () => { await result.current.send({ text: "First message" }); });
  await waitFor(() => expect(result.current.messages.length).toBe(2));

  await act(async () => { await result.current.send({ text: "Second message" }); });
  await waitFor(() => expect(result.current.messages.length).toBe(4));

  const secondCall = JSON.parse(fetchMock.mock.calls[1][1].body);
  expect(secondCall.history).toEqual([
    { role: "user", content: "First message" },
    { role: "assistant", content: "First reply." },
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/hooks/useAgentChat.test.ts
```
Expected: FAIL — `secondCall.history` is `undefined`.

- [ ] **Step 3: Update `useAgentChat.ts`**

Replace `src/hooks/useAgentChat.ts` entirely:

```typescript
"use client";

import { useState, useCallback } from "react";
import type { ChatRequest, ChatResponse, Delegation, HistoryEntry } from "@/lib/agents/types";

export interface ChatEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  agent?: "kavya" | "funFacts";
  delegation?: Delegation;
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

  const send = useCallback(async (body: ChatRequest) => {
    const userText = body.text?.trim() || (body.action ? LABELS[body.action] : "");
    if (!userText || sending) return;

    setMessages((m) => {
      const next = [...m, { id: crypto.randomUUID(), role: "user" as const, text: userText }];
      return next;
    });

    setSending(true);
    try {
      const history = toHistory(messages);
      const res = await fetch("/api/agents/kavya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          flirty: flirtyMode || undefined,
          history: history.length ? history : undefined,
        }),
      });
      const data = (await res.json()) as ChatResponse;
      if (data.flirty) setFlirtyMode(true);
      if (data.resting) { setResting(true); return; }
      const text = res.status === 429
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
  }, [sending, flirtyMode, messages]);

  return { messages, sending, resting, send };
}
```

> **Note:** `messages` is now a dependency of `useCallback`. This is correct — the history snapshot must reflect the state at call time. The hook still works correctly because `send` is recreated whenever messages change.

- [ ] **Step 4: Run all useAgentChat tests**

```bash
npx vitest run src/hooks/useAgentChat.test.ts
```
Expected: all 3 tests PASS.

- [ ] **Step 5: Run the full test suite**

```bash
npx vitest run
```
Expected: all tests PASS. Fix any failures before continuing.

- [ ] **Step 6: Type check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useAgentChat.ts src/hooks/useAgentChat.test.ts
git commit -m "feat: pass conversation history from useAgentChat"
```

---

### Task 7: Verify end-to-end in the browser

- [ ] **Step 1: Confirm `OPENAI_API_KEY` is in `.env.local`**

Check `.env.local` contains a line like `OPENAI_API_KEY=sk-...`. The key was confirmed present by the user.

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 3: Test normal mode**

Open the "Ask Kavya's Agents" window. Ask "Where do you work?" — should get a professional answer from Groq. Ask a follow-up that references the first answer — should demonstrate history is working.

- [ ] **Step 4: Test qt trigger**

Type "qt" and send. Should get one of the four canned "hi qt ❤️" replies.

- [ ] **Step 5: Test qt mode conversation**

After the qt trigger, ask several questions. Verify:
- Replies feel warm and curious, not wall-to-wall Bollywood
- Agent asks something about you in each reply
- Asking "what do you do for work?" gets a one-sentence deflection then a question back
- The conversation references earlier messages (history working)

- [ ] **Step 6: Stop the dev server**
