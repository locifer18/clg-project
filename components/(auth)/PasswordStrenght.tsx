// components/auth/PasswordStrength.tsx
'use client';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;

    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 5) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = calculateStrength(password);

  const requirements = [
    { text: 'At least 12 characters', met: password.length >= 12 },
    { text: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { text: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { text: 'Number (0-9)', met: /\d/.test(password) },
    { text: 'Special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mb-5 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Strength meter */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-900 dark:text-white">Password Strength</label>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{strength.label}</span>
        </div>
        <div className="h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2">
            {req.met ? (
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`text-xs ${req.met ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}