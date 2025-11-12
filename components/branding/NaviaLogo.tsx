'use client';

interface NaviaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withGlow?: boolean;
}

export default function NaviaLogo({ size = 'md', className = '', withGlow = false }: NaviaLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const glowSize = {
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg',
    xl: 'blur-xl',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Optional glow effect */}
      {withGlow && (
        <div className={`absolute inset-0 bg-gradient-to-br from-[var(--clay-400)] to-[var(--sage-400)] rounded-full ${glowSize[size]} opacity-50`} />
      )}
      
      {/* Navia circular logo */}
      <div className={`relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#c4a574] via-[#9ca986] to-[#6b8e6f] shadow-lg overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-[#c4a574]/80 via-[#9ca986]/80 to-[#6b8e6f]/80" />
      </div>
    </div>
  );
}
