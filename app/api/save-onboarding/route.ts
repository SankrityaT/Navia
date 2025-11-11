// API route to save onboarding context to Pinecone and Supabase

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateEmbedding } from '@/lib/embeddings/client';
import { getIndex } from '@/lib/pinecone/client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userName, responses, preferredMode } = await req.json();

    // Create user context summary
    const contextText = `User name: ${userName}. Preferred communication: ${preferredMode}. User needs help with: ${responses.join(', ')}`;

    // Generate embedding for context
    const embedding = await generateEmbedding(contextText);

    // Save to Pinecone
    const index = getIndex();
    await index.upsert([{
      id: `onboarding-${userId}-${Date.now()}`,
      values: embedding,
      metadata: {
        userId,
        type: 'onboarding_context',
        userName,
        preferredMode,
        responses,
        contextText,
        timestamp: new Date().toISOString(),
      } as any,
    }]);

    // Save to Supabase - mark as onboarded
    const { error: supabaseError } = await supabase
      .from('user_profiles')
      .upsert({
        clerk_user_id: userId,
        name: userName,
        onboarded: true,
        onboarded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'clerk_user_id'
      });

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      // Don't fail the whole request if Supabase fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save onboarding error:', error);
    return NextResponse.json({ error: 'Failed to save context' }, { status: 500 });
  }
}
