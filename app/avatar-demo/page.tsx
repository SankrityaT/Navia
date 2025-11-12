'use client';

import { useState } from 'react';
import NaviaAvatar from '@/components/ai/NaviaAvatar';
import { motion } from 'framer-motion';

export default function AvatarDemoPage() {
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '4xl' | '8xl'>('8xl');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* Avatar Display Area */}
      <div className="flex-1 flex items-center justify-center w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <NaviaAvatar 
            isThinking={isThinking}
            isSpeaking={isSpeaking}
            size={size}
          />
        </motion.div>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-100 border border-gray-300 rounded-2xl p-6 shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Navia Avatar Demo Controls
        </h2>
        
        <div className="space-y-6">
          {/* Animation State Controls */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Animation State</h3>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsThinking(false);
                  setIsSpeaking(false);
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  !isThinking && !isSpeaking
                    ? 'bg-gradient-to-r from-[#C97D56] to-[#8A9B80] text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Idle
              </button>
              <button
                onClick={() => {
                  setIsThinking(true);
                  setIsSpeaking(false);
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  isThinking && !isSpeaking
                    ? 'bg-gradient-to-r from-[#C97D56] to-[#8A9B80] text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Thinking
              </button>
              <button
                onClick={() => {
                  setIsThinking(false);
                  setIsSpeaking(true);
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  isSpeaking
                    ? 'bg-gradient-to-r from-[#C97D56] to-[#8A9B80] text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Speaking
              </button>
            </div>
          </div>

          {/* Size Controls */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Avatar Size</h3>
            <div className="flex gap-3">
              {(['sm', 'md', 'lg', 'xl', '4xl', '8xl'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all uppercase ${
                    size === s
                      ? 'bg-gradient-to-r from-[#C97D56] to-[#8A9B80] text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-500 text-sm text-center">
              💡 Use these controls to demonstrate different avatar states for your video pitch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
