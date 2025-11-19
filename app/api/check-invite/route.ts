import { NextRequest, NextResponse } from 'next/server';
import { isEmailInvited, isEmailOnWaitlist } from '@/lib/supabase/waitlist';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email is invited
    const invited = await isEmailInvited(email);
    
    if (invited) {
      return NextResponse.json({
        allowed: true,
        message: 'Welcome! You can proceed with sign up.'
      });
    }

    // Check if they're on the waitlist but not invited yet
    const onWaitlist = await isEmailOnWaitlist(email);
    
    if (onWaitlist) {
      return NextResponse.json({
        allowed: false,
        onWaitlist: true,
        message: 'You\'re on the waitlist! I\'ll reach out personally when it\'s your turn.'
      });
    }

    // Not on waitlist at all
    return NextResponse.json({
      allowed: false,
      onWaitlist: false,
      message: 'Navia is currently invite-only. Join the waitlist to be notified!'
    });

  } catch (error) {
    console.error('Check invite error:', error);
    return NextResponse.json(
      { error: 'An error occurred checking invite status' },
      { status: 500 }
    );
  }
}
