'use client';

import { useState, useEffect } from 'react';
import { SignUp, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProtectedSignUp() {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is already signed in, redirect to dashboard
    if (user) {
      router.push('/dashboard-new');
      return;
    }

    // For now, we'll check on the Clerk webhook after sign-up
    // This component will show the sign-up form, but the webhook will validate
    setChecking(false);
    setAllowed(true);
  }, [user, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--sand)] via-[var(--cream)] to-[var(--clay-100)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--clay-500)] mx-auto mb-4" />
          <p className="text-[var(--charcoal)]/70">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--sand)] via-[var(--cream)] to-[var(--clay-100)] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
            Access Restricted
          </h2>
          <p className="text-[var(--charcoal)]/70 mb-6">{message}</p>
          <button
            onClick={() => router.push('/invite-only')}
            className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            Learn More
          </button>
        </div>
      </div>
    );
  }

  return <SignUp />;
}
