import { ReactNode } from 'react';

interface IconProps {
  /** The icon content - can be emoji, SVG, or any React node */
  children: ReactNode;
  /** Size of the icon */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm w-4 h-4',
  md: 'text-base w-5 h-5',
  lg: 'text-lg w-6 h-6',
  xl: 'text-2xl w-8 h-8',
};

/**
 * Icon wrapper component for consistent icon sizing and styling.
 * Supports emoji, inline SVG, or any other icon format.
 */
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
