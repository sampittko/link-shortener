import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(req, { params }) {
    const authHeader = req.headers.get("authorization");

    if (
      !authHeader ||
      authHeader !== `Bearer ${process.env.STATS_ACCESS_TOKEN}`
    ) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { slug } = params;
    const count = (await redis.get(`hits:${slug}`)) || 0;

    return new Response(JSON.stringify({ slug, visits: count }), {
      status: 200,
    });
}
