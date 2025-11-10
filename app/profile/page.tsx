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
  const [avatarColor, setAvatarColor] = useState('#C17A5F'); // Default clay color
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    fetchProfile();
    // Load saved avatar color from localStorage
    const savedColor = localStorage.getItem('avatarColor');
    if (savedColor) {
      setAvatarColor(savedColor);
    }
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

  const handleColorChange = (color: string) => {
    setAvatarColor(color);
    localStorage.setItem('avatarColor', color);
    setShowColorPicker(false);
  };

  const colorOptions = [
    { name: 'Clay', color: '#C17A5F' },
    { name: 'Sage', color: '#7FA68A' },
    { name: 'Moss', color: '#5F7A5F' },
    { name: 'Ocean', color: '#5F8FA6' },
    { name: 'Lavender', color: '#9B7FA6' },
    { name: 'Coral', color: '#E89B8C' },
    { name: 'Amber', color: '#D4A574' },
    { name: 'Rose', color: '#C17A8C' },
  ];

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
        {/* Creative Background with Organic Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[var(--clay-200)] to-[var(--clay-300)] rounded-full blur-[120px] opacity-20 -translate-y-1/3 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--sage-300)] to-[var(--sage-400)] rounded-full blur-[100px] opacity-15 translate-y-1/3 -translate-x-1/4"></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-[var(--moss-200)] to-[var(--moss-300)] rounded-full blur-[130px] opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
          {/* Hero Header with Avatar Circle */}
          <div className="mb-16">
            <div className="flex flex-col items-center text-center mb-8">
              {/* Large Avatar Circle with Color Picker */}
              <div className="relative mb-6">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="relative group cursor-pointer"
                >
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-4 border-white transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${avatarColor}dd, ${avatarColor})`
                    }}
                  >
                    <span className="text-5xl font-serif font-bold text-white" style={{fontFamily: 'var(--font-fraunces)'}}>
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div 
                    className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
                    style={{backgroundColor: avatarColor}}
                  ></div>
                  {/* Edit Icon Overlay */}
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Edit className="w-4 h-4 text-[var(--charcoal)]" strokeWidth={2.5} />
                  </div>
                </button>

                {/* Color Picker Dropdown */}
                {showColorPicker && (
                  <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border-2 border-[var(--clay-200)] p-4 z-50 min-w-[280px]">
                    <div className="text-sm font-semibold text-[var(--charcoal)] mb-3">Choose Avatar Color</div>
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map((option) => (
                        <button
                          key={option.name}
                          onClick={() => handleColorChange(option.color)}
                          className="group relative"
                          title={option.name}
                        >
                          <div 
                            className="w-14 h-14 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 border-2 border-transparent hover:border-white"
                            style={{backgroundColor: option.color}}
                          >
                            {avatarColor === option.color && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                                  <div className="w-3 h-3 rounded-full bg-[var(--charcoal)]"></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-[var(--charcoal)]/60 mt-1 font-medium">{option.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Name and Bio */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full mb-4 border border-[var(--clay-200)] shadow-sm">
                <User className="w-3.5 h-3.5 text-[var(--clay-600)]" />
                <span className="text-xs text-[var(--clay-700)] font-medium uppercase tracking-wide">Your Profile</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
                {profile.name}
              </h1>
              
              {profile.bio && (
                <p className="text-[var(--charcoal)]/70 text-xl leading-relaxed max-w-2xl mb-6">{profile.bio}</p>
              )}
              
              {/* Edit Button - Centered */}
              <button
                onClick={() => router.push('/profile/edit')}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[var(--clay-500)] to-[var(--clay-600)] hover:from-[var(--clay-600)] hover:to-[var(--clay-700)] text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
              >
                <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Sections - Clean Grid Layout */}
          <div className="grid gap-5">
            {/* Current Goals - Spotlight Card */}
            {profile.current_goals && profile.current_goals.length > 0 && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--moss-400)] via-[var(--moss-500)] to-[var(--moss-600)] rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-[var(--moss-50)]/30 rounded-3xl p-8 shadow-xl border-2 border-[var(--moss-200)] group-hover:border-[var(--moss-400)] transition-all duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] flex items-center justify-center shadow-lg">
                      <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[var(--moss-600)] uppercase tracking-wide mb-1">What You're Working On</div>
                      <h2 className="text-3xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                        Current Focus
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {profile.current_goals.map((goal) => (
                      <span key={goal} className="px-5 py-2.5 bg-white text-[var(--moss-700)] rounded-xl text-sm font-semibold border-2 border-[var(--moss-200)] hover:border-[var(--moss-400)] hover:shadow-md transition-all">
                        {formatLabel(goal)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Career & Timeline - Three Cards in One Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {/* Neurotype Card */}
              <div className="group relative flex">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-500)] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-3xl p-6 shadow-xl border-2 border-[var(--clay-200)] group-hover:border-[var(--clay-400)] transition-all duration-500 group-hover:-translate-y-1 flex flex-col w-full min-h-[180px]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--clay-100)] rounded-full mb-2">
                        <Brain className="w-3.5 h-3.5 text-[var(--clay-600)]" strokeWidth={2.5} />
                        <span className="text-xs font-semibold text-[var(--clay-700)] uppercase tracking-wide">Identity</span>
                      </div>
                      <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                        Neurotype
                      </h2>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center shadow-lg flex-shrink-0">
                      <Brain className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-grow content-start">
                    {profile.neurotype && profile.neurotype.length > 0 ? (
                      profile.neurotype.map((type) => (
                        <span key={type} className="px-3 py-1.5 bg-gradient-to-r from-[var(--clay-100)] to-[var(--clay-50)] text-[var(--clay-700)] rounded-lg text-xs font-semibold border border-[var(--clay-200)]">
                          {formatLabel(type)}
                        </span>
                      ))
                    ) : (
                      <p className="text-[var(--charcoal)]/40 text-xs italic">Not specified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* EF Challenges Card */}
              <div className="group relative flex">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-3xl p-6 shadow-xl border-2 border-[var(--sage-200)] group-hover:border-[var(--sage-400)] transition-all duration-500 group-hover:-translate-y-1 flex flex-col w-full min-h-[180px]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--sage-100)] rounded-full mb-2">
                        <Target className="w-3.5 h-3.5 text-[var(--sage-600)]" strokeWidth={2.5} />
                        <span className="text-xs font-semibold text-[var(--sage-700)] uppercase tracking-wide">Growth Areas</span>
                      </div>
                      <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                        EF Challenges
                      </h2>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] flex items-center justify-center shadow-lg flex-shrink-0">
                      <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-grow content-start">
                    {profile.current_struggles && profile.current_struggles.length > 0 ? (
                      profile.current_struggles.map((struggle) => (
                        <span key={struggle} className="px-3 py-1.5 bg-gradient-to-r from-[var(--sage-100)] to-[var(--sage-50)] text-[var(--sage-700)] rounded-lg text-xs font-semibold border border-[var(--sage-200)]">
                          {formatLabel(struggle)}
                        </span>
                      ))
                    ) : (
                      <p className="text-[var(--charcoal)]/40 text-xs italic">Not specified</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Timeline Card */}
              <div className="group relative flex">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-3xl p-6 shadow-xl border-2 border-[var(--moss-200)] group-hover:border-[var(--moss-400)] transition-all duration-500 group-hover:-translate-y-1 flex flex-col w-full min-h-[180px]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--moss-100)] rounded-full mb-2">
                        <Calendar className="w-3.5 h-3.5 text-[var(--moss-600)]" strokeWidth={2.5} />
                        <span className="text-xs font-semibold text-[var(--moss-700)] uppercase tracking-wide">Graduation</span>
                      </div>
                      <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                        Timeline
                      </h2>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] flex items-center justify-center shadow-lg flex-shrink-0">
                      <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <p className="text-[var(--charcoal)] font-medium text-base flex-grow">{profile.graduation_timeline}</p>
                </div>
              </div>
            </div>

            {/* Interests, Seeking & Offering - Three Cards in One Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="group relative flex">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-500)] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative bg-white rounded-3xl p-6 shadow-xl border-2 border-[var(--clay-200)] group-hover:border-[var(--clay-400)] transition-all duration-500 group-hover:-translate-y-1 flex flex-col w-full min-h-[180px]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--clay-100)] rounded-full mb-2">
                          <Heart className="w-3.5 h-3.5 text-[var(--clay-600)]" strokeWidth={2.5} />
                          <span className="text-xs font-semibold text-[var(--clay-700)] uppercase tracking-wide">Interests</span>
                        </div>
                        <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                          Interests
                        </h2>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center shadow-lg flex-shrink-0">
                        <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 flex-grow content-start">
                      {profile.interests.map((interest) => (
                        <span key={interest} className="px-3 py-1.5 bg-gradient-to-r from-[var(--clay-100)] to-[var(--clay-50)] text-[var(--clay-700)] rounded-lg text-xs font-semibold border border-[var(--clay-200)]">
                          {formatLabel(interest)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Seeking */}
              {profile.seeking && profile.seeking.length > 0 && (
                <div className="group relative flex">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative bg-white rounded-3xl p-6 shadow-xl border-2 border-[var(--sage-200)] group-hover:border-[var(--sage-400)] transition-all duration-500 group-hover:-translate-y-1 flex flex-col w-full min-h-[180px]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--sage-100)] rounded-full mb-2">
                          <Users className="w-3.5 h-3.5 text-[var(--sage-600)]" strokeWidth={2.5} />
                          <span className="text-xs font-semibold text-[var(--sage-700)] uppercase tracking-wide">Looking For</span>
                        </div>
                        <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                          Seeking
                        </h2>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] flex items-center justify-center shadow-lg flex-shrink-0">
                        <Users className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 flex-grow content-start">
                      {profile.seeking.map((item) => (
                        <span key={item} className="px-3 py-1.5 bg-gradient-to-r from-[var(--sage-100)] to-[var(--sage-50)] text-[var(--sage-700)] rounded-lg text-xs font-semibold border border-[var(--sage-200)]">
                          {formatLabel(item)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Offering */}
              {profile.offers && profile.offers.length > 0 && (
                <div className="group relative flex">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative bg-white rounded-3xl p-6 shadow-xl border-2 border-[var(--moss-200)] group-hover:border-[var(--moss-400)] transition-all duration-500 group-hover:-translate-y-1 flex flex-col w-full min-h-[180px]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--moss-100)] rounded-full mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-[var(--moss-600)]" strokeWidth={2.5} />
                          <span className="text-xs font-semibold text-[var(--moss-700)] uppercase tracking-wide">Can Offer</span>
                        </div>
                        <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                          Offering
                        </h2>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--moss-500)] to-[var(--moss-600)] flex items-center justify-center shadow-lg flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 flex-grow content-start">
                      {profile.offers.map((item) => (
                        <span key={item} className="px-3 py-1.5 bg-gradient-to-r from-[var(--moss-100)] to-[var(--moss-50)] text-[var(--moss-700)] rounded-lg text-xs font-semibold border border-[var(--moss-200)]">
                          {formatLabel(item)}
                        </span>
                      ))}
                    </div>
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
