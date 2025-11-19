import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

/**
 * Get the user's preferred name from Supabase, falling back to Clerk firstName
 * This respects what the user told us during onboarding
 */
export function usePreferredName(): string {
  const { user } = useUser();
  const [preferredName, setPreferredName] = useState<string>('friend');
  
  useEffect(() => {
    if (!user?.id) return;
    
    // Fetch name from Supabase user_profiles
    fetch('/api/user-profile')
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setPreferredName(data.name);
        } else {
          // Fall back to Clerk firstName
          setPreferredName(user.firstName || 'friend');
        }
      })
      .catch(() => {
        // On error, fall back to Clerk firstName
        setPreferredName(user.firstName || 'friend');
      });
  }, [user?.id, user?.firstName]);
  
  return preferredName;
}
