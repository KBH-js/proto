import { ReactNode } from 'react';

interface IconProps {
  /** Emoji, SVG, or any other React node */
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm w-4 h-4',
  md: 'text-base w-5 h-5',
  lg: 'text-lg w-6 h-6',
  xl: 'text-2xl w-8 h-8',
};

export function Icon({ children, size = 'md', className = '' }: IconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${sizeStyles[size]} ${className}`}
      role="img"
    >
      {children}
    </span>
  );
}
