'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { AuthInput } from '@/components/(auth)/AuthInput';
import { registerSchema } from '@/lib/validation';
import { RegisterFormData } from '@/types';
import { PasswordStrength } from '@/components/(auth)/PasswordStrenght';
import { AuthButton } from '@/components/(auth)/AuthButton';
import { useRegister } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: registerUser, isPending: isRegisterPending } = useRegister(); const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password');


  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');

      registerUser(data, {
        onSuccess: (response) => {
          setSuccessMessage('✓ Account created! Redirecting to verification...');
          setTimeout(() => {
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
          }, 1500);
        },
        onError: (err: any) => {
          const errorMsg = err.response?.data?.message || 'Registration failed';
          setError(errorMsg);
          toast.error(errorMsg);
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <AuthInput
        label="Full Name"
        type="text"
        placeholder="John Doe"
        error={errors.name}
        {...register('name')}
      />

      {/* Email */}
      <AuthInput
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        error={errors.email}
        {...register('email')}
      />

      {/* Phone */}
      <AuthInput
        label="Phone Number (Optional)"
        type="tel"
        placeholder="+1 (555) 123-4567"
        error={errors.phone}
        {...register('phone')}
      />

      {/* Password */}
      <AuthInput
        label="Password"
        type="password"
        placeholder="Min 12 characters with uppercase, number & symbol"
        error={errors.password}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
        {...register('password')}
      />

      {/* Password Strength */}
      {password && <PasswordStrength password={password} />}

      {/* Confirm Password */}
      <AuthInput
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
        error={errors.confirmPassword}
        {...register('confirmPassword')}
      />

      {/* Terms & Conditions */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          {...register('agreeToTerms')}
          className="w-5 h-5 mt-0.5 rounded border-2 border-slate-300 dark:border-slate-600 cursor-pointer accent-blue-600"
        />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          I agree to the{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Privacy Policy
          </a>
        </span>
      </label>
      {errors.agreeToTerms && (
        <p className="text-sm text-red-600 dark:text-red-400">{errors.agreeToTerms.message}</p>
      )}

      {/* Error message */}
      {error && <ErrorMessage message={error} />}

      {/* Success message */}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* Submit button */}
      <AuthButton isLoading={isRegisterPending} type="submit">
        Create Account
      </AuthButton>

      {/* Already have account */}
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <a href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          Sign in
        </a>
      </p>
    </form>
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