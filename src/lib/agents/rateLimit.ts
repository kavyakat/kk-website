const IP_LIMIT = 30;
const IP_WINDOW_SEC = 600;
const DAILY_LIMIT = 500;

type Result = { allowed: boolean; reason?: "ip" | "daily" };

function config() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redis(cfg: { url: string; token: string }, ...cmd: (string | number)[]): Promise<number> {
  const path = cmd.map((c) => encodeURIComponent(String(c))).join("/");
  const res = await fetch(`${cfg.url}/${path}`, { headers: { Authorization: `Bearer ${cfg.token}` } });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = await res.json();
  return Number(data.result);
}

export async function checkRateLimit(ip: string): Promise<Result> {
  const cfg = config();
  if (!cfg) return { allowed: true };

  try {
    const ipKey = `rl:ip:${ip}`;
    const ipCount = await redis(cfg, "incr", ipKey);
    if (ipCount === 1) await redis(cfg, "expire", ipKey, IP_WINDOW_SEC);
    if (ipCount > IP_LIMIT) return { allowed: false, reason: "ip" };

    const day = new Date().toISOString().slice(0, 10);
    const dayKey = `rl:day:${day}`;
    const dayCount = await redis(cfg, "incr", dayKey);
    if (dayCount === 1) await redis(cfg, "expire", dayKey, 86_400);
    if (dayCount > DAILY_LIMIT) return { allowed: false, reason: "daily" };

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}
