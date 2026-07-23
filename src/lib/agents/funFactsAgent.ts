import { callGroq } from "./groq";
import { funFactsSystemPrompt } from "./prompts";
import type { JsonRpcRequest, JsonRpcResponse } from "./types";

export async function handleFunFactsTask(req: JsonRpcRequest): Promise<JsonRpcResponse> {
  const userText = req.params.message.parts.map((p) => p.text).join(" ");
  const reply = await callGroq(funFactsSystemPrompt, userText);
  return {
    jsonrpc: "2.0",
    id: req.id,
    result: { status: "completed", message: { role: "agent", parts: [{ type: "text", text: reply }] } },
  };
}
