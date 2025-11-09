// Layout wrapper for authenticated pages
'use client';

import Navbar from './Navbar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
