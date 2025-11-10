'use client';

import { CheckCircle2, MessageCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConnectionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  peerName: string;
  connectionId?: string;
}

export default function ConnectionSuccessDialog({ 
  isOpen, 
  onClose, 
  peerName,
  connectionId 
}: ConnectionSuccessDialogProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToChat = () => {
    if (connectionId) {
      router.push(`/peers/chat/${connectionId}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[var(--sand)] rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-[var(--charcoal)]/40 hover:text-[var(--charcoal)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--sage-100)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[var(--sage-600)]" strokeWidth={2.5} />
          </div>

          <h3 className="text-3xl font-serif font-bold text-[var(--charcoal)] mb-3" style={{fontFamily: 'var(--font-fraunces)'}}>
            Connection Accepted!
          </h3>
          
          <p className="text-[var(--charcoal)]/70 mb-8 text-lg">
            You and <span className="font-semibold text-[var(--charcoal)]">{peerName}</span> are now connected. Start messaging to set up your accountability partnership!
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToChat}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
              Start Chatting
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[var(--stone)] hover:bg-[var(--clay-200)] text-[var(--charcoal)] rounded-2xl font-semibold transition-all border-2 border-[var(--clay-300)]/40"
            >
              View All Connections
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
