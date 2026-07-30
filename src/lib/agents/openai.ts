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
