'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, UserPlus, LogIn, Mail, KeyRound, Sparkles, Truck } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes('register')) return 'Create your account';
    if (pathname.includes('login')) return 'Welcome back';
    if (pathname.includes('verify')) return 'Verify your email';
    if (pathname.includes('forgot')) return 'Reset your password';
    return 'Authentication';
  };

  const getSubtitle = () => {
    if (pathname.includes('register')) return 'Start your premium shopping journey in seconds.';
    if (pathname.includes('login')) return 'Sign in to continue where you left off.';
    if (pathname.includes('verify')) return 'We sent a secure code to your inbox.';
    if (pathname.includes('forgot')) return 'We’ll help you get back into your account.';
    return '';
  };

  const getIcon = () => {
    const cls = 'w-5 h-5 text-white';
    if (pathname.includes('register')) return <UserPlus className={cls} />;
    if (pathname.includes('login')) return <LogIn className={cls} />;
    if (pathname.includes('verify')) return <Mail className={cls} />;
    if (pathname.includes('forgot')) return <KeyRound className={cls} />;
    return <Zap className={cls} />;
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 antialiased">
      {/* Ambient gradient mesh */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-indigo-300/40 via-violet-200/30 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-sky-200/40 via-cyan-200/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-fuchsia-200/30 via-pink-100/20 to-transparent blur-3xl" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* LEFT SIDE — Brand / value prop */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="hidden lg:flex flex-col gap-8 pr-4"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Trusted by 87,459+ shoppers
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.05]">
                Shop smarter.
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Live better.
                </span>
              </h1>
              <p className="max-w-md text-base leading-relaxed text-slate-600">
                Join the new standard in premium e-commerce. Curated products, lightning-fast delivery, and an experience built around you.
              </p>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3.5 py-2 text-sm text-slate-700 shadow-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure checkout
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3.5 py-2 text-sm text-slate-700 shadow-sm backdrop-blur">
                <Truck className="h-4 w-4 text-indigo-600" />
                2-day delivery
              </div>
            </div>

            {/* Floating product chips */}
            <div className="relative mt-4 h-44">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-0 top-2 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 pr-5 shadow-lg shadow-indigo-500/5 backdrop-blur-xl"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                  🎧
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Wireless Audio</p>
                  <p className="text-xs text-slate-500">Studio-grade sound</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute right-2 top-20 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 pr-5 shadow-lg shadow-fuchsia-500/5 backdrop-blur-xl"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white">
                  ⌚
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Smart Wearables</p>
                  <p className="text-xs text-slate-500">Health, redefined</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT SIDE — Premium Light Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="mx-auto w-full max-w-[440px]"
          >
            {/* Gradient ring wrapper */}
            <div className="relative rounded-[24px] p-[1px] bg-gradient-to-b from-white/80 via-white/40 to-white/10 shadow-[0_30px_80px_-20px_rgba(79,70,229,0.25)]">
              {/* Glow */}
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-indigo-300/30 via-violet-200/20 to-fuchsia-200/30 blur-2xl" />

              <div className="relative overflow-hidden rounded-[23px] bg-white/65 px-6 py-5 backdrop-blur-2xl sm:px-7 sm:py-6">
                {/* Inner top highlight */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                {/* Soft corner sheen */}
                <div className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-300/30 to-transparent blur-2xl" />

                {/* Header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/30 ring-1 ring-white/40">
                    {getIcon()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                      {getPageTitle()}
                    </h2>
                    {getSubtitle() && (
                      <p className="text-xs text-slate-500">{getSubtitle()}</p>
                    )}
                  </div>
                </div>

                {/* Form slot */}
                {children}
              </div>
            </div>

            {/* Footer trust line */}
            <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-medium tracking-wide text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              256-bit SSL · Enterprise Encryption
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
