import React from 'react';

type InputProps = {
  label?: string;
  error?: string;
  containerClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerClassName = '',
  className = '',
  type = 'text',
  required,
  ...props
}) => {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-[var(--oilseed-gold)]">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        required={required}
        suppressHydrationWarning
        className={`w-full rounded-lg border border-white/20 bg-white/80 px-3 py-2 text-sm text-[var(--oilseed-stem)] shadow-[inset_0_1px_2px_rgba(11,15,10,0.12)] placeholder:text-[var(--oilseed-stem)]/55 focus:border-[var(--oilseed-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--oilseed-gold)]/40 ${
          error ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-400' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
