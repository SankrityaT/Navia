// FRONTEND: Peer profile card
// TODO: Add connection actions
// TODO: Add messaging button

'use client';

import { PeerProfile } from '@/lib/types';
import { MapPin, Briefcase, Heart, MessageCircle, X, Check } from 'lucide-react';

interface PeerCardProps {
  peer: PeerProfile;
  matchScore: number;
  matchReasons: string[];
  onConnect?: (userId: string) => void;
  onPass?: (userId: string) => void;
}

export default function PeerCard({ peer, matchScore, matchReasons, onConnect, onPass }: PeerCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{peer.name}</h3>
          <p className="text-sm text-gray-600">
            {peer.months_post_grad} months post-grad
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{matchScore}%</div>
          <div className="text-xs text-gray-500">Match</div>
        </div>
      </div>

      {/* Neurotype Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {peer.neurotype.map((type) => (
          <span
            key={type}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
          >
            {type}
          </span>
        ))}
      </div>

      {/* Bio */}
      <p className="text-gray-700 mb-4">{peer.bio}</p>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {peer.career_field && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="w-4 h-4" />
            <span>{peer.career_field}</span>
          </div>
        )}
        {peer.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{peer.location}</span>
          </div>
        )}
      </div>

      {/* Current Struggles */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Currently navigating:</p>
        <div className="flex flex-wrap gap-2">
          {peer.current_struggles.map((struggle) => (
            <span
              key={struggle}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {struggle.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Interests:</p>
        <div className="flex flex-wrap gap-2">
          {peer.interests.map((interest) => (
            <span
              key={interest}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Match Reasons */}
      <div className="mb-6 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-green-600" />
          <p className="text-sm font-medium text-green-800">Why you match:</p>
        </div>
        <ul className="space-y-1">
          {matchReasons.map((reason, idx) => (
            <li key={idx} className="text-sm text-green-700">
              • {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onPass?.(peer.user_id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
        >
          <X className="w-5 h-5" />
          Pass
        </button>
        <button
          onClick={() => onConnect?.(peer.user_id)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Check className="w-5 h-5" />
          Connect
        </button>
      </div>
    </div>
  );
}
