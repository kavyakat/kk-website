import { describe, it, expect } from "vitest";
import { characters } from "./characters";

describe("characters", () => {
  it("offers the four classic assistants with unique ids", () => {
    const ids = characters.map((c) => c.id);
    expect(ids).toEqual(["clippy", "merlin", "rover", "genius"]);
    expect(new Set(ids).size).toBe(4);
  });

  it("gives each character a name, greeting, and avatar path", () => {
    for (const c of characters) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.greeting.length).toBeGreaterThan(0);
      expect(c.avatarSrc).toMatch(/^\/characters\//);
    }
  });
});
