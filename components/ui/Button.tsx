import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
  className?: string;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  href,
  type = 'button',
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--oilseed-gold)] focus-visible:ring-offset-[var(--surface-primary)] disabled:cursor-not-allowed disabled:opacity-60';
  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#6fbb7c] via-[#4c9c63] to-[#2f7d49] text-white shadow-[0_12px_26px_rgba(47,125,73,0.18)] hover:shadow-[0_16px_34px_rgba(47,125,73,0.26)] hover:-translate-y-0.5',
    secondary:
      'bg-[var(--oilseed-gold)] text-[var(--oilseed-char)] shadow-[0_6px_24px_rgba(242,201,76,0.24)] hover:brightness-105',
    outline:
      'border border-[var(--oilseed-stem)]/25 bg-transparent text-[var(--oilseed-stem)] hover:bg-[var(--surface-highlight)]/35',
    ghost:
      'bg-transparent text-[var(--oilseed-forest)] hover:text-[var(--oilseed-char)] hover:bg-[var(--surface-highlight)]/35',
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      suppressHydrationWarning
    >
      {children}
    </button>
  );
};
