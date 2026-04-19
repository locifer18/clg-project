import { Suspense } from "react";
import { AuthLayout } from "@/components/(auth)/AuthLayout";
import { VerifyOTPForm } from "@/components/(auth)/VerifyOTPForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    
  title: "Verify Email | YourStore",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
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