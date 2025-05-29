import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const redirectsFile = path.join(process.cwd(), "redirects.json");
const redirects = JSON.parse(fs.readFileSync(redirectsFile, "utf8"));

const ALLOWED_DOMAINS = [
  "freewith.tech",
  "v1.freewith.tech",
  "v2.freewith.tech",
  "youtu.be",
  "open.substack.com",
];

const redis = Redis.fromEnv();

export async function GET(req, { params }) {
  const { slug } = params;
  let destination = redirects[slug];

  if (!destination) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  }

  try {
    const destinationUrl = new URL(destination);
    if (!ALLOWED_DOMAINS.includes(destinationUrl.hostname)) {
      console.error(`Blocked redirect to unauthorized domain: ${destinationUrl.hostname}`);
      return new Response(JSON.stringify({ error: "Invalid destination" }), {
        status: 400,
      });
    }
  } catch (error) {
    console.error(`Invalid destination URL: ${destination}`);
    return new Response(JSON.stringify({ error: "Invalid destination URL" }), {
      status: 400,
    });
  }

  const url = new URL(req.url);
  const queryParams = url.searchParams.toString();

  if (queryParams) {
    destination += (destination.includes("?") ? "&" : "?") + queryParams;
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...values] = c.split("=");
      return [key, values.join("=")];
    })
  );
  const lastVisit = cookies[`hit_${slug}`];

  if (!lastVisit || Date.now() - parseInt(lastVisit, 10) > 60000) {
    await redis.incr(`hits:${slug}`);

    const response = NextResponse.redirect(destination, 302);
    response.headers.set(
      "Set-Cookie",
      `hit_${slug}=${Date.now()}; Path=/; HttpOnly; Max-Age=60`
    );
    return response;
  }

  return NextResponse.redirect(destination, 302);
}
