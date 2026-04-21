'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export function AuthButton({
  children,
  isLoading = false,
  variant = 'primary',
  fullWidth = true,
  disabled,
  className,
  ...props
}: AuthButtonProps) {
  const base = `
    relative inline-flex items-center justify-center gap-2
    px-5 h-10 rounded-lg font-semibold text-sm
    transition-all duration-200 overflow-hidden
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600
      bg-[length:200%_100%] bg-left hover:bg-right
      text-white shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40
      focus:ring-indigo-500 active:scale-[0.98]
    `,
    secondary: `
      bg-white/70 border border-slate-200 backdrop-blur
      text-slate-900 hover:bg-white hover:border-slate-300
      focus:ring-slate-400
    `,
    ghost: `
      bg-transparent text-indigo-600 hover:bg-indigo-50
      focus:ring-indigo-500
    `,
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${className ?? ''}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
