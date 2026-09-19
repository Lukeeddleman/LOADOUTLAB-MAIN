import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

// GET — return current stock (public)
export async function GET() {
  try {
    const redis = getRedis();
    const stock = await redis.get<number>('kineticube:stock');
    return NextResponse.json({ stock: stock ?? null });
  } catch {
    return NextResponse.json({ stock: null });
  }
}

// POST — update stock (requires ADMIN_SECRET)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, stock } = body;

    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const count = parseInt(stock);
    if (isNaN(count) || count < 0) {
      return NextResponse.json({ error: 'Invalid stock value' }, { status: 400 });
    }

    const redis = getRedis();
    await redis.set('kineticube:stock', count);
    return NextResponse.json({ success: true, stock: count });
  } catch {
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
