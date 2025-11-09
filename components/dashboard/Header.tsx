// FRONTEND: Dashboard header with greeting and energy meter
// TODO: Get user name from Clerk
// TODO: Save energy level to Pinecone on change

'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';

interface HeaderProps {
  userName: string;
}

export default function Header({ userName }: HeaderProps) {
  const [energyLevel, setEnergyLevel] = useState(50);

  const handleEnergyChange = async (value: number) => {
    setEnergyLevel(value);
    // TODO: Call API to save energy level to Pinecone
    // await fetch('/api/dashboard/energy', { method: 'POST', body: JSON.stringify({ energy_level: value }) })
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-gray-600">{formatDate()}</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Energy Meter */}
      <div className="bg-blue-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How&apos;s your energy today?
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={energyLevel}
            onChange={(e) => handleEnergyChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-2xl font-bold text-blue-600 w-16 text-right">
            {energyLevel}%
          </span>
        </div>
      </div>
    </header>
  );
}
