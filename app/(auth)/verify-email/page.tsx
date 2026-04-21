'use client';

import { Suspense } from 'react';
import { AuthLayout } from '@/components/(auth)/AuthLayout';
import { VerifyOTPForm } from '@/components/(auth)/VerifyOTPForm';

function VerifyEmailContent() {

  return (
    // <AuthLayout
    //   title="Verify your email"
    //   description="We've sent a verification code to your email"
    // >
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyOTPForm type="EMAIL_VERIFICATION" />
      </Suspense>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}