import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ExperienceApp from "./ExperienceApp";
import { experience } from "@/data/experience";

describe("ExperienceApp", () => {
  it("shows the first role's details by default", () => {
    render(<ExperienceApp />);
    expect(screen.getByText(experience[0].title)).toBeInTheDocument();
  });

  it("switches details when a different folder is selected", () => {
    render(<ExperienceApp />);
    fireEvent.click(screen.getByText(`📁 ${experience[2].company}`));
    expect(screen.getByText(experience[2].title)).toBeInTheDocument();
  });
});
