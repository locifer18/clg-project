'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, CheckCircle, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { verifyLoginOtp, sendOtp } from '@/features/auth/auth.api';
import { useLogin } from '@/hooks/useAuth';
import { AuthInput } from '@/components/(auth)/AuthInput';
import { OtpInput } from '@/components/(auth)/OtpInput';
import { AuthButton } from '@/components/(auth)/AuthButton';
import { loginPasswordSchema } from '@/lib/validation';
import { LoginFormData, VerifyOtpRequest } from '@/types';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: loginUser, isPending: isLoginPending } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginPasswordSchema),
    mode: 'onBlur',
  });

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      setError('');
      await sendOtp({ email, type: 'LOGIN_VERIFICATION' });
      toast.success('OTP sent again!');
      setResendCooldown(60);
      setOtp('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onPasswordSubmit = (data: LoginFormData) => {
    setError('');
    setSuccessMessage('');
    loginUser(data, {
      onSuccess: () => {
        setEmail(data.email);
        toast.success('OTP sent to your email!');
        setTimeout(() => setStep('otp'), 1500);
      },
      onError: (err: any) => {
        const errorMsg = err.response?.data?.message || 'Login failed';
        setError(errorMsg);
        toast.error(errorMsg);
      },
    });
  };

  useEffect(() => {
    if (otp.length === 6) verifyOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const verifyOtp = async () => {
    try {
      setIsOtpSubmitting(true);
      setError('');
      const data: VerifyOtpRequest = { email, code: otp, type: 'LOGIN_VERIFICATION' };
      const response = await verifyLoginOtp(data);

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ['me'] });
        setSuccessMessage('✓ Login successful! Redirecting...');
        toast.success('Login successful!');
        setTimeout(() => router.push('/dashboard'), 800);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid OTP';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsOtpSubmitting(false);
      setOtp('');
    }
  };

  return (
      <AnimatePresence mode="wait">
        {step === 'password' ? (
          <motion.form
            key="password"
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            onSubmit={handleSubmit(onPasswordSubmit)}
            className="space-y-3"
          >
            <div className="space-y-2.5">
              <AuthInput label="Email" placeholder="you@example.com"
                icon={<Mail className="h-4 w-4" />} error={errors.email} {...register('email')} />
              <AuthInput label="Password" type="password" placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />} error={errors.password}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                {...register('password')} />
            </div>

            <div className="flex justify-end">
              <a href="/forgot-password" className="text-[12px] font-medium text-indigo-600 hover:underline">
                Forgot password?
              </a>
            </div>

            {error && <ErrorMessage message={error} />}
            {successMessage && <SuccessMessage message={successMessage} />}

            <AuthButton type="submit" isLoading={isLoginPending} className="group">
              <span className="inline-flex items-center gap-2">
                Continue
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </AuthButton>

            <DividerWithText text="or continue with" />

            <div className="grid grid-cols-2 gap-2">
              <AuthButton type="button" variant="secondary">
                <GoogleIcon /> Google
              </AuthButton>
              <AuthButton type="button" variant="secondary">
                <GithubIcon /> GitHub
              </AuthButton>
            </div>

            <p className="text-center text-[11px] text-slate-600 pt-1">
              Don’t have an account?{' '}
              <a href="/register" className="font-semibold text-indigo-600 hover:underline">Sign up</a>
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <OtpInput value={otp} onChange={setOtp} error={error} isLoading={isOtpSubmitting} />

            {isOtpSubmitting && (
              <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-600">
                <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
              </div>
            )}

            <div className="flex justify-center">
              {resendCooldown > 0 ? (
                <span className="text-[11px] text-slate-500">Resend code in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              )}
            </div>

            {successMessage && <SuccessMessage message={successMessage} />}

            <button
              type="button"
              onClick={() => {
                setStep('password');
                setError('');
                setSuccessMessage('');
                setOtp('');
                setResendCooldown(0);
              }}
              className="mx-auto flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3 w-3" /> Back to login
            </button>
          </motion.div>
        )}
      </AnimatePresence>
  );
}

// === Helpers ===
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

function DividerWithText({ text }: { text: string }) {
  return (
    <div className="relative flex items-center py-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="px-3 text-[10px] uppercase tracking-wider text-slate-400 font-medium">{text}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GithubIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);
