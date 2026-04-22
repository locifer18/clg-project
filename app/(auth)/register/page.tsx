'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle, ArrowRight,
} from 'lucide-react';

import { AuthInput } from '@/components/(auth)/AuthInput';
import { registerSchema } from '@/lib/validation';
import { RegisterFormData } from '@/types';
import { PasswordStrength } from '@/components/(auth)/PasswordStrenght';
import { AuthButton } from '@/components/(auth)/AuthButton';
import { useRegister } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Link from 'next/link';

const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.35, ease: 'easeOut' },
  }),
};

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: registerUser, isPending: isRegisterPending } = useRegister();

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setSuccessMessage('');

    registerUser(data, {
      onSuccess: () => {
        setSuccessMessage('Account created successfully! Redirecting...');
        toast.success('Account created successfully!');
        setTimeout(() => {
          router.push(
            `/verify-email?email=${encodeURIComponent(data.email)}&type=EMAIL_VERIFICATION`
          );
        }, 1600);
      },
      onError: (err: any) => {
        const errorMsg =
          err.response?.data?.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Fields */}
      <div className="space-y-2.5">
        {[
          {
            key: 'name',
            el: (
              <AuthInput
                label="Full name"
                placeholder="Jane Doe"
                icon={<User className="h-4 w-4 text-slate-400" />}
                error={errors.name}
                {...register('name')}
              />
            ),
          },
          {
            key: 'email',
            el: (
              <AuthInput
                label="Email"
                placeholder="you@example.com"
                icon={<Mail className="h-4 w-4 text-slate-400" />}
                error={errors.email}
                {...register('email')}
              />
            ),
          },
          {
            key: 'phone',
            el: (
              <AuthInput
                label="Phone"
                placeholder="+1 555 000 0000"
                icon={<Phone className="h-4 w-4 text-slate-400" />}
                error={errors.phone}
                {...register('phone')}
              />
            ),
          },
          {
            key: 'password',
            el: (
              <AuthInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4 text-slate-400" />}
                error={errors.password}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                toggleIcon={
                  showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )
                }
                {...register('password')}
              />
            ),
          },
        ].map((f, i) => (
          <motion.div
            key={f.key}
            custom={i}
            initial="hidden"
            animate="show"
            variants={fieldVariants}
          >
            {f.el}
          </motion.div>
        ))}

        {/* Password strength (compact, animated) */}
        <AnimatePresence initial={false}>
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <PasswordStrength password={password} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div custom={4} initial="hidden" animate="show" variants={fieldVariants}>
          <AuthInput
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4 text-slate-400" />}
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </motion.div>
      </div>

      {/* Terms */}
      <div className="space-y-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('agreeToTerms')}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/40"
          />
          <span className="text-xs leading-relaxed text-slate-600">
            I agree to the{' '}
            <a className="font-medium text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a className="font-medium text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.agreeToTerms && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-600 pl-6">
            <AlertCircle className="h-3 w-3" />
            {errors.agreeToTerms.message as string}
          </div>
        )}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2 rounded-xl border border-rose-200/70 bg-rose-50/80 px-3 py-2.5 backdrop-blur"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 text-rose-600 shrink-0" />
            <p className="text-xs leading-relaxed text-rose-700">{error}</p>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-3 py-2.5 backdrop-blur"
          >
            <CheckCircle className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
            <p className="text-xs leading-relaxed text-emerald-700">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <AuthButton type="submit" isLoading={isRegisterPending} className="group w-full">
          <span className="inline-flex items-center justify-center gap-2">
            Create Account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </AuthButton>
        <p className="text-center text-[11px] text-slate-600 pt-3">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </form>
  );
}
