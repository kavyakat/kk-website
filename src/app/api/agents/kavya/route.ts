import { checkRateLimit } from "@/lib/agents/rateLimit";
import { runCoordinator, isBye, isQT } from "@/lib/agents/coordinator";
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

  if ((body.flirty && !isBye(body)) || isQT(body)) {
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
