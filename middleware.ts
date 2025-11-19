import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isUserOnboarded } from '@/lib/supabase/operations';
import { isEmailInvited } from '@/lib/supabase/waitlist';

/**
 * ROUTE PROTECTION SYSTEM
 * 
 * This middleware protects ALL routes by default using Clerk authentication.
 * 
 * HOW IT WORKS:
 * 1. Public routes (/, /sign-in, /sign-up) are accessible without login
 * 2. All other routes require authentication via auth.protect()
 * 3. Authenticated users must complete onboarding before accessing app
 * 4. Trying to access /dashboard, /peers, /chat, etc. without login redirects to /sign-in
 * 
 * PROTECTED ROUTES (require authentication):
 * - /dashboard - Main dashboard
 * - /chat - AI chat interface
 * - /tasks - Task management
 * - /peers - Find peer connections
 * - /connections - View existing connections
 * - /peers/chat/[id] - Peer chat
 * - /profile - User profile
 * - /onboarding - Onboarding flow
 */

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',              // Landing page
  '/sign-in(.*)',   // Sign-in pages
  '/sign-up(.*)',   // Sign-up pages
  '/waitlist',      // Waitlist page
  '/invite-only',   // Invite-only page
]);

// Protected routes that require special handling
const isOnboardingRoute = createRouteMatcher(['/onboarding', '/onboarding-new', '/onboarding-v2']);
const isApiRoute = createRouteMatcher(['/api(.*)']);

export default clerkMiddleware(async (auth, request) => {
  console.log('[MIDDLEWARE] Processing request:', request.nextUrl.pathname);
  const { userId } = await auth();
  console.log('[MIDDLEWARE] User ID:', userId);

  // Allow public routes without authentication
  if (isPublicRoute(request)) {
    console.log('[MIDDLEWARE] Public route, allowing');
    return NextResponse.next();
  }

  // Allow API routes without authentication (they handle their own auth)
  if (isApiRoute(request)) {
    console.log('[MIDDLEWARE] API route, allowing');
    return NextResponse.next();
  }

  // PROTECT ALL NON-PUBLIC, NON-API ROUTES - Require authentication
  // This will redirect unauthenticated users to sign-in
  await auth.protect();

  // If user is authenticated, check invite status and onboarding
  if (userId) {
    try {
      // TEMPORARILY DISABLE INVITE CHECK - We'll implement this properly with Clerk user metadata
      // For now, allow all authenticated users
      console.log('[MIDDLEWARE] Skipping invite check for now - needs proper implementation');

      // Check onboarding status
      const hasCompletedOnboarding = await isUserOnboarded(userId);
      console.log('[MIDDLEWARE] Onboarding completed:', hasCompletedOnboarding);

      // If user hasn't completed onboarding and is not on onboarding page, redirect to onboarding
      if (!hasCompletedOnboarding && !isOnboardingRoute(request)) {
        console.log('[MIDDLEWARE] Redirecting to onboarding');
        return NextResponse.redirect(new URL('/onboarding-v2', request.url));
      }

      // If user has completed onboarding and is on onboarding page, redirect to dashboard
      if (hasCompletedOnboarding && isOnboardingRoute(request)) {
        console.log('[MIDDLEWARE] Redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard-new', request.url));
      }
    } catch (error) {
      console.error('[MIDDLEWARE] Error checking user access:', error);
      // On error, allow the request to proceed to avoid blocking the user
    }
  }

  console.log('[MIDDLEWARE] Allowing request to proceed');
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
