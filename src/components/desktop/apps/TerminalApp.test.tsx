import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TerminalApp from "./TerminalApp";

const type = (value: string) => {
  const input = screen.getByLabelText("terminal-input");
  fireEvent.change(input, { target: { value } });
  fireEvent.submit(input.closest("form")!);
};

describe("TerminalApp", () => {
  it("shows the boot banner and prompt", () => {
    render(<TerminalApp />);
    expect(screen.getByText(/Type 'help' for a list of commands/)).toBeInTheDocument();
    expect(screen.getByLabelText("terminal-input")).toBeInTheDocument();
  });

  it("lists commands when the user types help", () => {
    render(<TerminalApp />);
    type("help");
    expect(screen.getByText(/Anything else is sent to Kavya's agent\./)).toBeInTheDocument();
    expect(screen.getByText("C:\\KAVYA>help")).toBeInTheDocument();
  });

  it("clears the screen on cls", () => {
    render(<TerminalApp />);
    type("cls");
    expect(screen.queryByText(/Type 'help' for a list of commands/)).not.toBeInTheDocument();
  });
});
