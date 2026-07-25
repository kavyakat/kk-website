import { checkRateLimit } from "@/lib/agents/rateLimit";
import { runCoordinator } from "@/lib/agents/coordinator";
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
  const result = await runCoordinator(body);
  return Response.json(result);
}
