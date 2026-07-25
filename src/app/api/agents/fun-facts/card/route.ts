import { funFactsCard } from "@/lib/agents/cards";

export function GET() {
  return Response.json(funFactsCard);
}
