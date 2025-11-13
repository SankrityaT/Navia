'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, Sparkles, Clock, ListChecks, TrendingUp } from 'lucide-react';

interface BrainDumpProps {
  userId: string;
  onOpenNavia: (message: string, context: any, endpoint: string) => void;
}

export default function BrainDump({ userId, onOpenNavia }: BrainDumpProps) {
  const [thought, setThought] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [loadingQuery, setLoadingQuery] = useState<string | null>(null);

  const handleDumpIt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim()) return;

    setIsSubmitting(true);
    setFeedbackMessage('');

    try {
      const response = await fetch('/api/features/brain-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thought, userId }),
      });

      const data = await response.json();

      if (data.success) {
        setFeedbackMessage(data.message);
        setThought('');
        setTimeout(() => setFeedbackMessage(''), 3000);
      } else {
        setFeedbackMessage('Oops, something went wrong 💛');
        setTimeout(() => setFeedbackMessage(''), 3000);
      }
    } catch (error) {
      console.error('Brain dump error:', error);
      setFeedbackMessage('Failed to save your thoughts. Try again?');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickQuestion = async (queryType: string, prompt: string) => {
    setLoadingQuery(queryType);
    
    // Open NAVIA modal IMMEDIATELY - memory-recall route now streams directly
    onOpenNavia(
      prompt,
      {
        queryType,
        query: prompt,
        userId,
      },
      '/api/features/memory-recall'
    );
    
    setLoadingQuery(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border-2 border-[var(--clay-200)] h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] rounded-xl">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg md:text-xl font-bold text-[var(--charcoal)]">
          Brain Dump
        </h2>
      </div>

      {/* Textarea */}
      <form onSubmit={handleDumpIt} className="flex-1 flex flex-col gap-3">
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="Dump all your thoughts here... I'll organize them! 💛"
          disabled={isSubmitting}
          className="flex-1 min-h-[120px] px-3 py-2 bg-[var(--sage-50)] border-2 border-[var(--clay-200)] rounded-xl focus:outline-none focus:border-[var(--clay-500)] text-[var(--charcoal)] text-sm resize-none disabled:opacity-50"
        />

        {/* Dump It Button */}
        <button
          type="submit"
          disabled={isSubmitting || !thought.trim()}
          className="w-full py-3 bg-gradient-to-r from-[var(--clay-500)] to-[var(--clay-600)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Dump It
            </>
          )}
        </button>

        {/* Feedback Message */}
        {feedbackMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-[var(--sage-700)] text-center bg-[var(--sage-100)] px-3 py-2 rounded-lg"
          >
            {feedbackMessage}
          </motion.p>
        )}
      </form>

      {/* Quick Questions */}
      <div className="mt-4 pt-4 border-t-2 border-[var(--clay-100)]">
        <p className="text-xs font-semibold text-[var(--clay-600)] mb-3">
          Quick questions:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickQuestion('forgetting', "What am I forgetting?")}
            disabled={loadingQuery !== null}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--sage-50)] hover:bg-[var(--sage-100)] text-[var(--charcoal)] text-xs md:text-sm font-medium transition-all border border-[var(--sage-200)] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingQuery === 'forgetting' ? (
              <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-[var(--clay-600)]" />
            ) : (
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-[var(--clay-600)]" />
            )}
            What am I forgetting?
          </button>
          <button
            onClick={() => handleQuickQuestion('today', "What did I say I'd do today?")}
            disabled={loadingQuery !== null}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--sage-50)] hover:bg-[var(--sage-100)] text-[var(--charcoal)] text-xs md:text-sm font-medium transition-all border border-[var(--sage-200)] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingQuery === 'today' ? (
              <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-[var(--clay-600)]" />
            ) : (
              <ListChecks className="w-3 h-3 md:w-4 md:h-4 text-[var(--clay-600)]" />
            )}
            What did I say I'd do today?
          </button>
          <button
            onClick={() => handleQuickQuestion('patterns', "Show my usual patterns")}
            disabled={loadingQuery !== null}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--sage-50)] hover:bg-[var(--sage-100)] text-[var(--charcoal)] text-xs md:text-sm font-medium transition-all border border-[var(--sage-200)] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingQuery === 'patterns' ? (
              <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-[var(--clay-600)]" />
            ) : (
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-[var(--clay-600)]" />
            )}
            Show my usual patterns
          </button>
        </div>
      </div>
    </motion.div>
  );
}
