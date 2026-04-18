"use client";

import { useState } from "react";
import AuthInput from "@/components/(auth)/AuthInput";
import { useLogin } from "@/hooks/useAuth";
import { sendOtp } from "@/features/auth/auth.api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { mutate: loginUser, isPending } = useLogin();

  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  // SEND OTP
  const handleSendOtp = async () => {
    try {
      await sendOtp({ email, type: "LOGIN_VERIFICATION" });
      setStep("OTP");
    } catch (err: any) {
      alert(err.response?.data?.message);
    }
  };

  // LOGIN
  const handleLogin = () => {
    loginUser(
      { email, code },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (err: any) => {
          alert(err.response?.data?.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-5">
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {step === "EMAIL" && (
          <>
            <AuthInput
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleSendOtp}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg"
            >
              Send OTP
            </button>
          </>
        )}

        {step === "OTP" && (
          <>
            <AuthInput
              label="Enter OTP"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              onClick={handleLogin}
              disabled={isPending}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        <p className="text-sm text-center">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-indigo-600 cursor-pointer"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}