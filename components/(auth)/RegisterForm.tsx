'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/hooks/useAuth';
import { registerSchema } from '@/lib/validation';
import { RegisterFormData } from '@/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AuthInput } from '@/components/(auth)/AuthInput';
import { PasswordStrength } from '@/components/(auth)/PasswordStrenght';
import { AuthButton } from '@/components/(auth)/AuthButton';

/**
 * PREMIUM REGISTER PAGE
 * 
 * Design: Luxury Minimalism with Glassmorphism
 * - Staggered animations on load
 * - Gradient backgrounds with glass effect
 * - Smooth micro-interactions
 * - Enterprise accessibility
 * - Mobile-first responsive
 */

// Container variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// ============= ICONS WITH LABELS =============

interface IconInputProps {
  icon: React.ReactNode;
  label: string;
  error?: any;
  required?: boolean;
  [key: string]: any;
}

const IconInput = motion(
  ({ icon, label, error, required, ...props }: IconInputProps) => (
    <motion.div className="space-y-2" variants={itemVariants}>
      <label className="block text-sm font-semibold text-gray-900 dark:text-white">
        <span className="flex items-center gap-2">
          <span className="w-5 h-5 text-blue-600 dark:text-blue-400">{icon}</span>
          {label}
          {!required && <span className="text-xs text-gray-400">(Optional)</span>}
        </span>
      </label>
      <div className="relative">
        <input
          {...props}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
            border-2 transition-all duration-300
            text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              error
                ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/50'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 focus:ring-blue-500/50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
      </div>
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          {error.message}
        </motion.p>
      )}
    </motion.div>
  )
);

IconInput.displayName = 'IconInput';

// ============= CHECKBOX INPUT =============

interface CheckboxInputProps {
  label: React.ReactNode;
  error?: any;
  [key: string]: any;
}

const CheckboxInput = motion(({ label, error, ...props }: CheckboxInputProps) => (
  <motion.div className="space-y-2" variants={itemVariants}>
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        {...props}
        className="
          w-5 h-5 mt-0.5 rounded-lg
          border-2 border-gray-300 dark:border-gray-600
          accent-blue-600 cursor-pointer
          transition-all duration-300
          group-hover:border-blue-400 dark:group-hover:border-blue-500
          focus:ring-2 focus:ring-blue-500/50
        "
      />
      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{label}</span>
    </label>
    {error && (
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5 ml-8">
        <AlertCircle className="w-3.5 h-3.5" />
        {error.message}
      </motion.p>
    )}
  </motion.div>
));

CheckboxInput.displayName = 'CheckboxInput';

// ============= MESSAGE COMPONENTS =============

const ErrorMessage = ({ message }: { message: string }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800 backdrop-blur-sm flex gap-3">
    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
    <p className="text-sm font-medium text-red-800 dark:text-red-300">{message}</p>
  </motion.div>
);

const SuccessMessage = ({ message }: { message: string }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-green-50/80 dark:bg-green-950/30 border border-green-200 dark:border-green-800 backdrop-blur-sm flex gap-3">
    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
    <p className="text-sm font-medium text-green-800 dark:text-green-300">{message}</p>
  </motion.div>
);

// ============= MAIN PAGE =============

export default function RegisterForm() {
  const router = useRouter();
  const { mutate: registerUser, isPending: isRegisterPending } = useRegister();
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      setSuccessMessage('');
      setIsLoading(true);

      registerUser(data, {
        onSuccess: () => {
          setSuccessMessage('✓ Account created! Redirecting to email verification...');
          toast.success('Account created successfully!');

          setTimeout(() => {
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}&type=EMAIL_VERIFICATION`);
          }, 1500);
        },
        onError: (err: any) => {
          const errorMsg = err.response?.data?.message || 'Registration failed';
          setError(errorMsg);
          toast.error(errorMsg);
          setIsLoading(false);
        },
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'An error occurred';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <motion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <motion.div className="flex justify-center mb-4" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-400/10 dark:from-blue-500/30 dark:to-blue-400/10">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </motion.div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            Join ShopHub and start shopping with exclusive deals and offers
          </p>
        </motion.div>

        {/* Card */}
        <motion.div variants={cardVariants} className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name & Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IconInput icon={<User className="w-full h-full" />} label="Full Name" placeholder="John Doe" error={errors.name} required {...register('name')} />
              <IconInput icon={<Phone className="w-full h-full" />} label="Phone" placeholder="+1 (555) 000-0000" error={errors.phone} {...register('phone')} />
            </div>

            {/* Email */}
            <IconInput icon={<Mail className="w-full h-full" />} label="Email Address" type="email" placeholder="you@example.com" error={errors.email} required {...register('email')} />

            {/* Password */}
            <motion.div className="space-y-2" variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                <span className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 12 characters with uppercase, number & symbol"
                  {...register('password')}
                  className={`
                    w-full px-4 py-3 pr-12 rounded-xl
                    bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
                    border-2 transition-all duration-300
                    text-gray-900 dark:text-white
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      errors.password
                        ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/50'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 focus:ring-blue-500/50'
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password Strength */}
            {password && <PasswordStrength password={password} />}

            {/* Confirm Password */}
            <IconInput icon={<Lock className="w-full h-full" />} label="Confirm Password" type="password" placeholder="Re-enter your password" error={errors.confirmPassword} required {...register('confirmPassword')} />

            {/* Terms & Conditions */}
            <CheckboxInput
              label={
                <>
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                    Privacy Policy
                  </a>
                </>
              }
              error={errors.agreeToTerms}
              {...register('agreeToTerms')}
            />

            {/* Messages */}
            {error && <ErrorMessage message={error} />}
            {successMessage && <SuccessMessage message={successMessage} />}

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={isRegisterPending || isLoading}
                className="
                  w-full px-6 py-3.5 rounded-xl text-base font-bold
                  bg-gradient-to-r from-blue-600 to-blue-500
                  hover:from-blue-700 hover:to-blue-600
                  text-white
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  dark:focus:ring-offset-slate-900
                  flex items-center justify-center gap-2
                  group
                "
              >
                {isRegisterPending || isLoading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <motion.div group-hover={{ x: 4 }} transition={{ duration: 0.2 }}>
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Login Link */}
          <motion.p variants={itemVariants} className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors">
              Sign in
            </Link>
          </motion.p>
        </motion.div>

        {/* Footer */}
        <motion.p variants={itemVariants} className="text-center text-xs text-gray-500 dark:text-gray-500 mt-8">
          🔒 Your data is encrypted and secure
        </motion.p>
      </motion.div>
    </div>
  );
}