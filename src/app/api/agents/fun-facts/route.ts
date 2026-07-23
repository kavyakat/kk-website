import { handleFunFactsTask } from "@/lib/agents/funFactsAgent";
import type { JsonRpcRequest } from "@/lib/agents/types";

export async function POST(request: Request) {
  const body = (await request.json()) as JsonRpcRequest;
  const result = await handleFunFactsTask(body);
  return Response.json(result);
}
