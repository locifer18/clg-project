"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerifyOtpRequest } from "@/types";
import { verifyLoginOtp, sendOtp } from "@/features/auth/auth.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { OtpInput } from "./OtpInput";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { verifyOtpSchema } from "@/lib/validation";
import { useEffect, useState } from "react";

export function VerifyOTPForm({ type = "LOGIN_VERIFICATION" }: { type?: "EMAIL_VERIFICATION" | "LOGIN_VERIFICATION" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
  } = useForm<VerifyOtpRequest>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email,
      type,
      code: "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyLoginOtp,
    onSuccess: (data) => {
      toast.success("Verification successful!", {
        icon: <CheckCircle2 className="h-5 w-5" />,
      });
      router.push("/");
    },
    onError: (error: any) => {
      toast.error("Verification failed", {
        description: error?.response?.data?.message || "Invalid OTP",
        icon: <AlertCircle className="h-5 w-5" />,
      });
      setOtp("");
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => sendOtp({ email, type }),
    onSuccess: () => {
      toast.success("OTP sent!", {
        description: "Check your email for the new code.",
      });
      setResendCooldown(60);
    },
    onError: (error: any) => {
      toast.error("Failed to resend OTP", {
        description: error?.response?.data?.message || "Please try again later.",
      });
    },
  });

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    setValue("code", otp);
  }, [otp, setValue]);

  const onSubmit = async (data: VerifyOtpRequest) => {
    if (data.code.length !== 6) {
      setError("code", { message: "Please enter the 6-digit code" });
      return;
    }

    await verifyMutation.mutateAsync(data);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-6">
          {/* Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              We've sent a 6-digit code to
            </p>
            <p className="font-medium">{email}</p>
          </div>

          {/* OTP Input */}
          <OtpInput
            value={otp}
            onChange={setOtp}
            error={errors.code?.message}
          />

          {/* Resend OTP */}
          <div className="text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in {resendCooldown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="text-sm text-black hover:underline inline-flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${resendMutation.isPending ? "animate-spin" : ""}`} />
                Resend code
              </button>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting || verifyMutation.isPending}
            disabled={isSubmitting || verifyMutation.isPending || otp.length !== 6}
          >
            Verify & Continue
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