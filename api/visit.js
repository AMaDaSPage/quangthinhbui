import { kv } from "@vercel/kv";

const ONLINE_WINDOW_MS = 10_000;
export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = (searchParams.get("id") || "").trim().slice(0, 128);
    const hit = searchParams.get("hit") === "1";

    if (!id) {
      return Response.json(
        { error: "Missing id" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const now = Date.now();
    const cutoff = now - ONLINE_WINDOW_MS;

    await kv.zremrangebyscore("visitors:online", 0, cutoff);

    await kv.zadd("visitors:online", { score: now, member: id });

    if (hit) await kv.incr("visitors:total");

    const [totalRaw, onlineRaw] = await Promise.all([
      kv.get("visitors:total"),
      kv.zcard("visitors:online")
    ]);

    return Response.json(
      {
        total: Number(totalRaw || 0),
        online: Number(onlineRaw || 0),
        windowMs: ONLINE_WINDOW_MS
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (e) {
    return Response.json(
      { error: "Server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
