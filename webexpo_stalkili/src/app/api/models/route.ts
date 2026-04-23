import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await res.json();
    const names = data.models?.map((m: { name: string }) => m.name) ?? data;
    return NextResponse.json({ models: names });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
