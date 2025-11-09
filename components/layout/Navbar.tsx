// Global navbar for logged-in users
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Users, 
  CheckSquare,
  Leaf,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chat', label: 'Navia', icon: MessageCircle },
    { href: '/peers', label: 'Connections', icon: Users },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 bg-[var(--sand)]/95 backdrop-blur-md border-b border-[var(--clay-300)]/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Leaf className="w-5 h-5 text-[var(--cream)]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-serif font-semibold text-[var(--charcoal)] tracking-tight" style={{fontFamily: 'var(--font-fraunces)'}}>
              Navia
            </span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    active
                      ? 'bg-[var(--clay-500)] text-[var(--cream)] shadow-md'
                      : 'text-[var(--charcoal)]/70 hover:text-[var(--charcoal)] hover:bg-[var(--stone)]'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--sage-400)]/20 rounded-full border border-[var(--sage-500)]/30">
              <Sparkles className="w-3.5 h-3.5 text-[var(--sage-600)]" strokeWidth={2.5} />
              <span className="text-xs font-medium text-[var(--charcoal)]">Neurodivergent-affirming</span>
            </div>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-xl border-2 border-[var(--clay-300)]"
                }
              }}
            />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
                  active
                    ? 'bg-[var(--clay-500)] text-[var(--cream)] shadow-md'
                    : 'text-[var(--charcoal)]/70 hover:text-[var(--charcoal)] hover:bg-[var(--stone)]'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
