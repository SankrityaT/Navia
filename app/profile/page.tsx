// FRONTEND: Profile view page
// Shows user's complete profile with edit button

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Edit, User, Brain, Target, Briefcase, Heart, Users, Calendar, Sparkles } from 'lucide-react';

interface ProfileData {
  name: string;
  neurotype: string[];
  current_struggles: string[];
  current_goals: string[];
  job_field?: string;
  graduation_timeline: string;
  interests: string[];
  seeking: string[];
  offers: string[];
  bio: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Fetch from Supabase (primary profile data)
      const response = await fetch('/api/profile');
      const data = await response.json();
      console.log('🎯 [PROFILE VIEW] API response:', data);

      if (data.success && data.profile) {
        const profileData = data.profile;
        console.log('📋 [PROFILE VIEW] Raw profile data:', profileData);
        
        // Convert Supabase object format to display arrays
        const processedProfile = {
          ...profileData,
          neurotype: profileData.neurotypes ? 
            Object.entries(profileData.neurotypes)
              .filter(([_, selected]) => selected)
              .map(([key]) => key) : [],
          current_struggles: profileData.ef_challenges ? 
            Object.entries(profileData.ef_challenges)
              .filter(([_, selected]) => selected)
              .map(([key]) => key) : [],
          current_goals: Array.isArray(profileData.current_goals) ? 
            profileData.current_goals : 
            (profileData.current_goal ? [profileData.current_goal] : []),
        };
        
        console.log('🔄 [PROFILE VIEW] Processed profile:', processedProfile);
        setProfile(processedProfile);
      }
    } catch (error) {
      console.error('❌ [PROFILE VIEW] Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--clay-500)]"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!profile) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--charcoal)] mb-4">No Profile Found</h2>
            <button
              onClick={() => router.push('/onboarding')}
              className="px-6 py-3 bg-[var(--clay-500)] text-[var(--cream)] rounded-2xl font-semibold"
            >
              Complete Onboarding
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 texture-grain"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--sage-100)] rounded-full mb-4">
                <User className="w-4 h-4 text-[var(--sage-600)]" />
                <span className="text-sm text-[var(--sage-700)] font-medium">Your Profile</span>
              </div>
              <h1 className="text-4xl font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
                {profile.name}
              </h1>
              <p className="text-[var(--charcoal)]/70 text-lg">{profile.bio}</p>
            </div>
            <button
              onClick={() => router.push('/profile/edit')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Edit className="w-5 h-5" />
              Edit Profile
            </button>
          </div>

          {/* Profile Sections */}
          <div className="space-y-6">
            {/* Neurotype */}
            <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-[var(--clay-500)]" />
                <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Neurotype
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.neurotype && profile.neurotype.length > 0 ? (
                  profile.neurotype.map((type) => (
                    <span key={type} className="px-4 py-2 bg-[var(--clay-100)] text-[var(--clay-700)] rounded-xl font-medium">
                      {formatLabel(type)}
                    </span>
                  ))
                ) : (
                  <p className="text-[var(--charcoal)]/60">Not specified</p>
                )}
              </div>
            </div>

            {/* EF Challenges */}
            <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-[var(--clay-500)]" />
                <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Executive Function Challenges
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.current_struggles && profile.current_struggles.length > 0 ? (
                  profile.current_struggles.map((struggle) => (
                    <span key={struggle} className="px-4 py-2 bg-[var(--sage-100)] text-[var(--sage-700)] rounded-xl font-medium">
                      {formatLabel(struggle)}
                    </span>
                  ))
                ) : (
                  <p className="text-[var(--charcoal)]/60">Not specified</p>
                )}
              </div>
            </div>

            {/* Current Goals */}
            {profile.current_goals && profile.current_goals.length > 0 && (
              <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-[var(--clay-500)]" />
                  <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                    Current Focus
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.current_goals.map((goal) => (
                    <span key={goal} className="px-4 py-2 bg-[var(--clay-50)] text-[var(--clay-700)] rounded-xl font-medium">
                      {formatLabel(goal)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Career & Timeline */}
            <div className="grid md:grid-cols-2 gap-6">
              {profile.job_field && (
                <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase className="w-5 h-5 text-[var(--clay-500)]" />
                    <h3 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Career Field
                    </h3>
                  </div>
                  <p className="text-[var(--charcoal)] font-medium">{profile.job_field}</p>
                </div>
              )}
              
              <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-[var(--clay-500)]" />
                  <h3 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                    Graduation
                  </h3>
                </div>
                <p className="text-[var(--charcoal)] font-medium">{profile.graduation_timeline}</p>
              </div>
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-[var(--clay-500)]" />
                  <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                    Interests
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span key={interest} className="px-4 py-2 bg-[var(--sage-50)] text-[var(--sage-700)] rounded-xl font-medium">
                      {formatLabel(interest)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Seeking & Offering */}
            <div className="grid md:grid-cols-2 gap-6">
              {profile.seeking && profile.seeking.length > 0 && (
                <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-5 h-5 text-[var(--clay-500)]" />
                    <h3 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Looking For
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.seeking.map((item) => (
                      <span key={item} className="px-3 py-1.5 bg-[var(--clay-50)] text-[var(--clay-700)] rounded-lg text-sm font-medium">
                        {formatLabel(item)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.offers && profile.offers.length > 0 && (
                <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-[var(--clay-500)]" />
                    <h3 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                      Can Offer
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.offers.map((item) => (
                      <span key={item} className="px-3 py-1.5 bg-[var(--sage-50)] text-[var(--sage-700)] rounded-lg text-sm font-medium">
                        {formatLabel(item)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
