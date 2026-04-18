"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // 🔥 Send OTP
  const handleSendOtp = async () => {
    if (!email) return setMessage("Email is required");

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/auth/otp/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type: "LOGIN_VERIFICATION",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("OTP sent (check email 📩)");
      setStep("otp");

      // ⏳ cooldown timer (30 sec)
      setCooldown(30);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setMessage("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Verify OTP (YOUR LOGIN API)
  const handleLogin = async () => {
    if (!otp) return setMessage("Enter OTP");

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);

        // 🔥 show attempts left
        if (data.attemptsRemaining) {
          setMessage(
            `${data.message} (${data.attemptsRemaining} attempts left)`
          );
        }

        return;
      }

      // ✅ SUCCESS
      localStorage.setItem("accessToken", data.accessToken);

      // 🔥 role based redirect
      switch (data.user.role) {
        case "ADMIN":
          router.push("/admin");
          break;
        case "CUSTOMER":
          router.push("/");
          break;
        default:
          router.push("/");
      }

    } catch (err) {
      setMessage("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-black">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">

        <h1 className="text-2xl font-bold mb-4 text-center text-black">
          Login 🔐
        </h1>

        {/* STEP 1 */}
        {step === "email" && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border p-2 rounded mb-4 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === "otp" && (
          <>
            <p className="text-sm text-gray-600 mb-2">
              OTP sent to {email}
            </p>

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="w-full border p-2 rounded mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded mb-2"
            >
              {loading ? "Verifying..." : "Login"}
            </button>

            {/* 🔁 RESEND */}
            <button
              onClick={handleSendOtp}
              disabled={cooldown > 0}
              className="text-sm text-blue-600 underline"
            >
              {cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : "Resend OTP"}
            </button>
          </>
        )}

        {/* MESSAGE */}
        {message && (
          <p className="text-center text-sm mt-4 text-red-500">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}