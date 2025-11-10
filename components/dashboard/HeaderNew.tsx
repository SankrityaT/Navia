// Dashboard header with warm-organic aesthetic
// Minimalistic, clean design - No border, no icons

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
    <header className="bg-gradient-to-r from-[var(--cream)] via-[var(--sand)] to-[var(--clay-100)] relative overflow-hidden">
      {/* Decorative blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--clay-300)] rounded-full blur-[100px] opacity-20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                  {greeting()}, {userName}
                </h1>
          <p className="text-sm text-[var(--charcoal)]/60 font-medium mt-1">
                  Let's make today productive
                </p>
        </div>
      </div>
    </header>
  );
}
