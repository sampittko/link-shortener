import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const hasRedisEnv = Boolean(redisUrl) && Boolean(redisToken);
const hasPartialRedisEnv = Boolean(redisUrl) !== Boolean(redisToken);

if (hasPartialRedisEnv) {
  console.warn(
    "Redis analytics disabled: expected either UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN."
  );
}

const redis = hasRedisEnv
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null;
const HIT_DEDUPE_WINDOW_MS = 60_000;
const HIT_COOKIE_MAX_AGE_SECONDS = HIT_DEDUPE_WINDOW_MS / 1000;

export async function createTrackedRedirect(
  req: NextRequest,
  destination: string,
  slug: string,
  permanent: boolean = false
): Promise<NextResponse> {
  const requestUrl = new URL(req.url);
  const destinationUrl = new URL(destination);
  const reservedQueryKeys = new Set(destinationUrl.searchParams.keys());

  for (const [key, value] of requestUrl.searchParams.entries()) {
    if (reservedQueryKeys.has(key)) {
      continue;
    }

    destinationUrl.searchParams.set(key, value);
    reservedQueryKeys.add(key);
  }
  const finalDestination = destinationUrl.toString();

  const statusCode = permanent ? 308 : 302;
  if (!redis) {
    return NextResponse.redirect(finalDestination, statusCode);
  }

  const hitCookieName = `hit_${slug}`;
  const lastVisit = Number(req.cookies.get(hitCookieName)?.value);
  const now = Date.now();

  if (!Number.isFinite(lastVisit) || now - lastVisit > HIT_DEDUPE_WINDOW_MS) {
    let tracked = false;
    try {
      await redis.incr(`hits:${slug}`);
      tracked = true;
    } catch (error) {
      console.error(`Failed to track hit for slug "${slug}"`, error);
    }

    const response = NextResponse.redirect(finalDestination, statusCode);
    if (tracked) {
      response.cookies.set(hitCookieName, String(now), {
        httpOnly: true,
        maxAge: HIT_COOKIE_MAX_AGE_SECONDS,
        path: "/",
        sameSite: "lax",
        secure: req.nextUrl.protocol === "https:",
      });
    }
    return response;
  }

  return NextResponse.redirect(finalDestination, statusCode);
}
