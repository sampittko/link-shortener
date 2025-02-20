import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(req, { params }) {
  const { slug } = params;
  const count = (await redis.get(`hits:${slug}`)) || 0;

  return new Response(JSON.stringify({ slug, visits: count }), { status: 200 });
}
