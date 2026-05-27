import { NextResponse } from 'next/server';
import { generateCardSEO } from '@/lib/gemini';

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

    const result = await generateCardSEO({ name, category, marketplace });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Generate card error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
