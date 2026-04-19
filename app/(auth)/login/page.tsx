import { Suspense } from "react";
import { AuthLayout } from "@/components/(auth)/AuthLayout";
import { LoginForm } from "@/components/(auth)/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | YourStore",
  description: "Sign in to your account",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue shopping"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}