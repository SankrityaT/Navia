// Floating glassmorphic navbar - stunning design
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { 
  LayoutDashboard, 
  Users,
  UserCircle
} from 'lucide-react';
import NaviaAvatar from '@/components/ai/NaviaAvatar';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard-new', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/peers', label: 'Peer Network', icon: Users },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-auto">
      {/* Floating bubble container with glassmorphism */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--clay-400)]/20 via-[var(--sage-400)]/20 to-[var(--clay-400)]/20 rounded-full blur-xl" />
        
        {/* Main nav bubble */}
        <div className="relative bg-white/70 backdrop-blur-2xl border border-white/40 rounded-full shadow-2xl px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Logo - Circular Navia Avatar */}
            <Link href="/dashboard-new" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative">
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--clay-400)] to-[var(--sage-400)] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                {/* Perfect circle avatar - smaller version */}
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#c4a574] via-[#9ca986] to-[#6b8e6f] shadow-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#c4a574]/80 via-[#9ca986]/80 to-[#6b8e6f]/80" />
                </div>
              </div>
              <span className="text-xl font-bold text-[var(--charcoal)] tracking-tight hidden sm:block leading-none" style={{fontFamily: 'var(--font-fraunces)'}}>
                Navia
              </span>
            </Link>

            {/* Nav Items - Centered */}
            <div className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                      active
                        ? 'bg-white/90 text-[var(--charcoal)] shadow-lg scale-105'
                        : 'text-[var(--charcoal)]/70 hover:text-[var(--charcoal)] hover:bg-white/60 hover:scale-105'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" strokeWidth={2.5} />}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Button */}
            <div className="flex items-center">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-full border-2 border-white/60 shadow-lg hover:scale-110 transition-transform"
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Edit Profile"
                    labelIcon={<UserCircle className="w-4 h-4" />}
                    href="/profile/edit"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
