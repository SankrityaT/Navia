// API: Update user's peer profile
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getPeerProfile, storePeerProfile } from '@/lib/pinecone/peers';
import { generateEmbedding } from '@/lib/embeddings/client';

export async function POST(request: Request) {
  console.log('🔄 [PROFILE UPDATE] Route hit - starting update process');
  
  try {
    const { userId } = await auth();
    console.log('🔐 [PROFILE UPDATE] Auth check:', userId ? `User ${userId}` : 'No user');
    
    if (!userId) {
      console.log('❌ [PROFILE UPDATE] Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { interests, seeking, offers } = body;
    console.log('📝 [PROFILE UPDATE] Received data:', {
      interests: interests?.length || 0,
      seeking: seeking?.length || 0,
      offers: offers?.length || 0,
    });

    // Get existing profile
    console.log('🔍 [PROFILE UPDATE] Fetching existing profile...');
    const existingProfile = await getPeerProfile(userId);
    
    if (!existingProfile) {
      console.log('❌ [PROFILE UPDATE] No existing profile found for user:', userId);
      return NextResponse.json({ 
        error: 'Profile not found. Please complete onboarding first.',
        needsOnboarding: true 
      }, { status: 404 });
    }

    console.log('✅ [PROFILE UPDATE] Existing profile found:', existingProfile.name);

    // Update profile with new data
    const updatedProfile = {
      ...existingProfile,
      interests: interests && interests.length > 0 ? interests : existingProfile.interests,
      seeking: seeking && seeking.length > 0 ? seeking : existingProfile.seeking,
      offers: offers && offers.length > 0 ? offers : existingProfile.offers,
    };

    console.log('🔄 [PROFILE UPDATE] Updated profile data prepared');

    // Regenerate embedding with updated data
    console.log('🧮 [PROFILE UPDATE] Generating new embedding...');
    const profileText = `${updatedProfile.current_struggles.join(' ')} ${updatedProfile.interests.join(' ')} ${updatedProfile.career_field || ''} ${updatedProfile.bio}`;
    const embedding = await generateEmbedding(profileText);
    console.log('✅ [PROFILE UPDATE] Embedding generated, length:', embedding.length);

    // Store updated profile
    console.log('💾 [PROFILE UPDATE] Storing updated profile to Pinecone...');
    await storePeerProfile(updatedProfile, embedding);
    console.log('✅ [PROFILE UPDATE] Profile successfully updated!');

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully' 
    });
  } catch (error: any) {
    console.error('❌ [PROFILE UPDATE] Error:', error);
    console.error('❌ [PROFILE UPDATE] Error stack:', error?.stack);
    return NextResponse.json({ 
      error: 'Failed to update profile',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// Add GET handler to verify route is working
export async function GET() {
  console.log('✅ [PROFILE UPDATE] GET request - route is accessible');
  return NextResponse.json({ 
    message: 'Profile update route is working',
    method: 'Use POST to update profile'
  });
}
