import { describe, it, expect } from "vitest";
import { experience } from "./experience";
import { skills } from "./skills";
import { education } from "./education";
import { contactLinks, resumePath } from "./content";

describe("content data integrity", () => {
  it("has all 5 experience roles", () => {
    expect(experience).toHaveLength(5);
  });

  it("has all 4 skill groups", () => {
    expect(skills).toHaveLength(4);
  });

  it("has a degree from Manipal Institute of Technology", () => {
    expect(education[0].institution).toBe("Manipal Institute of Technology");
  });

  it("has valid contact links", () => {
    expect(contactLinks.email).toBe("kavyakat@gmail.com");
    expect(contactLinks.github).toMatch(/^https:\/\/github\.com\//);
    expect(contactLinks.linkedin).toMatch(/^https:\/\/linkedin\.com\//);
  });

  it("points resume at the existing PDF asset", () => {
    expect(resumePath).toBe("/Kavya_Kathuria_Resume.pdf");
  });
});
