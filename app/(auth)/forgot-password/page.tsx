// app/(auth)/forgot-password/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { sendOtp, resetPassword } from '@/features/auth/auth.api';
import { AuthInput } from '@/components/(auth)/AuthInput';
import { AuthButton } from '@/components/(auth)/AuthButton';
import { OtpInput } from '@/components/(auth)/OtpInput';
import { PasswordStrength } from '@/components/(auth)/PasswordStrenght';
import { resetPasswordOnlySchema, sendOtpSchema } from '@/lib/validation';
import { ResetPasswordFormData, SendOtpRequest } from '@/types';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');

  // Step 1: Email form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: {
      errors: emailErrors,
      isSubmitting: isEmailSubmitting
    } } = useForm<SendOtpRequest>({
      resolver: zodResolver(sendOtpSchema),
      defaultValues: {
        type: 'PASSWORD_RESET' as const
      }
    });

  // Step 3: Reset password form
  const {
    register: registerPassword,
    handleSubmit: handleResetSubmit,
    watch,
    formState: {
      errors: resetErrors,
      isSubmitting: isResetSubmitting
    } } = useForm({
      resolver: zodResolver(resetPasswordOnlySchema),
      mode: 'onChange',
    });

  const password = watch('newPassword', '');

  const onEmailSubmit = async (data: SendOtpRequest) => {
    try {
      setError('');
      const response = await sendOtp({
        email: data.email,
        type: 'PASSWORD_RESET',
      });

      if (response.success) {
        setEmail(data.email);
        setTimeout(() => {
          setSuccessMessage('');
          setStep('otp');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const onOtpComplete = async (code: string) => {
    setStep('reset');
  };
  useEffect(() => {
    if (otp.length === 6) {
      onOtpComplete(otp);
    }
  }, [otp]);

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError('');
      // Note: You'll need to store the OTP from step 2
      // This is a simplified version
      const response = await resetPassword({
        email,
        otp, // Pass actual OTP from previous step
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (response.success) {
        setSuccessMessage('✓ Password reset successful! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <>
      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={emailErrors.email}
            {...registerEmail('email')}
          />

          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          <AuthButton isLoading={isEmailSubmitting} type="submit">
            Send OTP
          </AuthButton>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Remember your password?{' '}
            <a href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Sign in
            </a>
          </p>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <div className="space-y-6">
          <OtpInput value={otp} onChange={setOtp} error={error} />

          <AuthButton variant="ghost" type="button"
            onClick={() => {
              setStep('email');
              setOtp('');
              setError('');
            }}>
            ← Back
          </AuthButton>
        </div >
      )
      }

      {/* Step 3: New Password */}
      {
        step === 'reset' && (
          <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-6">
            <AuthInput
              label="New Password"
              type="password"
              placeholder="Min 12 characters with uppercase, number & symbol"
              error={resetErrors.newPassword}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              {...registerPassword('newPassword')}
            />

            {password && <PasswordStrength password={password} />}

            <AuthInput
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              error={resetErrors.confirmPassword}
              {...registerPassword('confirmPassword')}
            />

            {error && <ErrorMessage message={error} />}
            {successMessage && <SuccessMessage message={successMessage} />}

            <AuthButton isLoading={isResetSubmitting} type="submit">
              Reset Password
            </AuthButton>
          </form>
        )
      }
    </>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
      <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <p className="text-sm font-medium text-red-800 dark:text-red-300">{message}</p>
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex gap-3">
      <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <p className="text-sm font-medium text-green-800 dark:text-green-300">{message}</p>
    </div>
  );
}