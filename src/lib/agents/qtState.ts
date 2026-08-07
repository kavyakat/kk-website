function cfg() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash not configured");
  return { url, token };
}

async function redis<T = unknown>(...cmd: (string | number)[]): Promise<T> {
  const { url, token } = cfg();
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = await res.json();
  return data.result as T;
}

export async function setActiveSession(sessionId: string) {
  await redis("SET", "qt:active_session", sessionId, "EX", 3600);
}

export async function getActiveSession(): Promise<string | null> {
  return redis<string | null>("GET", "qt:active_session");
}

export async function setPending(sessionId: string) {
  await redis("SET", `qt:pending:${sessionId}`, "1", "EX", 30);
}

export async function checkPending(sessionId: string): Promise<boolean> {
  const result = await redis<string | null>("GET", `qt:pending:${sessionId}`);
  return result !== null;
}

export async function setHumanLive(sessionId: string) {
  await redis("SET", "qt:human_live", sessionId);
}

export async function checkHumanLive(): Promise<boolean> {
  const result = await redis<string | null>("GET", "qt:human_live");
  return result !== null;
}

export async function clearHumanLive() {
  await redis("DEL", "qt:human_live");
}

export async function pushHumanReply(sessionId: string, text: string) {
  const key = `qt:human_reply:${sessionId}`;
  await redis("RPUSH", key, text);
  await redis("EXPIRE", key, 300);
}

export async function popHumanReply(sessionId: string): Promise<string | null> {
  return redis<string | null>("LPOP", `qt:human_reply:${sessionId}`);
}
