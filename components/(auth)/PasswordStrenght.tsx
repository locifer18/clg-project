"use client";

import * as React from "react";
import { checkPasswordStrength } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, feedback } = React.useMemo(
    () => checkPasswordStrength(password),
    [password]
  );

  if (!password) return null;

  const getStrengthLabel = (score: number) => {
    if (score < 40) return { text: "Weak", color: "bg-red-500" };
    if (score < 70) return { text: "Fair", color: "bg-orange-500" };
    if (score < 90) return { text: "Good", color: "bg-yellow-500" };
    return { text: "Strong", color: "bg-green-500" };
  };

  const strength = getStrengthLabel(score);

  const requirements = [
    { met: password.length >= 12, text: "At least 12 characters" },
    { met: /[a-z]/.test(password), text: "Lowercase letter" },
    { met: /[A-Z]/.test(password), text: "Uppercase letter" },
    { met: /[0-9]/.test(password), text: "Number" },
    { met: /[!@#$%^&*]/.test(password), text: "Special character" },
  ];

  return (
    <div className="space-y-3 mt-3">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Password strength</span>
          <span className={cn("font-medium", {
            "text-red-600": score < 40,
            "text-orange-600": score >= 40 && score < 70,
            "text-yellow-600": score >= 70 && score < 90,
            "text-green-600": score >= 90,
          })}>
            {strength.text}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", strength.color)}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1.5">
        {requirements.map((req, i) => (
          <div
            key={i}
            className={cn("flex items-center gap-2 text-xs transition-colors", {
              "text-green-600": req.met,
              "text-gray-400": !req.met,
            })}
          >
            {req.met ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            <span>{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}