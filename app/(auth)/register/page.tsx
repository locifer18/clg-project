"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "otp">("register");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🧠 handle input
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🚀 REGISTER
  const handleRegister = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || data.message);
        return;
      }

      setMessage("Account created ✅ Sending OTP...");

      // 👉 send OTP after register
      await fetch("/api/auth/otp/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          type: "EMAIL_VERIFICATION",
        }),
      });

      setStep("otp");

    } catch (err) {
      setMessage("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔐 VERIFY OTP
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/auth/otp/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          code: otp,
          type: "EMAIL_VERIFICATION",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message);
        return;
      }

      setMessage("Email verified 🎉 You can login now");

    } catch (err) {
      setMessage("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-black">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-4">
          Register 🚀
        </h1>

        {/* STEP 1: REGISTER */}
        {step === "register" && (
          <>
            <input
              name="name"
              placeholder="Full Name"
              className="w-full border p-2 rounded mb-3"
              onChange={handleChange}
            />

            <input
              name="email"
              placeholder="Email"
              className="w-full border p-2 rounded mb-3"
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full border p-2 rounded mb-3"
              onChange={handleChange}
            />

            <input
              name="phone"
              placeholder="Phone (optional)"
              className="w-full border p-2 rounded mb-4"
              onChange={handleChange}
            />

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <>
            <p className="text-sm text-gray-600 mb-2">
              OTP sent to {form.email}
            </p>

            <input
              placeholder="Enter OTP"
              className="w-full border p-2 rounded mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded"
            >
              {loading ? "Verifying..." : "Verify Email"}
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