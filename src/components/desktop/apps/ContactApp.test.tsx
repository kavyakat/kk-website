import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactApp from "./ContactApp";

describe("ContactApp", () => {
  it("renders all contact buttons", () => {
    render(<ContactApp />);
    expect(screen.getByRole("button", { name: "Email me" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "GitHub" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Instagram" })).toBeInTheDocument();
  });
});
