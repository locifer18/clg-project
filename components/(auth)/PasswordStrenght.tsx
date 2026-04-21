'use client';

import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score <= 4) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score <= 5) return { score: 3, label: 'Good', color: 'bg-sky-500', text: 'text-sky-600' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = calculateStrength(password);

  const requirements = [
    { text: '12+ characters', met: password.length >= 12 },
    { text: 'Uppercase (A-Z)', met: /[A-Z]/.test(password) },
    { text: 'Lowercase (a-z)', met: /[a-z]/.test(password) },
    { text: 'Number (0-9)', met: /\d/.test(password) },
    { text: 'Special (!@#$)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-2 rounded-lg border border-slate-200/70 bg-slate-50/60 p-2.5 backdrop-blur">
      <div className="flex items-center justify-between">
        {/* <span className="text-[11px] font-medium text-slate-600">Password strength</span> */}
        <span className={`text-[11px] font-semibold ${strength.text}`}>{strength.label}</span>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= strength.score ? strength.color : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
        {requirements.map((req, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {req.met ? (
              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
            ) : (
              <X className="h-3 w-3 text-slate-400 shrink-0" />
            )}
            <span className={`text-[10px] ${req.met ? 'text-slate-700' : 'text-slate-400'}`}>
              {req.text}
            </span>
          </div>
        ))}
      </div> */}
    </div>
  );
}
