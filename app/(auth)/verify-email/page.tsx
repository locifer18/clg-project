'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { sendOtp } from '@/features/auth/auth.api';
import { AuthLayout } from '@/components/(auth)/AuthLayout';
import { VerifyOTPForm } from '@/components/(auth)/VerifyOTPForm';
import { Metadata } from 'next';
import { toast } from 'sonner';

// ✅ ADD THIS WRAPPER to avoid Suspense issues
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [otpSent, setOtpSent] = useState(false);

  // ✅ AUTO-SEND OTP when page loads
  useEffect(() => {
    const sendVerificationOtp = async () => {
      if (!email || otpSent) return;

      try {
        console.log('📤 Sending OTP to:', email);
        await sendOtp({
          email,
          type: 'EMAIL_VERIFICATION',
        });
        toast.success('Verification code sent to your email!');
        setOtpSent(true);
      } catch (error: any) {
        console.error('❌ Failed to send OTP:', error);
        toast.error('Failed to send code. Please try again.');
      }
    };

    sendVerificationOtp();
  }, [email, otpSent]);

  return (
    <AuthLayout
      title="Verify your email"
      description="We've sent a verification code to your email"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyOTPForm type="EMAIL_VERIFICATION" />
      </Suspense>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}