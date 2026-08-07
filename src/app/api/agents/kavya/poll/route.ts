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
