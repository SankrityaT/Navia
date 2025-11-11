'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MockPeer } from '@/lib/mock/peers';

interface ConnectionModalProps {
  peer: MockPeer;
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
}

export default function ConnectionModal({ peer, isOpen, onClose, onSend }: ConnectionModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Generate a suggested message based on peer's challenges
  const suggestedMessage = `Hey! I saw we're both navigating ${peer.challenges[0].toLowerCase()}. Would love to connect and support each other! 💛`;

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    await onSend(message);
    setIsSending(false);
    setMessage('');
  };

  const useSuggestion = () => {
    setMessage(suggestedMessage);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-screen blurry backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--cream)]/95 backdrop-blur-2xl z-[100]"
          />

          {/* Full-screen modal container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[var(--stone)] max-w-2xl w-full p-8 my-8 relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--sand)] hover:bg-[var(--stone)] transition-colors text-[var(--charcoal)] font-bold text-xl"
                disabled={isSending}
              >
                ×
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-8xl mb-6">{peer.avatar}</div>
                <h2 className="text-3xl font-bold text-[var(--charcoal)] mb-3" style={{ fontFamily: 'var(--font-fraunces)' }}>
                  Connect with {peer.name}
                </h2>
                <p className="text-lg text-[var(--clay-700)]">
                  Send a message to start the conversation
                </p>
              </div>

              {/* Suggested Message */}
              {!message && (
                <div className="mb-6">
                  <button
                    onClick={useSuggestion}
                    className="w-full p-6 bg-[var(--sand)] border-2 border-[var(--stone)] rounded-2xl text-left hover:bg-[var(--clay-100)] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">💡</span>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-[var(--clay-700)] mb-2">
                          Navia suggests:
                        </p>
                        <p className="text-[var(--charcoal)] text-lg">
                          {suggestedMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Message Input */}
              <div className="mb-8">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full p-5 border-2 border-[var(--stone)] rounded-2xl resize-none focus:outline-none focus:border-[var(--clay-500)] transition-all text-lg"
                  rows={5}
                  maxLength={500}
                />
                <div className="text-right text-sm text-[var(--clay-600)] mt-2">
                  {message.length}/500
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  disabled={isSending}
                  className="flex-1 py-4 bg-white border-2 border-[var(--stone)] text-[var(--charcoal)] rounded-2xl font-semibold text-lg hover:bg-[var(--sand)] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isSending}
                  className="flex-1 py-4 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-2xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSending ? 'Sending...' : 'Send Message 💛'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
