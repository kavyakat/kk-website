import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResumeApp from "./ResumeApp";
import { resumePath } from "@/data/content";

describe("ResumeApp", () => {
  it("points its iframe at the resume PDF", () => {
    render(<ResumeApp />);
    expect(screen.getByTitle("Resume")).toHaveAttribute("src", resumePath);
  });
});
