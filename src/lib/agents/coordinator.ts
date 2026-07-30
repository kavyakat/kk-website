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
    const reply = await callGroq(flirtyKavyaSystemPrompt, question, body.history, 0.75);
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
