// app/(auth)/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, verifyLoginOtp } from '@/features/auth/auth.api';
import { AuthInput } from '@/components/(auth)/AuthInput';
import { OtpInput } from '@/components/(auth)/OtpInput';
import { AuthButton } from '@/components/(auth)/AuthButton';
import { loginPasswordSchema } from '@/lib/validation';
import { LoginFormData, VerifyOtpRequest } from '@/types';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [otp, setOtp] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginPasswordSchema),
    mode: 'onBlur',
  });

  const onPasswordSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      setSuccessMessage('');

      const response = await login(data);

      if (response.success) {
        setEmail(data.email);
        setSuccessMessage('✓ OTP sent to your email!');
        setTimeout(() => setStep('otp'), 1500);
      } else {
        setError(response.message || 'Login failed');
        toast.error(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const onOtpComplete = async (code: string) => {
    try {
      setIsOtpSubmitting(true);
      setError('');

      const data: VerifyOtpRequest = {
        email,
        code,
        type: 'LOGIN_VERIFICATION',
      };

      const response = await verifyLoginOtp(data);

      if (response.success) {
        const authResponse = (response as any).data;
        localStorage.setItem('accessToken', authResponse.accessToken);
        localStorage.setItem('refreshToken', authResponse.refreshToken);
        localStorage.setItem('user', JSON.stringify(authResponse.user));

        setSuccessMessage('✓ Login successful! Redirecting...');
        setTimeout(() => {
          router.push(searchParams.get('callbackUrl') || '/dashboard');
        }, 800);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setIsOtpSubmitting(false);
    }
  };


  useEffect(() => {
    if (otp.length === 6) {
      onOtpComplete(otp);
    }
  }, [otp]);

  return (
    <>
      {step === 'password' ? (
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email}
            icon={<MailIcon />}
            {...register('email')}
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password}
            icon={<LockIcon />}
            {...register('password')}
          />

          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          <AuthButton isLoading={isSubmitting} type="submit">
            Continue to OTP
          </AuthButton>

          <DividerWithText text="Or continue with" />

          <div className="grid grid-cols-2 gap-3">
            <AuthButton variant="secondary" type="button">
              <GoogleIcon /> Google
            </AuthButton>
            <AuthButton variant="secondary" type="button">
              <GithubIcon /> GitHub
            </AuthButton>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Verification code sent to
            </p>
            <p className="font-semibold text-slate-900 dark:text-white break-all text-lg">
              {email}
            </p>
          </div>

          <OtpInput value={otp} onChange={setOtp} error={error} isLoading={isOtpSubmitting} />

          {successMessage && <SuccessMessage message={successMessage} />}

          <AuthButton
            variant="ghost"
            type="button"
            onClick={() => {
              setStep('password');
              setError('');
              setSuccessMessage('');
            }}
          >
            ← Back to login
          </AuthButton>
        </div>
      )}
    </>
  );
}

// Icons
const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

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

function DividerWithText({ text }: { text: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">{text}</span>
      </div>
    </div>
  );
}