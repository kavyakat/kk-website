import { describe, it, expect } from "vitest";
import { kavyaCard, funFactsCard } from "./cards";

describe("agent cards", () => {
  it("each card has a name, description, url, and at least one skill", () => {
    for (const card of [kavyaCard, funFactsCard]) {
      expect(card.name.length).toBeGreaterThan(0);
      expect(card.description.length).toBeGreaterThan(0);
      expect(card.url).toMatch(/^\/api\/agents\//);
      expect(card.skills.length).toBeGreaterThan(0);
    }
  });

  it("the fun facts card advertises a table-tennis skill", () => {
    expect(JSON.stringify(funFactsCard.skills)).toMatch(/table tennis/i);
  });
});
