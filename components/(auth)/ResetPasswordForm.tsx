"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendOtpSchema, type SendOtpRequest } from "@/types";
import { sendOtp } from "@/features/auth/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

export function ForgotPasswordForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<SendOtpRequest>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      type: "PASSWORD_RESET",
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: sendOtp,
    onSuccess: () => {
      const email = getValues("email");
      toast.success("Reset code sent!", {
        description: "Check your email for the password reset code.",
        icon: <CheckCircle2 className="h-5 w-5" />,
      });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    },
    onError: (error: any) => {
      toast.error("Failed to send reset code", {
        description: error?.response?.data?.message || "Please try again later.",
        icon: <AlertCircle className="h-5 w-5" />,
      });
    },
  });

  const onSubmit = async (data: SendOtpRequest) => {
    await sendOtpMutation.mutateAsync(data);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          {/* Info Section */}
          <div className="bg-gray-50 rounded-lg p-4 flex gap-3">
            <Mail className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Forgot your password?
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Enter your email address and we'll send you a code to reset your password.
              </p>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
              disabled={isSubmitting || sendOtpMutation.isPending}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting || sendOtpMutation.isPending}
            disabled={isSubmitting || sendOtpMutation.isPending}
          >
            Send Reset Code
          </Button>

          <Link
            href="/login"
            className="text-sm text-center text-gray-600 hover:text-black transition-colors"
          >
            Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}