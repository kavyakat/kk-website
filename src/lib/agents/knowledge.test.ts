import { describe, it, expect } from "vitest";
import { kavyaKnowledge, funFactsKnowledge } from "./knowledge";

describe("knowledge", () => {
  it("kavyaKnowledge includes bio, a role, a skill, and contact", () => {
    expect(kavyaKnowledge).toMatch(/SAP/);
    expect(kavyaKnowledge).toMatch(/Senior AI Data Engineer/);
    expect(kavyaKnowledge).toMatch(/Python/);
    expect(kavyaKnowledge).toMatch(/github\.com\/kavyakat/);
  });

  it("funFactsKnowledge is the table tennis block", () => {
    expect(funFactsKnowledge).toMatch(/table tennis/i);
  });
});
