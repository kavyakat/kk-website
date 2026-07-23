import { describe, it, expect } from "vitest";
import { GET as kavyaGET } from "./kavya/card/route";
import { GET as funFactsGET } from "./fun-facts/card/route";

describe("agent card routes", () => {
  it("kavya card route returns the Kavya Agent card as JSON", async () => {
    const res = await kavyaGET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Kavya Agent");
    expect(Array.isArray(body.skills)).toBe(true);
  });

  it("fun facts card route returns the Fun Facts Agent card", async () => {
    const res = await funFactsGET();
    const body = await res.json();
    expect(body.name).toBe("Fun Facts Agent");
  });
});
