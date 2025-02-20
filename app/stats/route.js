export async function GET(req) {
  const authHeader = req.headers.get("authorization");

  if (
    !authHeader ||
    authHeader !== `Bearer ${process.env.STATS_ACCESS_TOKEN}`
  ) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const keys = await redis.keys("hits:*");

  if (!keys.length) {
    return new Response(JSON.stringify({ message: "No data yet." }), {
      status: 200,
    });
  }

  const stats = await Promise.all(
    keys.map(async (key) => {
      const slug = key.replace("hits:", "");
      const count = await redis.get(key);
      return { slug, count: parseInt(count, 10) };
    })
  );

  stats.sort((a, b) => b.count - a.count);

  return new Response(JSON.stringify(stats, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
