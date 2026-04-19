import { Suspense } from "react";
import { AuthLayout } from "@/components/(auth)/AuthLayout";
import { VerifyOTPForm } from "@/components/(auth)/VerifyOTPForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Login | YourStore",
  description: "Enter your verification code",
};

export default function VerifyLoginPage() {
  return (
    <AuthLayout
      title="Verify your login"
      description="Enter the 6-digit code sent to your email"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyOTPForm type="LOGIN_VERIFICATION" />
      </Suspense>
    </AuthLayout>
  );
}