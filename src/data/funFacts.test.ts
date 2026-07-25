import { describe, it, expect } from "vitest";
import { funFacts, funFactsText } from "./funFacts";

describe("funFacts", () => {
  it("exposes the club and current TTR", () => {
    expect(funFacts.club).toContain("TTC 1992 München");
    expect(funFacts.ttrCurrent).toBe(1266);
  });

  it("renders a text block mentioning table tennis and the league", () => {
    expect(funFactsText).toMatch(/table tennis/i);
    expect(funFactsText).toContain("Bezirksklasse");
  });
});
