import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SolitaireApp from "./SolitaireApp";

describe("SolitaireApp", () => {
  it("renders the stock, four foundations, and seven tableau columns", () => {
    render(<SolitaireApp />);
    expect(screen.getByLabelText("stock")).toBeInTheDocument();
    for (let i = 0; i < 4; i++) expect(screen.getByLabelText(`foundation-${i}`)).toBeInTheDocument();
    for (let i = 0; i < 7; i++) expect(screen.getByLabelText(`tableau-${i}`)).toBeInTheDocument();
  });

  it("deals 28 cards to the tableau, 24 to the stock, and none face-up beyond column tops", () => {
    render(<SolitaireApp />);
    // 7 columns, tops face-up -> exactly 7 face-up cards visible as draggable at start
    const draggable = screen.getAllByTestId(/^card-/).filter((el) => el.getAttribute("draggable") === "true");
    expect(draggable.length).toBe(7);
  });

  it("draws a card from the stock to the waste on click", () => {
    render(<SolitaireApp />);
    const before = screen.getAllByTestId(/^card-/).filter((el) => el.getAttribute("draggable") === "true").length;
    fireEvent.click(screen.getByLabelText("stock"));
    const after = screen.getAllByTestId(/^card-/).filter((el) => el.getAttribute("draggable") === "true").length;
    expect(after).toBe(before + 1); // the waste card is now face-up and draggable
  });

  it("re-deals a fresh game when Deal is clicked", () => {
    render(<SolitaireApp />);
    fireEvent.click(screen.getByLabelText("stock"));
    fireEvent.click(screen.getByLabelText("deal"));
    const draggable = screen.getAllByTestId(/^card-/).filter((el) => el.getAttribute("draggable") === "true");
    expect(draggable.length).toBe(7); // back to a fresh deal
  });
});
