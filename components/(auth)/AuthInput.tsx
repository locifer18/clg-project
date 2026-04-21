'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import { FieldError } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

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
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
        {props.required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>

      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
            {icon}
          </div>
        )}

        <input
          type={inputType}
          className={`
            w-full h-10 rounded-lg
            bg-white/70 border border-slate-200
            text-sm text-slate-900
            placeholder:text-slate-400
            focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white
            transition-all duration-200
            ${icon ? 'pl-9' : 'pl-3'}
            ${onTogglePassword ? 'pr-10' : 'pr-3'}
            ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''}
            ${className ?? ''}
          `}
          {...props}
        />

        {props.type === 'password' && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-5.68 1.72l-1.613-1.613zm2.16 2.16a9 9 0 0112.846 12.846l-1.385-1.385a7 7 0 00-9.957-9.957l-1.504-1.504zM15 12a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
      </div>

      {hint && !error && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}

      {error && (
        <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-600">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="font-medium">{error.message}</span>
        </div>
      )}
    </div>
  );
}
