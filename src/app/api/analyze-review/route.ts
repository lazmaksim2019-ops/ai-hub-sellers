import { NextResponse } from 'next/server';
import { analyzeReview } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: text' },
        { status: 400 }
      );
    }

    const result = await analyzeReview(text);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Analyze review error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
