import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAgentChat } from "./useAgentChat";

afterEach(() => vi.unstubAllGlobals());

describe("useAgentChat", () => {
  it("appends a user message then the agent reply", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "She works at SAP.", agent: "kavya" }),
    }));

    const { result } = renderHook(() => useAgentChat());
    await act(async () => { await result.current.send({ text: "Where does she work?" }); });

    await waitFor(() => expect(result.current.messages.length).toBe(2));
    expect(result.current.messages[0].role).toBe("user");
    expect(result.current.messages[1].role).toBe("agent");
    expect(result.current.messages[1].text).toMatch(/SAP/);
  });

  it("sets resting when the server reports the daily cap", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "", agent: "kavya", resting: true }),
    }));

    const { result } = renderHook(() => useAgentChat());
    await act(async () => { await result.current.send({ action: "about" }); });

    await waitFor(() => expect(result.current.resting).toBe(true));
  });
});
