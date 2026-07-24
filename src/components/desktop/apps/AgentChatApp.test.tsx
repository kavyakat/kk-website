import { describe, it, expect, vi, afterEach } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AgentChatApp from "./AgentChatApp";
import { useAgentChat } from "@/hooks/useAgentChat";
import { characters, type Character } from "@/lib/agents/characters";
import type { AppId } from "@/lib/appRegistry";

const clippy = characters.find((c) => c.id === "clippy")!;

function Harness({ onLaunchApp = vi.fn() }: { onLaunchApp?: (id: AppId) => void }) {
  const [character, setCharacter] = useState<Character>(clippy);
  const { messages, sending, resting, send } = useAgentChat();
  return (
    <AgentChatApp
      onLaunchApp={onLaunchApp}
      character={character}
      onChangeCharacter={setCharacter}
      messages={messages}
      sending={sending}
      resting={resting}
      send={send}
    />
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("AgentChatApp", () => {
  it("opens directly into the Clippy chat, no picker gate", () => {
    render(<Harness />);
    expect(screen.getByText(/I'm Clippy/i)).toBeInTheDocument();
    expect(screen.queryByText(/Choose your assistant/i)).not.toBeInTheDocument();
  });

  it("Change assistant reopens the picker and switches character", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /Change assistant/i }));
    expect(screen.getByText(/Choose your assistant/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Merlin"));
    expect(screen.getByText(/I am Merlin/i)).toBeInTheDocument();
  });

  it("Open Resume launches the resume app", () => {
    const onLaunchApp = vi.fn();
    render(<Harness onLaunchApp={onLaunchApp} />);
    fireEvent.click(screen.getByRole("button", { name: /Open Resume/i }));
    expect(onLaunchApp).toHaveBeenCalledWith("resume");
  });
});
