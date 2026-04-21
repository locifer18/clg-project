'use client';

import { useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  error?: string;
  isLoading?: boolean;
}

export function OtpInput({ value, onChange, error, isLoading }: OtpInputProps) {
  const otpArray = value.split('').concat(Array(6).fill('')).slice(0, 6);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpArray];
    newOtp[index] = val;
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
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
    } else if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
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
    <div className="space-y-2.5">
      <div className="flex gap-2 justify-center">
        {otpArray.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={`
              w-11 h-12 text-lg font-semibold text-center
              rounded-lg border transition-all duration-200
              bg-white/70 backdrop-blur text-slate-900
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
              ${error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                : digit
                  ? 'border-indigo-400 bg-indigo-50/60'
                  : 'border-slate-200 focus:border-indigo-500'}
            `}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 justify-center text-[11px] text-rose-600">
          <AlertCircle className="h-3 w-3" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <p className="text-[15px] text-slate-500 text-center">
        Check your email — the code arrives within seconds.
      </p>
    </div>
  );
}
