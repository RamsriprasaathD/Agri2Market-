import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div
      className={`rounded-2xl border border-[var(--surface-highlight)]/60 bg-[var(--surface-primary)] p-6 text-[var(--oilseed-stem)] shadow-[0_20px_40px_rgba(24,55,38,0.12)] backdrop-blur-sm ${className}`}
    >
      {title && <h3 className="text-lg font-semibold text-[var(--oilseed-forest)] mb-4">{title}</h3>}
      {children}
    </div>
  );
};
