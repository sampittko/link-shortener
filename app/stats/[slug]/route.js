import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(req, { params }) {
  const { slug } = params;
  const count = (await redis.get(`hits:${slug}`)) || 0;

  return new Response(JSON.stringify({ slug, visits: count }), { status: 200 });
}
