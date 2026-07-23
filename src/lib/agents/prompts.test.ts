import { describe, it, expect } from "vitest";
import { kavyaSystemPrompt, funFactsSystemPrompt, MAX_REPLY_CHARS } from "./prompts";

describe("prompts", () => {
  it("kavya prompt embeds the knowledge and resists injection", () => {
    expect(kavyaSystemPrompt).toMatch(/Senior AI Data Engineer/);
    expect(kavyaSystemPrompt.toLowerCase()).toMatch(/ignore/); // injection-resistance clause
    expect(kavyaSystemPrompt).toMatch(String(MAX_REPLY_CHARS));
  });

  it("fun facts prompt is scoped to table tennis", () => {
    expect(funFactsSystemPrompt).toMatch(/table tennis/i);
    expect(funFactsSystemPrompt.toLowerCase()).toMatch(/only/);
  });
});
