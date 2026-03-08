import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const hasRedisEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = hasRedisEnv ? Redis.fromEnv() : null;
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
  for (const [key, value] of requestUrl.searchParams.entries()) {
    destinationUrl.searchParams.set(key, value);
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
