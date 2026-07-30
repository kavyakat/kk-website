import { callGroq } from "./groq";
import { callOpenAI } from "./openai";
import { handleFunFactsTask } from "./funFactsAgent";
import { kavyaSystemPrompt, flirtyKavyaSystemPrompt } from "./prompts";
import type { ChatRequest, ChatResponse, JsonRpcRequest } from "./types";

const QT_REPLIES = [
  "hi qt ❤️ miss kar raha tha — extra smart AI laya hoon aaj tumhare liye, switch bhi kar sakte ho 😛",
  "hi jaan ❤️ tum aayi! best waala AI laya hoon, neeche switch karni ho toh option hai 😊",
  "hi qt ❤️ was thinking about you 💕 fancy kiya toh aaj upgrade mila hai — change karni ho toh kar lena~",
  "hi qt ❤️ aaj toh extra special — sabse smart AI bhi laya hoon tumhare liye 😘",
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
    const reply = body.model === "openai"
      ? await callOpenAI(flirtyKavyaSystemPrompt, question, body.history)
      : await callGroq(flirtyKavyaSystemPrompt, question, body.history, 0.75);
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
