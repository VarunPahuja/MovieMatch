import { Film } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl lg:text-5xl'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6 md:w-8 md:h-8',
    lg: 'w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Film className={`${iconSizes[size]} text-red-500`} />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      </div>
      <span className={`logo-text ${sizeClasses[size]}`}>
        MovieMatch
      </span>
    </div>
  );
}
