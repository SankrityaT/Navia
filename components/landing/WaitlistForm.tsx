'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('You\'re on the list! We\'ll be in touch soon.');
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {status === 'success' ? (
        <div className="bg-[var(--sage-100)] border-2 border-[var(--sage-400)] rounded-2xl p-8 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--sage-400)] to-[var(--sage-600)] flex items-center justify-center mb-4 mx-auto">
            <CheckCircle className="w-8 h-8 text-[var(--cream)]" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-serif font-semibold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
            Welcome to the Journey!
          </h3>
          <p className="text-[var(--charcoal)]/70">
            {message}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Side by side name and email fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--charcoal)] mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-5 py-4 bg-[var(--sand)] border-2 border-[var(--clay-300)]/40 rounded-2xl text-[var(--charcoal)] placeholder-[var(--charcoal)]/40 focus:outline-none focus:border-[var(--clay-500)] transition-colors duration-300"
                placeholder="Your name"
                disabled={status === 'loading'}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--charcoal)] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-[var(--sand)] border-2 border-[var(--clay-300)]/40 rounded-2xl text-[var(--charcoal)] placeholder-[var(--charcoal)]/40 focus:outline-none focus:border-[var(--clay-500)] transition-colors duration-300"
                placeholder="your@email.com"
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-red-700 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full group inline-flex items-center justify-center gap-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] px-8 py-5 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                Joining...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" strokeWidth={2.5} />
                Join the Waitlist
              </>
            )}
          </button>

          <p className="text-xs text-center text-[var(--charcoal)]/50 mt-4">
            We respect your privacy. No spam, ever.
          </p>
        </form>
      )}
    </div>
  );
}
