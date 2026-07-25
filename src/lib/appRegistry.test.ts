import { describe, it, expect } from "vitest";
import { appRegistry } from "./appRegistry";

describe("appRegistry", () => {
  it("has a unique id for every app", () => {
    const ids = appRegistry.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every app a non-empty label and icon", () => {
    for (const app of appRegistry) {
      expect(app.label.length).toBeGreaterThan(0);
      expect(app.iconSrc.length).toBeGreaterThan(0);
    }
  });

  it("includes the agents chat app", () => {
    const agents = appRegistry.find((a) => a.id === "agents");
    expect(agents).toBeDefined();
    expect(agents!.label).toMatch(/Kavya/i);
  });

  it("marks Minesweeper and Solitaire as games", () => {
    const games = appRegistry.filter((a) => a.group === "games").map((a) => a.id);
    expect(games).toEqual(expect.arrayContaining(["minesweeper", "solitaire"]));
  });

  it("gives every visible app an XP icon", () => {
    for (const app of appRegistry.filter((a) => !a.hidden)) {
      expect(app.xpIconSrc && app.xpIconSrc.length).toBeGreaterThan(0);
    }
  });
});
