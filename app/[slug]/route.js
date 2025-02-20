import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const redirectsFile = path.join(process.cwd(), "redirects.json");
const redirects = JSON.parse(fs.readFileSync(redirectsFile, "utf8"));

const redis = Redis.fromEnv();

export async function GET(req, { params }) {
  const { slug } = params;
  const destination = redirects[slug];

  if (!destination) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  }

  const cookieStore = cookies();
  const lastVisit = cookieStore.get(`hit_${slug}`);

  if (!lastVisit || Date.now() - parseInt(lastVisit.value, 10) > 60000) {
    await redis.incr(`hits:${slug}`);
    cookieStore.set(`hit_${slug}`, Date.now().toString(), {
      path: "/",
      httpOnly: true,
      maxAge: 3600,
    });
    console.log(`Hit recorded for: ${slug}`);
  }

  return NextResponse.redirect(destination, 302);
}
