import { kavyaCard } from "@/lib/agents/cards";

export function GET() {
  return Response.json(kavyaCard);
}
