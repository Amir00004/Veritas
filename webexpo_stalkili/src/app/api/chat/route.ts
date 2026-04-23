import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const history = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: history,
    });

    const text = completion.choices[0].message.content;
    return NextResponse.json({ text });
  } catch (err) {
    console.error('Groq error:', err);
    return NextResponse.json({ text: 'Error: ' + (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
}
