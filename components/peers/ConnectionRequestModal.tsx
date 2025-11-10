'use client';

import { useState } from 'react';
import { X, Check, Heart } from 'lucide-react';

interface ConnectionRequestModalProps {
  peerName: string;
  peerBio: string;
  sharedStruggles: string[];
  onAccept: (myGoals: string[]) => void;
  onDecline: () => void;
  onClose: () => void;
}

export default function ConnectionRequestModal({
  peerName,
  peerBio,
  sharedStruggles,
  onAccept,
  onDecline,
  onClose,
}: ConnectionRequestModalProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    await onAccept([]);
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
            disabled={isAccepting}
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
