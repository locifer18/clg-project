'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, CheckCircle, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { sendOtp, resetPassword, verifyOtp } from '@/features/auth/auth.api';
import { AuthInput } from '@/components/(auth)/AuthInput';
import { AuthButton } from '@/components/(auth)/AuthButton';
import { OtpInput } from '@/components/(auth)/OtpInput';
import { PasswordStrength } from '@/components/(auth)/PasswordStrenght';
import { resetPasswordSchema, sendOtpSchema } from '@/lib/validation';
import { ResetPasswordFormData, SendOtpRequest } from '@/types';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);

  // ✅ FIX #1: Separate form for email step
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
  } = useForm({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { type: 'PASSWORD_RESET' as const },
  });

  const {
    register: registerPassword,
    handleSubmit: handleResetSubmit,
    watch,
    reset: resetForm,
    formState: { errors: resetErrors, isSubmitting: isResetSubmitting, isValid: isFormValid },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const password = watch('newPassword', '');
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  // ✅ FIX #3: Update form values when email and OTP are set
  useEffect(() => {
    if (step === 'reset') {
      resetForm({
        email,
        otp,
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [step, email, otp, resetForm]);

  const onEmailSubmit = async (data: SendOtpRequest) => {
    try {
      setError('');
      setSuccessMessage('');
      const response = await sendOtp({ email: data.email, type: 'PASSWORD_RESET' });
      if (response.success) {
        setEmail(data.email);
        setSuccessMessage('OTP sent to your email! Check your inbox.');
        setTimeout(() => {
          setSuccessMessage('');
          setStep('otp');
          toast.success('OTP sent to your email!');
        }, 1500);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const onOtpComplete = async () => {
    try {
      setIsOtpSubmitting(true);
      setError('');
      await verifyOtp({
        email,
        code: otp,
        type: 'PASSWORD_RESET',
      });

      setStep('reset');
      toast.success('OTP verified! Now reset your password.');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid OTP';
      setError(errorMsg);
      setOtp('');
      toast.error(errorMsg);
      setIsOtpSubmitting(false);
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      onOtpComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError('');
      setSuccessMessage('');

      if (data.newPassword !== data.confirmPassword) {
        setError("Passwords don't match");
        return;
      }

      if (!email || !otp) {
        setError('Invalid request. Please start over.');
        setStep('email');
        return;
      }

      const response = await resetPassword({
        email,
        otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (response.success) {
        setSuccessMessage('Password reset successful! Redirecting to login...');
        toast.success('Password reset successful!');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const isResetFormValid = newPassword && confirmPassword && newPassword === confirmPassword && !resetErrors.newPassword && !resetErrors.confirmPassword;

  return (
    <AnimatePresence mode="wait">
      {step === 'email' && (
        <motion.form
          key="email"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          onSubmit={handleEmailSubmit(onEmailSubmit)}
          className="space-y-3"
        >
          <AuthInput
            label="Email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            error={emailErrors.email}
            {...registerEmail('email')}
          />

          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          <AuthButton type="submit" isLoading={isEmailSubmitting} className="group">
            <span className="inline-flex items-center gap-2">
              Send code
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </AuthButton>

          <p className="text-center text-[11px] text-slate-600 pt-1">
            Remember your password?{' '}
            <a href="/login" className="font-semibold text-indigo-600 hover:underline">
              Sign in
            </a>
          </p>
        </motion.form>
      )}

      {step === 'otp' && (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="space-y-4"
        >
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
          </div>

          <OtpInput value={otp} onChange={setOtp} error={error} isLoading={isOtpSubmitting} />

          {isOtpSubmitting && (
            <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-600">
              <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
            </div>
          )}

          {error && <ErrorMessage message={error} />}

          <button
            type="button"
            onClick={() => {
              setStep('email');
              setOtp('');
              setError('');
            }}
            className="mx-auto flex items-center gap-1 text-[14px] font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </button>

          <p className="text-center text-[11px] text-slate-500">
            Didn't receive the code? <button type="button" onClick={() => { setStep('email'); setOtp(''); }} className="font-semibold text-indigo-600 hover:underline">Resend</button>
          </p>
        </motion.div>
      )}

      {step === 'reset' && (
        <motion.form
          key="reset"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          onSubmit={handleResetSubmit(onResetSubmit)}
          className="space-y-3"
        >
          <div className="text-center mb-4">
            <p className="text-sm text-slate-600">
              Create a new password for <strong>{email}</strong>
            </p>
          </div>

          <AuthInput
            label="New password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            error={resetErrors.newPassword}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            {...registerPassword('newPassword')}
          />

          {password && <PasswordStrength password={password} />}

          <AuthInput
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            error={resetErrors.confirmPassword}
            {...registerPassword('confirmPassword')}
          />

          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          {/* ✅ FIX #9: Make button disabled only if form is invalid */}
          <AuthButton
            type="submit"
            isLoading={isResetSubmitting}
            disabled={!isResetFormValid || isResetSubmitting}
            className="group"
          >
            <span className="inline-flex items-center gap-2">
              Reset password
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </AuthButton>

          <p className="text-center text-[11px] text-slate-500">
            Remember your password?{' '}
            <a href="/login" className="font-semibold text-indigo-600 hover:underline">
              Sign in
            </a>
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-rose-200/70 bg-rose-50/80 px-2.5 py-2 backdrop-blur">
      <AlertCircle className="h-3.5 w-3.5 mt-0.5 text-rose-600 shrink-0" />
      <p className="text-[11px] leading-relaxed text-rose-700">{message}</p>
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-emerald-200/70 bg-emerald-50/80 px-2.5 py-2 backdrop-blur">
      <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-emerald-600 shrink-0" />
      <p className="text-[11px] leading-relaxed text-emerald-700">{message}</p>
    </div>
  );
}