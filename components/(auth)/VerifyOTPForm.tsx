// components/(auth)/VerifyOTPForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";

import { VerifyOtpRequest } from "@/types";
import { verifyLoginOtp, sendOtp, verifyOtp } from "@/features/auth/auth.api";
import { OtpInput } from "./OtpInput";
import { verifyOtpSchema } from "@/lib/validation";
import Link from "next/link";

export function VerifyOTPForm({
  type = "LOGIN_VERIFICATION",
}: {
  type?: "EMAIL_VERIFICATION" | "LOGIN_VERIFICATION";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { setValue, setError } = useForm({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email, type, code: "" },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyOtpRequest) => {
      if (type === "EMAIL_VERIFICATION") return await verifyOtp(data);
      return await verifyLoginOtp(data);
    },
    onSuccess: () => {
      toast.success("Verification successful!", { icon: <CheckCircle2 className="h-4 w-4" /> });
      router.push(type === "EMAIL_VERIFICATION" ? "/login?verified=true" : "/dashboard");
    },
    onError: (err: any) => {
      toast.error("Verification failed", {
        description: err?.response?.data?.message || "Invalid OTP",
        icon: <AlertCircle className="h-4 w-4" />,
      });
      setOtp("");
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => sendOtp({ email, type }),
    onSuccess: () => {
      toast.success("OTP sent!", { description: "Check your email for the new code." });
      setResendCooldown(60);
      setOtp("");
    },
    onError: (err: any) => {
      toast.error("Failed to resend OTP", {
        description: err?.response?.data?.message || "Please try again later.",
      });
    },
  });

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => { setValue("code", otp); }, [otp, setValue]);

  useEffect(() => {
    if (otp.length === 6) {
      const timer = setTimeout(() => {
        verifyMutation.mutate({ email, code: otp, type });
      }, 200);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, email, type]);

  return (
    <div className="space-y-4">
      <OtpInput value={otp} onChange={setOtp} isLoading={verifyMutation.isPending} />

      {verifyMutation.isPending && (
        <div className="flex items-center justify-center gap-2 text-[15px] text-indigo-600">
          <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
        </div>
      )}

      <div className="flex justify-center">
        {resendCooldown > 0 ? (
          <span className="text-[15px] text-slate-500">Resend code in {resendCooldown}s</span>
        ) : (
          <button
            type="button"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="inline-flex items-center gap-1.5 text-[15px] font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${resendMutation.isPending ? "animate-spin" : ""}`} />
            {resendMutation.isPending ? "Sending..." : "Resend Code"}
          </button>
        )}
      </div>

      <Link
        href="/login"
        className="mx-auto flex w-fit items-center gap-1 text-[18px] font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
    </div>
  );
}
