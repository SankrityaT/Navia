import { motion } from 'framer-motion';
import { MockPeer } from '@/lib/mock/peers';

interface MatchCardProps {
  peer: MockPeer;
  onPass: () => void;
  onConnect: () => void;
  style?: React.CSSProperties;
}

export default function MatchCard({ peer, onPass, onConnect, style }: MatchCardProps) {
  return (
    <motion.div
      style={style}
      className="absolute w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-[var(--stone)] overflow-hidden"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = Math.abs(offset.x) * velocity.x;
        if (swipe < -10000) {
          onPass();
        } else if (swipe > 10000) {
          onConnect();
        }
      }}
    >
      {/* Match Score Badge */}
      <div className="absolute top-4 right-4 bg-[var(--sage-500)] text-white px-4 py-2 rounded-full font-bold shadow-lg z-10">
        {peer.matchScore}% Match
      </div>

      {/* Avatar Section */}
      <div className="bg-gradient-to-br from-[var(--sage-400)] to-[var(--clay-400)] p-12 text-center">
        <div className="text-8xl mb-4">{peer.avatar}</div>
        <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-fraunces)' }}>
          {peer.name}
        </h2>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-6">
        {/* Bio */}
        <div>
          <p className="text-[var(--charcoal)] text-lg leading-relaxed">
            {peer.bio}
          </p>
        </div>

        {/* Challenges */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--clay-700)] mb-2 uppercase tracking-wide">
            Navigating:
          </h3>
          <div className="flex flex-wrap gap-2">
            {peer.challenges.map((challenge, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-[var(--clay-100)] text-[var(--clay-700)] rounded-full text-sm font-medium"
              >
                {challenge}
              </span>
            ))}
          </div>
        </div>

        {/* Can Help With */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--sage-700)] mb-2 uppercase tracking-wide">
            Can help with:
          </h3>
          <div className="flex flex-wrap gap-2">
            {peer.canHelp.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-[var(--sage-100)] text-[var(--sage-700)] rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-0 flex gap-4">
        <button
          onClick={onPass}
          className="flex-1 py-4 bg-white border-2 border-[var(--stone)] text-[var(--charcoal)] rounded-2xl font-semibold text-lg hover:bg-[var(--sand)] transition-all shadow-md hover:shadow-lg"
        >
          Pass
        </button>
        <button
          onClick={onConnect}
          className="flex-1 py-4 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-2xl font-semibold text-lg transition-all shadow-md hover:shadow-lg"
        >
          Connect 💛
        </button>
      </div>

      {/* Swipe Hint */}
      <div className="pb-4 text-center text-sm text-[var(--clay-600)]">
        Swipe left to pass, right to connect
      </div>
    </motion.div>
  );
}
