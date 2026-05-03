import { NextRequest, NextResponse } from "next/server";

const memoryStore = new Map<string, number>();

async function getRedisClient() {
  try {
    const { Redis } = await import("@upstash/redis");
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      return new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  } catch {
    // @upstash/redis not installed or env missing
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const redis = await getRedisClient();
  let count = 0;

  if (redis) {
    const val = await redis.get(`likes:news:${slug}`);
    count = val ? Number(val) : 0;
  } else {
    count = memoryStore.get(slug) || 0;
  }

  return NextResponse.json({ count });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug } = body;

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const redis = await getRedisClient();
  let count = 0;

  if (redis) {
    count = await redis.incr(`likes:news:${slug}`);
  } else {
    count = (memoryStore.get(slug) || 0) + 1;
    memoryStore.set(slug, count);
  }

  return NextResponse.json({ count });
}
