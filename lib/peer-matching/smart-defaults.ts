// Smart defaults for peer matching based on onboarding data
// Maps user's goals and challenges to interests, seeking, and offers

export function getSmartDefaults(data: {
  current_goal: string;
  ef_challenges: string[];
  neurotype: string[];
  job_field?: string;
}) {
  const interests: string[] = [];
  const seeking: string[] = [];
  const offers: string[] = [];

  // Map current goal to seeking
  const goalToSeeking: Record<string, string[]> = {
    finding_job: ['career_guidance', 'job_search_support', 'resume_help', 'interview_prep'],
    managing_money: ['budgeting_help', 'financial_planning', 'money_management'],
    getting_organized: ['organization_tips', 'routine_building', 'productivity_tools'],
    making_friends: ['social_support', 'friendship_building', 'social_skills'],
    moving: ['independent_living', 'apartment_hunting', 'life_skills'],
    all_above: ['accountability_partner', 'peer_support', 'general_guidance'],
    not_sure: ['accountability_partner', 'peer_support'],
  };

  seeking.push(...(goalToSeeking[data.current_goal] || ['accountability_partner', 'peer_support']));

  // Map EF challenges to seeking
  const efToSeeking: Record<string, string[]> = {
    starting_tasks: ['task_initiation_support', 'accountability_partner'],
    time_management: ['time_management_tips', 'deadline_support'],
    organization: ['organization_tips', 'planning_help'],
    decision_making: ['decision_support', 'problem_solving'],
    emotional_regulation: ['emotional_support', 'stress_management'],
    social_interaction: ['social_support', 'communication_tips'],
    focus: ['focus_strategies', 'distraction_management'],
  };

  data.ef_challenges.forEach(challenge => {
    const challengeSeeking = efToSeeking[challenge];
    if (challengeSeeking) {
      challengeSeeking.forEach(item => {
        if (!seeking.includes(item)) {
          seeking.push(item);
        }
      });
    }
  });

  // Map neurotype to common interests (research-based)
  const neuroTypeInterests: Record<string, string[]> = {
    adhd: ['productivity_tools', 'body_doubling', 'hyperfocus_topics'],
    autism: ['special_interests', 'structured_routines', 'sensory_friendly_spaces'],
    dyslexia: ['audiobooks', 'assistive_tech', 'creative_expression'],
    anxiety_depression: ['mental_health', 'self_care', 'mindfulness'],
  };

  data.neurotype.forEach((type: string) => {
    const typeInterests = neuroTypeInterests[type];
    if (typeInterests) {
      typeInterests.forEach((item: string) => {
        if (!interests.includes(item)) {
          interests.push(item);
        }
      });
    }
  });

  // Add general neurodivergent interests
  interests.push('neurodivergent_community', 'executive_function_support');

  // Add career field as interest if provided
  if (data.job_field) {
    interests.push(data.job_field.toLowerCase().replace(/\//g, '_').replace(/\s+/g, '_'));
  }

  // Limit to reasonable numbers
  return {
    interests: interests.slice(0, 8),
    seeking: seeking.slice(0, 6),
    offers: offers, // Will be populated later or via profile edit
  };
}
