// components/auth/AuthButton.tsx
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
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    px-6 py-3 rounded-lg font-semibold text-sm
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
      text-white shadow-md hover:shadow-lg
      focus:ring-blue-500 dark:focus:ring-blue-400
      active:scale-95
    `,
    secondary: `
      bg-slate-200 dark:bg-slate-800
      text-slate-900 dark:text-white
      hover:bg-slate-300 dark:hover:bg-slate-700
      focus:ring-slate-500 dark:focus:ring-slate-400
    `,
    ghost: `
      bg-transparent
      text-blue-600 dark:text-blue-400
      hover:bg-blue-50 dark:hover:bg-slate-800
      focus:ring-blue-500 dark:focus:ring-blue-400
    `,
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
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