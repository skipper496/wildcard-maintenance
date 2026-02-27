import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { defaultState } from "@/lib/seed";
import { AppState } from "@/lib/types";

const KEY = "wildcard-maintenance:state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Redis env vars are missing.");
  }
  return new Redis({ url, token });
}

export async function GET() {
  try {
    const redis = getRedisClient();
    const state = await redis.get<AppState>(KEY);
    if (!state) {
      await redis.set(KEY, defaultState);
      return NextResponse.json({ state: defaultState });
    }
    return NextResponse.json({ state });
  } catch (error) {
    return NextResponse.json(
      {
        error: "REDIS_UNAVAILABLE",
        message: "Redis is not configured. Connect Upstash Redis in Vercel and redeploy.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const redis = getRedisClient();
    const body = (await req.json()) as { state?: AppState };
    if (!body?.state) {
      return NextResponse.json({ error: "Missing state payload" }, { status: 400 });
    }
    await redis.set(KEY, body.state);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: "WRITE_FAILED",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
