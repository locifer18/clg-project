'use client';

import { useRef } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  error?: string;
  isLoading?: boolean;
}

export function OtpInput({ value, onChange, error, isLoading }: OtpInputProps) {
  const otpArray = value.split('').concat(Array(6).fill('')).slice(0, 6);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otpArray];
    newOtp[index] = val;

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    onChange(newOtp.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otpArray];

      if (!otpArray[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasteData = e.clipboardData.getData('text');
    const numbers = pasteData.replace(/\D/g, '').slice(0, 6);

    if (!numbers) return;

    const newOtp = numbers.split('').concat(Array(6).fill('')).slice(0, 6);

    onChange(newOtp.join(''));

    const nextEmptyIndex = newOtp.findIndex((d) => d === '');
    inputRefs.current[nextEmptyIndex !== -1 ? nextEmptyIndex : 5]?.focus();
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-4">
        Enter the 6-digit code
      </label>

      <div className="flex gap-3 justify-center mb-4">
        {otpArray.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={`
              flex-1 min-w-0 aspect-square text-2xl font-bold text-center
              rounded-lg border-2 transition-all duration-200
              bg-slate-50 dark:bg-slate-800
              text-slate-900 dark:text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white
              dark:focus:ring-offset-slate-900
              ${digit ? 'ring-2 ring-blue-200 dark:ring-blue-900' : ''}
            `}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
        Check your email for the code. It may take a few seconds to arrive.
      </p>
    </div>
  );
}