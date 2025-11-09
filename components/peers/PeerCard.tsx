// FRONTEND: Research-optimized peer connection card
// Design based on Synapse 2025 study: emphasizes mutual support, near-peer status,
// safe space indicators, and strengths-based matching (not deficit-focused)

'use client';

import { PeerProfile } from '@/lib/types';
import { 
  MapPin, 
  Briefcase, 
  Heart, 
  MessageCircle, 
  X, 
  Check, 
  GraduationCap,
  Sparkles,
  HandHeart,
  Shield,
  Coffee,
  Gamepad2,
  Mountain,
  Music,
  Book,
  Palette
} from 'lucide-react';

interface PeerCardProps {
  peer: PeerProfile;
  matchScore: number;
  matchReasons: string[];
  onConnect?: (userId: string) => void;
  onPass?: (userId: string) => void;
}

export default function PeerCard({ peer, matchScore, matchReasons, onConnect, onPass }: PeerCardProps) {
  // Helper to get interest icons
  const getInterestIcon = (interest: string) => {
    const lower = interest.toLowerCase();
    if (lower.includes('coffee') || lower.includes('cafe')) return <Coffee className="w-3.5 h-3.5" />;
    if (lower.includes('game') || lower.includes('gaming')) return <Gamepad2 className="w-3.5 h-3.5" />;
    if (lower.includes('hik') || lower.includes('outdoor') || lower.includes('nature')) return <Mountain className="w-3.5 h-3.5" />;
    if (lower.includes('music')) return <Music className="w-3.5 h-3.5" />;
    if (lower.includes('read') || lower.includes('book')) return <Book className="w-3.5 h-3.5" />;
    if (lower.includes('art') || lower.includes('design')) return <Palette className="w-3.5 h-3.5" />;
    return <Sparkles className="w-3.5 h-3.5" />;
  };

  return (
    <div className="relative bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-8 max-w-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 texture-grain rounded-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header with Near-Peer Badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-3xl font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
              {peer.name}
            </h3>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--clay-200)]/60 rounded-full border border-[var(--clay-400)]/30">
              <GraduationCap className="w-4 h-4 text-[var(--clay-700)]" strokeWidth={2.5} />
              <span className="text-sm font-medium text-[var(--clay-800)]">
                {peer.months_post_grad} months post-grad
              </span>
            </div>
          </div>
          <div className="text-right ml-4">
            <div className="text-3xl font-serif font-bold text-[var(--clay-600)]" style={{fontFamily: 'var(--font-fraunces)'}}>
              {matchScore}%
            </div>
            <div className="text-xs text-[var(--charcoal)]/60 font-medium uppercase tracking-wider">Match</div>
          </div>
        </div>

        {/* Safe Space Indicator */}
        {peer.neurotype.length > 0 && (
          <div className="mb-6 p-4 bg-[var(--sage-400)]/20 rounded-2xl border border-[var(--sage-500)]/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[var(--sage-600)]" strokeWidth={2.5} />
              <span className="text-sm font-semibold text-[var(--sage-600)] uppercase tracking-wide">Safe Space</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {peer.neurotype.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-[var(--sage-500)]/30 text-[var(--moss-600)] rounded-full text-sm font-medium border border-[var(--sage-500)]/40"
                >
                  {type}
                </span>
              ))}
            </div>
            <p className="text-xs text-[var(--charcoal)]/60 mt-2 italic">No masking required</p>
          </div>
        )}

        {/* Bio */}
        <p className="text-[var(--charcoal)]/80 mb-6 leading-relaxed italic">"{peer.bio}"</p>

        {/* We Both Section (Shared Struggles) */}
        {peer.current_struggles.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <HandHeart className="w-5 h-5 text-[var(--clay-600)]" strokeWidth={2.5} />
              <h4 className="text-sm font-bold text-[var(--charcoal)] uppercase tracking-wide">We Both</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {peer.current_struggles.map((struggle) => (
                <span
                  key={struggle}
                  className="px-3 py-1.5 bg-[var(--clay-100)] text-[var(--clay-800)] rounded-lg text-sm font-medium border border-[var(--clay-300)]/40"
                >
                  {struggle.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* What They Offer (Strengths-Based) */}
        {peer.offers && peer.offers.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[var(--sage-600)]" strokeWidth={2.5} />
              <h4 className="text-sm font-bold text-[var(--charcoal)] uppercase tracking-wide">{peer.name} Offers</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {peer.offers.map((offer) => (
                <span
                  key={offer}
                  className="px-3 py-1.5 bg-[var(--sage-400)]/30 text-[var(--moss-600)] rounded-lg text-sm font-medium border border-[var(--sage-500)]/40"
                >
                  {offer.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* What They Need (Reciprocal) */}
        {peer.seeking && peer.seeking.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-[var(--clay-500)]" strokeWidth={2.5} />
              <h4 className="text-sm font-bold text-[var(--charcoal)] uppercase tracking-wide">{peer.name} Needs</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {peer.seeking.map((need) => (
                <span
                  key={need}
                  className="px-3 py-1.5 bg-[var(--cream)] text-[var(--clay-700)] rounded-lg text-sm font-medium border border-[var(--clay-300)]/40"
                >
                  {need.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {peer.interests.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {peer.interests.slice(0, 5).map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--stone)]/60 text-[var(--charcoal)]/70 rounded-full text-sm font-medium border border-[var(--clay-300)]/30"
                >
                  {getInterestIcon(interest)}
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Career & Location */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm text-[var(--charcoal)]/60">
          {peer.career_field && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" strokeWidth={2} />
              <span>{peer.career_field}</span>
            </div>
          )}
          {peer.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" strokeWidth={2} />
              <span>{peer.location}</span>
            </div>
          )}
        </div>

        {/* Match Reasons */}
        {matchReasons.length > 0 && (
          <div className="mb-8 p-5 bg-[var(--clay-100)]/50 rounded-2xl border border-[var(--clay-300)]/40">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-[var(--clay-600)]" strokeWidth={2.5} />
              <p className="text-sm font-bold text-[var(--clay-800)] uppercase tracking-wide">Why You Match</p>
            </div>
            <ul className="space-y-2">
              {matchReasons.map((reason, idx) => (
                <li key={idx} className="text-sm text-[var(--charcoal)]/80 leading-relaxed flex items-start gap-2">
                  <span className="text-[var(--clay-600)] mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => onPass?.(peer.user_id)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[var(--stone)] hover:bg-[var(--clay-200)] text-[var(--charcoal)] rounded-2xl font-semibold transition-all duration-300 border-2 border-[var(--clay-300)]/40 hover:border-[var(--clay-400)]/60 hover:-translate-y-0.5"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
            Skip
          </button>
          <button
            onClick={() => onConnect?.(peer.user_id)}
            className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Check className="w-5 h-5" strokeWidth={2.5} />
            Start Mutual Accountability
          </button>
          <button
            onClick={() => {/* TODO: Implement message first */}}
            className="flex items-center justify-center px-5 py-4 bg-[var(--sage-400)]/40 hover:bg-[var(--sage-400)]/60 text-[var(--moss-600)] rounded-2xl font-semibold transition-all duration-300 border-2 border-[var(--sage-500)]/40 hover:border-[var(--sage-500)]/60 hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
