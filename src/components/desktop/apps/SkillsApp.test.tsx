import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SkillsApp from "./SkillsApp";
import { skills } from "@/data/skills";

describe("SkillsApp", () => {
  it("shows the first group's tags by default", () => {
    render(<SkillsApp />);
    expect(screen.getByText(skills[0].tags[0])).toBeInTheDocument();
  });

  it("switches tags when a different tab is selected", () => {
    render(<SkillsApp />);
    fireEvent.click(screen.getByText(skills[1].group));
    expect(screen.getByText(skills[1].tags[0])).toBeInTheDocument();
  });
});
