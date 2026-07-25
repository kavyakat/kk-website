import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactApp from "./ContactApp";
import { contactLinks } from "@/data/content";

describe("ContactApp", () => {
  it("links to the correct email, GitHub, and LinkedIn", () => {
    render(<ContactApp />);
    expect(screen.getByText("Email me")).toHaveAttribute("href", `mailto:${contactLinks.email}`);
    expect(screen.getByText("GitHub")).toHaveAttribute("href", contactLinks.github);
    expect(screen.getByText("LinkedIn")).toHaveAttribute("href", contactLinks.linkedin);
  });
});
