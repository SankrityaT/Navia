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
import NaviaLogo from '@/components/branding/NaviaLogo';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard-new', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/peer-new', label: 'Peer Network', icon: Users },
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
            {/* Logo - Circular Navia Logo */}
            <Link href="/dashboard-new" className="flex items-center gap-3 group flex-shrink-0">
              <NaviaLogo size="md" withGlow className="group-hover:scale-110 transition-transform duration-300" />
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
