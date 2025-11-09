'use client';

import { useState } from 'react';
import { X, Check, Heart, Target } from 'lucide-react';

interface ConnectionRequestModalProps {
  peerName: string;
  peerBio: string;
  sharedStruggles: string[];
  onAccept: (myGoals: string[]) => void;
  onDecline: () => void;
  onClose: () => void;
}

const goalOptions = [
  { key: 'accountability', label: 'Stay accountable to my goals' },
  { key: 'job_search', label: 'Job search support' },
  { key: 'budgeting', label: 'Money management help' },
  { key: 'organization', label: 'Get organized' },
  { key: 'social', label: 'Make friends / socialize' },
  { key: 'routine', label: 'Build better routines' },
  { key: 'emotional_support', label: 'Emotional support' },
  { key: 'task_help', label: 'Help starting tasks' },
];

export default function ConnectionRequestModal({
  peerName,
  peerBio,
  sharedStruggles,
  onAccept,
  onDecline,
  onClose,
}: ConnectionRequestModalProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isAccepting, setIsAccepting] = useState(false);

  const toggleGoal = (goalKey: string) => {
    if (selectedGoals.includes(goalKey)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goalKey));
    } else if (selectedGoals.length < 3) {
      setSelectedGoals([...selectedGoals, goalKey]);
    }
  };

  const handleAccept = async () => {
    if (selectedGoals.length === 0) {
      alert('Please select at least one goal');
      return;
    }
    setIsAccepting(true);
    await onAccept(selectedGoals);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--sand)] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--sand)] border-b border-[var(--clay-300)]/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
              Connection Request
            </h2>
            <p className="text-[var(--charcoal)]/60 text-sm">from {peerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--clay-100)] rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-[var(--charcoal)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Peer Info */}
          <div className="bg-[var(--cream)] rounded-2xl p-4">
            <p className="text-[var(--charcoal)]/80 italic mb-3">"{peerBio}"</p>
            
            {sharedStruggles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-[var(--sage-600)]" />
                  <p className="text-sm font-semibold text-[var(--charcoal)]">You both work on:</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sharedStruggles.map((struggle) => (
                    <span key={struggle} className="px-3 py-1 bg-[var(--sage-50)] text-[var(--sage-700)] text-sm rounded-lg">
                      {struggle.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Goal Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-[var(--clay-500)]" />
              <h3 className="text-lg font-serif font-bold text-[var(--charcoal)]">
                What do you want to work on together? <span className="text-sm font-normal text-[var(--charcoal)]/60">(Pick up to 3)</span>
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalOptions.map((option) => {
                const isSelected = selectedGoals.includes(option.key);
                const isDisabled = !isSelected && selectedGoals.length >= 3;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => toggleGoal(option.key)}
                    disabled={isDisabled}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[var(--clay-500)] bg-[var(--clay-50)]'
                        : isDisabled
                          ? 'border-[var(--stone)] bg-[var(--sand)]/20 opacity-50 cursor-not-allowed'
                          : 'border-[var(--stone)] hover:border-[var(--clay-300)] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
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
                      <span className="font-medium text-[var(--charcoal)] text-sm">{option.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[var(--sage-50)] border border-[var(--sage-200)] rounded-2xl p-4">
            <p className="text-sm text-[var(--charcoal)]/70">
              💡 <strong>How it works:</strong> You'll be able to message each other, share progress, and do weekly check-ins. 
              You can pause or end the connection anytime.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-[var(--sand)] border-t border-[var(--clay-300)]/30 p-6 flex gap-3">
          <button
            onClick={onDecline}
            disabled={isAccepting}
            className="flex-1 px-6 py-3 bg-[var(--stone)] hover:bg-[var(--clay-200)] text-[var(--charcoal)] rounded-2xl font-semibold transition-all border-2 border-[var(--clay-300)]/40 disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={isAccepting || selectedGoals.length === 0}
            className="flex-[2] inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAccepting ? (
              <>
                <div className="w-5 h-5 border-2 border-[var(--cream)]/30 border-t-[var(--cream)] rounded-full animate-spin"></div>
                Accepting...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" strokeWidth={2.5} />
                Accept & Connect
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
