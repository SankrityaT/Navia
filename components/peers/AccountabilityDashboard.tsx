// FRONTEND: Accountability dashboard (MVP)
// Shows mutual goals and manual check-in button

'use client';

import { useState, useEffect } from 'react';
import { PeerConnection, CheckIn } from '@/lib/types';
import { Target, CheckCircle2, Circle, Calendar, TrendingUp } from 'lucide-react';

interface AccountabilityDashboardProps {
  connection: PeerConnection;
  currentUserId: string;
  peerName: string;
}

export default function AccountabilityDashboard({
  connection,
  currentUserId,
  peerName,
}: AccountabilityDashboardProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [goalsCompleted, setGoalsCompleted] = useState(0);
  const [reflection, setReflection] = useState('');

  const isUser1 = connection.user1_id === currentUserId;
  const myGoals = isUser1 ? connection.goals?.user1_goals : connection.goals?.user2_goals;
  const theirGoals = isUser1 ? connection.goals?.user2_goals : connection.goals?.user1_goals;

  useEffect(() => {
    fetchCheckIns();
  }, [connection.connection_id]);

  const fetchCheckIns = async () => {
    try {
      const response = await fetch(
        `/api/peers/checkin?connectionId=${connection.connection_id}`
      );
      const data = await response.json();
      setCheckIns(data.checkIns || []);
    } catch (error) {
      console.error('Failed to fetch check-ins:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!myGoals || goalsCompleted > myGoals.length) return;

    setIsCheckingIn(true);
    try {
      const response = await fetch('/api/peers/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: connection.connection_id,
          goalsCompleted,
          totalGoals: myGoals.length,
          reflection: reflection.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Check-in submitted! 🎉 Great work staying accountable.');
        setGoalsCompleted(0);
        setReflection('');
        fetchCheckIns();
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to submit check-in. Please try again.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const myRecentCheckIn = checkIns.find((c) => c.user_id === currentUserId);
  const theirRecentCheckIn = checkIns.find((c) => c.user_id !== currentUserId);

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* My Goals */}
        <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[var(--clay-600)]" strokeWidth={2.5} />
            <h3 className="text-lg font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
              Your Goals This Week
            </h3>
          </div>
          {myGoals && myGoals.length > 0 ? (
            <ul className="space-y-2">
              {myGoals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[var(--charcoal)]/80">
                  <Circle className="w-4 h-4 mt-1 text-[var(--clay-500)]" strokeWidth={2} />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[var(--charcoal)]/60 italic">No goals set yet</p>
          )}
          {myRecentCheckIn && (
            <div className="mt-4 pt-4 border-t border-[var(--clay-300)]/30">
              <p className="text-sm text-[var(--charcoal)]/60">
                Last check-in: {myRecentCheckIn.goals_completed}/{myRecentCheckIn.total_goals} completed
              </p>
            </div>
          )}
        </div>

        {/* Their Goals */}
        <div className="bg-[var(--sage-400)]/20 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--sage-500)]/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[var(--sage-600)]" strokeWidth={2.5} />
            <h3 className="text-lg font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
              {peerName}'s Goals This Week
            </h3>
          </div>
          {theirGoals && theirGoals.length > 0 ? (
            <ul className="space-y-2">
              {theirGoals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[var(--charcoal)]/80">
                  <Circle className="w-4 h-4 mt-1 text-[var(--sage-600)]" strokeWidth={2} />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[var(--charcoal)]/60 italic">No goals set yet</p>
          )}
          {theirRecentCheckIn && (
            <div className="mt-4 pt-4 border-t border-[var(--sage-500)]/30">
              <p className="text-sm text-[var(--charcoal)]/60">
                Last check-in: {theirRecentCheckIn.goals_completed}/{theirRecentCheckIn.total_goals} completed
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Check-In */}
      <div className="bg-[var(--clay-100)]/50 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/40 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[var(--clay-600)]" strokeWidth={2.5} />
          <h3 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
            Weekly Check-In
          </h3>
        </div>

        <p className="text-[var(--charcoal)]/70 mb-4">
          How many of your goals did you complete this week?
        </p>

        <div className="space-y-4">
          {/* Goals Completed Selector */}
          <div>
            <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
              Goals Completed
            </label>
            <div className="flex gap-2">
              {myGoals &&
                Array.from({ length: myGoals.length + 1 }, (_, i) => i).map((num) => (
                  <button
                    key={num}
                    onClick={() => setGoalsCompleted(num)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      goalsCompleted === num
                        ? 'bg-[var(--clay-500)] text-[var(--cream)] shadow-lg'
                        : 'bg-[var(--stone)] text-[var(--charcoal)] hover:bg-[var(--clay-200)]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
            </div>
            {myGoals && (
              <p className="text-xs text-[var(--charcoal)]/60 mt-2">
                Out of {myGoals.length} total goals
              </p>
            )}
          </div>

          {/* Optional Reflection */}
          <div>
            <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
              Reflection (Optional)
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What went well? What was challenging?"
              className="w-full px-4 py-3 bg-[var(--cream)] border border-[var(--clay-300)]/40 rounded-2xl focus:ring-2 focus:ring-[var(--clay-500)] focus:border-transparent text-[var(--charcoal)] placeholder:text-[var(--charcoal)]/40 resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCheckIn}
            disabled={isCheckingIn || !myGoals || myGoals.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
            {isCheckingIn ? 'Submitting...' : 'Submit Check-In'}
          </button>
        </div>
      </div>

      {/* Recent Check-Ins */}
      {checkIns.length > 0 && (
        <div className="bg-[var(--sand)]/60 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--clay-600)]" strokeWidth={2.5} />
            <h3 className="text-lg font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
              Recent Check-Ins
            </h3>
          </div>
          <div className="space-y-3">
            {checkIns.slice(0, 5).map((checkIn) => (
              <div
                key={checkIn.checkin_id}
                className="flex items-center justify-between p-3 bg-[var(--cream)] rounded-xl border border-[var(--clay-300)]/30"
              >
                <div>
                  <p className="font-semibold text-[var(--charcoal)]">
                    {checkIn.user_id === currentUserId ? 'You' : peerName}
                  </p>
                  <p className="text-sm text-[var(--charcoal)]/60">
                    {new Date(checkIn.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--clay-600)]">
                    {checkIn.goals_completed}/{checkIn.total_goals}
                  </p>
                  <p className="text-xs text-[var(--charcoal)]/60">completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
