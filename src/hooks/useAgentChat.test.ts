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

  it("includes conversation history in subsequent requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "First reply.", agent: "kavya" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAgentChat());
    await act(async () => { await result.current.send({ text: "First message" }); });
    await waitFor(() => expect(result.current.messages.length).toBe(2));

    await act(async () => { await result.current.send({ text: "Second message" }); });
    await waitFor(() => expect(result.current.messages.length).toBe(4));

    const secondCall = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondCall.history).toEqual([
      { role: "user", content: "First message" },
      { role: "assistant", content: "First reply." },
    ]);
  });

  it("shows waiting bubble then resolves with human reply after polling", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    let pollCount = 0;
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if ((url as string).includes("/poll")) {
        pollCount++;
        if (pollCount < 2) {
          return Promise.resolve({ ok: true, json: async () => ({ status: "pending" }) });
        }
        return Promise.resolve({ ok: true, json: async () => ({ reply: "hey you ❤️", agent: "kavya" }) });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ status: "pending", sessionId: "sess-1" }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAgentChat());

    await act(async () => {
      result.current.send({ text: "hey", flirty: true } as never);
    });
    await act(async () => { await Promise.resolve(); });

    await waitFor(() => expect(result.current.waiting).toBe(true));
    expect(result.current.messages.some((m) => m.waiting)).toBe(true);

    await act(async () => { vi.advanceTimersByTime(2000); });
    await act(async () => { await Promise.resolve(); });
    await act(async () => { vi.advanceTimersByTime(2000); });
    await act(async () => { await Promise.resolve(); });

    await waitFor(() => expect(result.current.waiting).toBe(false));
    expect(result.current.messages.find((m) => m.text === "hey you ❤️")).toBeDefined();
    expect(result.current.messages.some((m) => m.waiting)).toBe(false);

    vi.useRealTimers();
  });
});
