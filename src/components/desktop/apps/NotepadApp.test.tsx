import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotepadApp from "./NotepadApp";

describe("NotepadApp", () => {
  it("renders the about bio text", () => {
    render(<NotepadApp />);
    expect(screen.getByText(/Senior Data Engineer and Software Developer at SAP/)).toBeInTheDocument();
  });
});
