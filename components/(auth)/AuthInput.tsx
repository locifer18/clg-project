// components/auth/AuthInput.tsx
'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import { FieldError } from 'react-hook-form';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  icon?: ReactNode;
  hint?: string;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export function AuthInput({
  label,
  error,
  icon,
  hint,
  showPassword,
  onTogglePassword,
  className,
  ...props
}: AuthInputProps) {
  const inputType = props.type === 'password' && showPassword ? 'text' : props.type;

  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors pointer-events-none">
            {icon}
          </div>
        )}

        <input
          type={inputType}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-slate-50 dark:bg-slate-800
            border-2 border-slate-200 dark:border-slate-700
            text-slate-900 dark:text-white
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700
            transition-all duration-200
            ${icon ? 'pl-11' : ''}
            ${error ? 'border-red-500 focus:border-red-500' : ''}
            ${showPassword !== undefined ? 'pr-12' : ''}
            ${className}
          `}
          {...props}
        />

        {props.type === 'password' && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-5.68 1.72l-1.613-1.613zm2.16 2.16a9 9 0 0112.846 12.846l-1.385-1.385a7 7 0 00-9.957-9.957l-1.504-1.504zM15 12a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
      </div>

      {hint && !error && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}

      {error && (
        <div className="mt-2 flex items-start gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      )}
    </div>
  );
}