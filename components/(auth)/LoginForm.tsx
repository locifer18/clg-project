"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { emailSchema, passwordSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLogin } from "@/hooks/useAuth";
import { LoginFormData } from "@/types";


export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<LoginFormData>({
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation.mutateAsync(data);

      if (result.success) {
        toast.success(result.message || "OTP sent!", {
          description: "Check your email for the verification code.",
          icon: <CheckCircle2 className="h-5 w-5" />,
        });

        // Redirect to OTP verification
        router.push(`/verify-login?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Invalid credentials";
      
      toast.error("Login failed", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5" />,
      });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
              disabled={isSubmitting}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-gray-600 hover:text-black transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              {...register("password")}
              error={errors.password?.message}
              disabled={isSubmitting}
            />
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
            <div className="text-blue-600 mt-0.5">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Two-step verification
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                We'll send a verification code to your email for added security.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Continue
          </Button>

          <p className="text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-black font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}