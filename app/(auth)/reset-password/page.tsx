import { Suspense } from "react";
import { AuthLayout } from "@/components/(auth)/AuthLayout";
import { ForgotPasswordForm } from "@/components/(auth)/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | YourStore",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      description="We'll send you a code to reset your password"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}