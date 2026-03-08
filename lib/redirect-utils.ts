import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const hasRedisEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);
const redis = hasRedisEnv ? Redis.fromEnv() : null;

export async function createTrackedRedirect(
  req: NextRequest,
  destination: string,
  slug: string,
  permanent: boolean = false
): Promise<NextResponse> {
  const url = new URL(req.url);
  const queryParams = url.searchParams.toString();
  
  let finalDestination = destination;
  if (queryParams) {
    finalDestination += (destination.includes("?") ? "&" : "?") + queryParams;
  }

  const hitCookieName = `hit_${slug}`;
  const lastVisit = Number(req.cookies.get(hitCookieName)?.value);

  const statusCode = permanent ? 308 : 302;

  if (!Number.isFinite(lastVisit) || Date.now() - lastVisit > 60000) {
    if (redis) {
      try {
        await redis.incr(`hits:${slug}`);
      } catch (error) {
        console.error(`Failed to track hit for slug "${slug}"`, error);
      }
    }

    const response = NextResponse.redirect(finalDestination, statusCode);
    response.cookies.set(hitCookieName, String(Date.now()), {
      httpOnly: true,
      maxAge: 60,
      path: "/",
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
    });
    return response;
  }

  return NextResponse.redirect(finalDestination, statusCode);
}
