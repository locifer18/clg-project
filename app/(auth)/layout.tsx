// app/(auth)/layout.tsx
'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes('register')) return 'Create Account';
    if (pathname.includes('login')) return 'Welcome Back';
    if (pathname.includes('verify')) return 'Verify Email';
    if (pathname.includes('forgot')) return 'Reset Password';
    return 'Authentication';
  };

  const getPageDesc = () => {
    if (pathname.includes('register')) return 'Join thousands of users and start shopping today';
    if (pathname.includes('login')) return 'Sign in to your account to continue';
    if (pathname.includes('verify')) return 'Check your email for the verification code';
    if (pathname.includes('forgot')) return 'Enter your email to reset your password';
    return '';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main container */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <span className="text-xl font-bold text-white">⚡</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            {getPageTitle()}
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            {getPageDesc()}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 sm:p-10 animate-slide-up border border-slate-200 dark:border-slate-800">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {pathname.includes('register') && (
            <p>
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Sign in
              </a>
            </p>
          )}

          {pathname.includes('login') && (
            <>
              <p className="mb-3">
                Don't have an account?{' '}
                <a href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  Create one
                </a>
              </p>
              <p>
                <a href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  Forgot password?
                </a>
              </p>
            </>
          )}

          {pathname.includes('verify') && (
            <p>
              Didn't receive the code?{' '}
              <button className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Resend
              </button>
            </p>
          )}

          {pathname.includes('forgot') && (
            <p>
              Remember your password?{' '}
              <a href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}