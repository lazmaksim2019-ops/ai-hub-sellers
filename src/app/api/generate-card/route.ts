import { NextResponse } from 'next/server';
import { generateCardSEO, getRecommendedPrice } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, marketplace } = body;

    if (!name || !category || !marketplace) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, marketplace' },
        { status: 400 }
      );
    }

    const [seo, price] = await Promise.all([
      generateCardSEO({ name, category, marketplace }),
      getRecommendedPrice(name, category, marketplace),
    ]);

    return NextResponse.json({
      description: seo.description,
      tags: seo.tags,
      recommendedPrice: price,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Generate card error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
