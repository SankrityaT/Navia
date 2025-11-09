// FRONTEND: Comprehensive Profile Edit Page
// Allows users to edit ALL their profile data

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Check, Sparkles, ArrowLeft, Brain, Target, Calendar, Briefcase, Heart, Users } from 'lucide-react';

interface ProfileData {
  name: string;
  neurotypes: string[];
  current_struggles: string[];
  current_goals: string[];
  job_field: string;
  graduation_timeline: string;
  interests: string[];
  seeking: string[];
  offers: string[];
  bio: string;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Form state
  const [selectedNeurotypes, setSelectedNeurotypes] = useState<string[]>([]);
  const [selectedStruggles, setSelectedStruggles] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [jobField, setJobField] = useState('');
  const [graduationTimeline, setGraduationTimeline] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedSeeking, setSelectedSeeking] = useState<string[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  // Options
  const neurotypeOptions = [
    { key: 'adhd', label: 'ADHD' },
    { key: 'autism', label: 'Autism' },
    { key: 'dyslexia', label: 'Dyslexia' },
    { key: 'anxiety_depression', label: 'Anxiety/Depression' },
    { key: 'other', label: 'Other' },
    { key: 'prefer_not_to_say', label: 'Prefer not to say' },
    { key: 'not_sure', label: "Not sure / I'm exploring" },
  ];

  const struggleOptions = [
    { key: 'starting_tasks', label: 'Starting tasks / Getting started' },
    { key: 'time_management', label: 'Time management / Deadlines' },
    { key: 'organization', label: 'Organization / Remembering details' },
    { key: 'decision_making', label: 'Decision-making / Analysis paralysis' },
    { key: 'emotional_regulation', label: 'Emotional regulation / Stress' },
    { key: 'social_interaction', label: 'Social interaction' },
    { key: 'focus', label: 'Focus / Concentration' },
  ];

  const goalOptions = [
    { key: 'finding_job', label: 'Finding a job' },
    { key: 'managing_money', label: 'Managing money / Budget' },
    { key: 'getting_organized', label: 'Getting organized / Routines' },
    { key: 'making_friends', label: 'Making friends / Social' },
    { key: 'moving', label: 'Moving / Independent living' },
    { key: 'all_above', label: 'All of the above (jumbled)' },
    { key: 'not_sure', label: 'Not sure yet' },
  ];

  const graduationOptions = [
    { key: 'Graduating this year', label: 'Graduating this year' },
    { key: '3-6 months ago', label: '3-6 months ago' },
    { key: '6-12 months ago', label: '6-12 months ago' },
    { key: '1-2 years ago', label: '1-2 years ago' },
    { key: '2+ years ago', label: '2+ years ago' },
    { key: 'Never went to college', label: 'Never went to college' },
  ];

  const interestOptions = [
    { key: 'productivity_tools', label: 'Productivity tools & apps' },
    { key: 'body_doubling', label: 'Body doubling / Co-working' },
    { key: 'mental_health', label: 'Mental health & wellness' },
    { key: 'career_development', label: 'Career development' },
    { key: 'creative_hobbies', label: 'Creative hobbies' },
    { key: 'fitness_health', label: 'Fitness & health' },
    { key: 'gaming', label: 'Gaming' },
    { key: 'reading_books', label: 'Reading & books' },
    { key: 'music', label: 'Music' },
    { key: 'cooking', label: 'Cooking' },
    { key: 'travel', label: 'Travel' },
    { key: 'pets', label: 'Pets' },
    { key: 'neurodivergent_community', label: 'Neurodivergent community' },
    { key: 'executive_function_support', label: 'Executive function support' },
  ];

  const seekingOptions = [
    { key: 'accountability_partner', label: 'Accountability partner' },
    { key: 'peer_support', label: 'General peer support' },
    { key: 'career_guidance', label: 'Career guidance' },
    { key: 'job_search_support', label: 'Job search help' },
    { key: 'budgeting_help', label: 'Budgeting & money management' },
    { key: 'organization_tips', label: 'Organization & planning tips' },
    { key: 'social_support', label: 'Social skills & friendship' },
    { key: 'emotional_support', label: 'Emotional support' },
    { key: 'task_initiation_support', label: 'Help starting tasks' },
    { key: 'time_management_tips', label: 'Time management strategies' },
  ];

  const offersOptions = [
    { key: 'accountability_partner', label: 'Accountability partnership' },
    { key: 'listening_ear', label: 'Listening & emotional support' },
    { key: 'career_advice', label: 'Career advice' },
    { key: 'resume_help', label: 'Resume/interview help' },
    { key: 'budgeting_tips', label: 'Budgeting tips' },
    { key: 'organization_strategies', label: 'Organization strategies' },
    { key: 'social_encouragement', label: 'Social encouragement' },
    { key: 'task_breakdown', label: 'Task breakdown help' },
    { key: 'time_management', label: 'Time management tips' },
    { key: 'motivation', label: 'Motivation & encouragement' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Fetch from Supabase (primary profile data)
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (data.success && data.profile) {
        const profileData = data.profile;
        setProfile(profileData);

        // Parse JSON fields and set form state
        const neurotypes = profileData.neurotypes || {};
        const efChallenges = profileData.ef_challenges || {};

        setSelectedNeurotypes(Object.entries(neurotypes).filter(([_, v]) => v).map(([k]) => k));
        setSelectedStruggles(Object.entries(efChallenges).filter(([_, v]) => v).map(([k]) => k));
        setSelectedGoals(Array.isArray(profileData.current_goals) ? profileData.current_goals : []);
        setJobField(profileData.job_field || '');
        setGraduationTimeline(profileData.graduation_timeline || '');
        setSelectedInterests(profileData.interests || []);
        setSelectedSeeking(profileData.seeking || []);
        setSelectedOffers(profileData.offers || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (array: string[], setter: (value: string[]) => void, key: string) => {
    if (array.includes(key)) {
      setter(array.filter(i => i !== key));
    } else {
      setter([...array, key]);
    }
  };

  const handleSave = async () => {
    console.log('💾 [PROFILE EDIT] Starting comprehensive save...');
    setSaving(true);

    try {
      // Convert arrays to objects for Supabase
      const neurotypesObj = selectedNeurotypes.reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);

      const efChallengesObj = selectedStruggles.reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);

      // Save to Supabase first
      console.log('💾 [PROFILE EDIT] Saving to Supabase...');
      console.log('📤 [PROFILE EDIT] Sending data:', {
        neurotypes: neurotypesObj,
        ef_challenges: efChallengesObj,
        current_goals: selectedGoals,
        job_field: jobField,
        graduation_timeline: graduationTimeline,
        interests: selectedInterests,
        seeking: selectedSeeking,
        offers: selectedOffers,
      });
      
      const supabaseResponse = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neurotypes: neurotypesObj,
          ef_challenges: efChallengesObj,
          current_goals: selectedGoals,
          job_field: jobField,
          graduation_timeline: graduationTimeline,
          interests: selectedInterests,
          seeking: selectedSeeking,
          offers: selectedOffers,
        }),
      });

      console.log('📥 [PROFILE EDIT] Supabase response status:', supabaseResponse.status);
      const supabaseData = await supabaseResponse.json();
      console.log('📥 [PROFILE EDIT] Supabase response data:', supabaseData);

      if (!supabaseResponse.ok) {
        console.error('❌ [PROFILE EDIT] Supabase save failed:', supabaseData);
        throw new Error(`Supabase save failed: ${supabaseData.error || 'Unknown error'}`);
      }

      // Then update Pinecone for peer matching
      console.log('💾 [PROFILE EDIT] Updating Pinecone...');
      const pineconeResponse = await fetch('/api/peers/profile-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: selectedInterests,
          seeking: selectedSeeking,
          offers: selectedOffers,
        }),
      });

      if (!pineconeResponse.ok) {
        console.warn('Pinecone update failed, but Supabase saved successfully');
      }

      console.log('✅ [PROFILE EDIT] Save successful, redirecting to profile');
      alert('Profile updated successfully!');
      router.push('/profile');
    } catch (error) {
      console.error('❌ [PROFILE EDIT] Error saving profile:', error);
      alert(`Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
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

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 texture-grain"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/profile')}
              className="p-2 hover:bg-[var(--sand)] rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--charcoal)]" />
            </button>
            <div>
              <h1 className="text-4xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                Edit Profile
              </h1>
              <p className="text-[var(--charcoal)]/70 text-lg">
                Update any part of your profile
              </p>
            </div>
          </div>

          <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-8 space-y-8">
            {/* Neurotype */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-[var(--clay-500)]" />
                <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Neurotype
                </h2>
              </div>
              <p className="text-[var(--charcoal)]/60 text-sm mb-4">Pick all that apply</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {neurotypeOptions.map((option) => {
                  const isSelected = selectedNeurotypes.includes(option.key);

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleSelection(selectedNeurotypes, setSelectedNeurotypes, option.key)}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 text-sm ${
                        isSelected
                          ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                          : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                            : 'border-[var(--charcoal)]/30'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-[var(--cream)]" strokeWidth={3} />
                        )}
                      </div>
                      <span className="font-medium text-[var(--charcoal)]">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EF Challenges */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-[var(--clay-500)]" />
                <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Executive Function Challenges
                </h2>
              </div>
              <p className="text-[var(--charcoal)]/60 text-sm mb-4">Pick all that apply</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {struggleOptions.map((option) => {
                  const isSelected = selectedStruggles.includes(option.key);

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleSelection(selectedStruggles, setSelectedStruggles, option.key)}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 text-sm ${
                        isSelected
                          ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                          : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                            : 'border-[var(--charcoal)]/30'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-[var(--cream)]" strokeWidth={3} />
                        )}
                      </div>
                      <span className="font-medium text-[var(--charcoal)]">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Goals */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-[var(--clay-500)]" />
                <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Current Focus
                </h2>
              </div>
              <p className="text-[var(--charcoal)]/60 text-sm mb-4">Pick all that apply</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {goalOptions.map((option) => {
                  const isSelected = selectedGoals.includes(option.key);

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleSelection(selectedGoals, setSelectedGoals, option.key)}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 text-sm ${
                        isSelected
                          ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                          : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                            : 'border-[var(--charcoal)]/30'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-[var(--cream)]" strokeWidth={3} />
                        )}
                      </div>
                      <span className="font-medium text-[var(--charcoal)]">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Job Field - Show if finding job is selected */}
              {selectedGoals.includes('finding_job') && (
                <div className="mt-4">
                  <label className="block text-lg font-medium text-[var(--charcoal)] mb-3">
                    Career Field <span className="text-[var(--charcoal)]/60 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={jobField}
                    onChange={(e) => setJobField(e.target.value)}
                    placeholder="e.g. Software Development, Healthcare, Finance..."
                    className="w-full px-4 py-3 border-2 border-[var(--clay-300)] rounded-xl focus:ring-2 focus:ring-[var(--clay-500)] focus:border-transparent bg-[var(--cream)] text-[var(--charcoal)] font-medium"
                  />
                </div>
              )}
            </div>

            {/* Graduation Timeline */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-[var(--clay-500)]" />
                <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Graduation Timeline
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {graduationOptions.map((option) => {
                  const isSelected = graduationTimeline === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setGraduationTimeline(option.key)}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 text-sm ${
                        isSelected
                          ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                          : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                            : 'border-[var(--charcoal)]/30'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-[var(--cream)]" strokeWidth={3} />
                        )}
                      </div>
                      <span className="font-medium text-[var(--charcoal)]">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-[var(--clay-500)]" />
                <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  Interests {selectedInterests.length > 0 && `(${selectedInterests.length}/8)`}
                </h2>
              </div>
              <p className="text-[var(--charcoal)]/60 text-sm mb-4">Pick up to 8 things you enjoy</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {interestOptions.map((option) => {
                  const isSelected = selectedInterests.includes(option.key);
                  const isDisabled = !isSelected && selectedInterests.length >= 8;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleSelection(selectedInterests, setSelectedInterests, option.key)}
                      disabled={isDisabled}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 text-sm ${
                        isSelected
                          ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                          : isDisabled
                            ? 'border-[var(--stone)] bg-[var(--sand)]/20 opacity-50 cursor-not-allowed'
                            : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                            : 'border-[var(--charcoal)]/30'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-[var(--cream)]" strokeWidth={3} />
                        )}
                      </div>
                      <span className="font-medium text-[var(--charcoal)]">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What You're Seeking */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-[var(--clay-500)]" />
                <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  What you're looking for {selectedSeeking.length > 0 && `(${selectedSeeking.length}/6)`}
                </h2>
              </div>
              <p className="text-[var(--charcoal)]/60 text-sm mb-4">Pick up to 6 types of support</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {seekingOptions.map((option) => {
                  const isSelected = selectedSeeking.includes(option.key);
                  const isDisabled = !isSelected && selectedSeeking.length >= 6;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleSelection(selectedSeeking, setSelectedSeeking, option.key)}
                      disabled={isDisabled}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 text-sm ${
                        isSelected
                          ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                          : isDisabled
                            ? 'border-[var(--stone)] bg-[var(--sand)]/20 opacity-50 cursor-not-allowed'
                            : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                            : 'border-[var(--charcoal)]/30'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-[var(--cream)]" strokeWidth={3} />
                        )}
                      </div>
                      <span className="font-medium text-[var(--charcoal)]">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What You Can Offer */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-[var(--clay-500)]" />
                <h2 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  What you can offer {selectedOffers.length > 0 && `(${selectedOffers.length}/6)`}
                </h2>
              </div>
              <p className="text-[var(--charcoal)]/60 text-sm mb-4">Pick up to 6 ways you can help others</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {offersOptions.map((option) => {
                  const isSelected = selectedOffers.includes(option.key);
                  const isDisabled = !isSelected && selectedOffers.length >= 6;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleSelection(selectedOffers, setSelectedOffers, option.key)}
                      disabled={isDisabled}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 text-sm ${
                        isSelected
                          ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                          : isDisabled
                            ? 'border-[var(--stone)] bg-[var(--sand)]/20 opacity-50 cursor-not-allowed'
                            : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-[var(--clay-500)] bg-[var(--clay-500)]'
                            : 'border-[var(--charcoal)]/30'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-[var(--cream)]" strokeWidth={3} />
                        )}
                      </div>
                      <span className="font-medium text-[var(--charcoal)]">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => router.push('/profile')}
                disabled={saving}
                className="flex-1 px-6 py-4 bg-[var(--stone)] hover:bg-[var(--charcoal)]/20 text-[var(--charcoal)] rounded-2xl font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {saving ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Profile
                    <Sparkles className="w-5 h-5" strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
