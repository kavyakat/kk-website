import { describe, it, expect } from "vitest";
import { kavyaSystemPrompt, flirtyKavyaSystemPrompt, funFactsSystemPrompt, MAX_REPLY_CHARS } from "./prompts";

describe("prompts", () => {
  it("kavya prompt embeds the knowledge and resists injection", () => {
    expect(kavyaSystemPrompt).toMatch(/Senior AI Data Engineer/);
    expect(kavyaSystemPrompt.toLowerCase()).toMatch(/ignore/);
    expect(kavyaSystemPrompt).toMatch(String(MAX_REPLY_CHARS));
  });

  it("fun facts prompt is scoped to table tennis", () => {
    expect(funFactsSystemPrompt).toMatch(/table tennis/i);
    expect(funFactsSystemPrompt.toLowerCase()).toMatch(/only/);
  });

  it("flirty prompt has no professional knowledge, has examples, and mentions Munich", () => {
    expect(flirtyKavyaSystemPrompt).toMatch(/examples/i);
    expect(flirtyKavyaSystemPrompt).not.toMatch(/Senior AI Data Engineer/);
    expect(flirtyKavyaSystemPrompt).toMatch(/Munich/);
    expect(flirtyKavyaSystemPrompt).toMatch(/table tennis/i);
    expect(flirtyKavyaSystemPrompt).toMatch(String(MAX_REPLY_CHARS));
  });
});
