// BACKEND: Save daily energy level to Pinecone
// TODO: Validate energy level (0-100)
// TODO: Use current date automatically

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { storeDailyEnergy } from '@/lib/pinecone/operations';
import { generateEmbedding } from '@/lib/embeddings/client';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { energy_level } = await request.json();

    if (energy_level < 0 || energy_level > 100) {
      return NextResponse.json({ error: 'Invalid energy level' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const embedding = await generateEmbedding(`Energy level: ${energy_level}% on ${today}`);

    await storeDailyEnergy(userId, today, energy_level, embedding);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Energy save error:', error);
    return NextResponse.json({ error: 'Failed to save energy level' }, { status: 500 });
  }
}
