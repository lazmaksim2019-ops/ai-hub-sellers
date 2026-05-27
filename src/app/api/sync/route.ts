import { NextResponse } from 'next/server';
import { syncMarketplace } from '@/lib/marketplace';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { marketplace } = body;

    if (!marketplace || !['ozon', 'wildberries'].includes(marketplace)) {
      return NextResponse.json(
        { error: 'Invalid marketplace. Must be "ozon" or "wildberries".' },
        { status: 400 }
      );
    }

    const result = await syncMarketplace(marketplace);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Sync error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
