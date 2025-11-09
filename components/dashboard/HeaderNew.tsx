// Dashboard header with warm-organic aesthetic
// Minimalistic, soothing design

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { LayoutGrid, MessageCircle, Users, Sparkles } from 'lucide-react';

interface HeaderProps {
  userName: string;
}

export default function Header({ userName }: HeaderProps) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="bg-gradient-to-r from-[var(--cream)] via-[var(--sand)] to-[var(--clay-100)] border-b-2 border-[var(--clay-200)] relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--clay-300)] rounded-full blur-[100px] opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Greeting Section */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  {greeting()}, {userName}
                </h1>
                <p className="text-sm text-[var(--charcoal)]/60 font-medium">
                  Let's make today productive
                </p>
              </div>
            </div>
          </div>

          {/* Navigation & User */}
          <div className="flex items-center gap-3">
            {/* Quick Nav Buttons */}
            <Link
              href="/tasks"
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[var(--sand)] border-2 border-[var(--clay-200)] hover:border-[var(--clay-400)] rounded-xl font-semibold text-[var(--charcoal)] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Tasks</span>
            </Link>
            
            <Link
              href="/chat"
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[var(--sand)] border-2 border-[var(--clay-200)] hover:border-[var(--clay-400)] rounded-xl font-semibold text-[var(--charcoal)] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Chat</span>
            </Link>
            
            <Link
              href="/peers"
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[var(--sand)] border-2 border-[var(--clay-200)] hover:border-[var(--clay-400)] rounded-xl font-semibold text-[var(--charcoal)] transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Users className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Peers</span>
            </Link>

            {/* User Button */}
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[var(--clay-300)] shadow-md">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
