import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = Redis.fromEnv();

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

  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...values] = c.split("=");
      return [key, values.join("=")];
    })
  );
  const lastVisit = cookies[`hit_${slug}`];

  const statusCode = permanent ? 308 : 302;

  if (!lastVisit || Date.now() - parseInt(lastVisit, 10) > 60000) {
    await redis.incr(`hits:${slug}`);

    const response = NextResponse.redirect(finalDestination, statusCode);
    response.headers.set(
      "Set-Cookie",
      `hit_${slug}=${Date.now()}; Path=/; HttpOnly; Max-Age=60`
    );
    return response;
  }

  return NextResponse.redirect(finalDestination, statusCode);
}