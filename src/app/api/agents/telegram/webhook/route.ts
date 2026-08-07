import { getActiveSession, pushHumanReply, setHumanLive, clearHumanLive, setAiMode } from "@/lib/agents/qtState";
import { sendTelegramMessage } from "@/lib/agents/telegram";

interface TelegramUpdate {
  message?: {
    from?: { id: number };
    text?: string;
  };
}

export async function POST(request: Request) {
  try {
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;
    if (!message) return Response.json({ ok: true });

    const fromId = String(message.from?.id ?? "");
    const expectedId = process.env.TELEGRAM_CHAT_ID ?? "";
    if (fromId !== expectedId) return Response.json({ ok: true });

    const text = (message.text ?? "").trim();
    if (!text) return Response.json({ ok: true });

    if (text === "/done" || text === "/afk") {
      await clearHumanLive();
      await setAiMode();
      await sendTelegramMessage("ok, AI is back 🤖");
      return Response.json({ ok: true });
    }

    const sessionId = await getActiveSession();
    if (!sessionId) {
      await sendTelegramMessage("no active qt session");
      return Response.json({ ok: true });
    }

    await pushHumanReply(sessionId, text);
    await setHumanLive(sessionId);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true });
  }
}
