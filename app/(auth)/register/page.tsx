"use client";

import { useState } from "react";
import AuthInput from "@/components/(auth)/AuthInput";
import { useRegister } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: registerUser, isPending } = useRegister();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    registerUser(form, {
      onSuccess: (res: any) => {
        alert(res.message);
        router.push("/login");
      },
      onError: (err: any) => {
        alert(err.response?.data?.message);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md space-y-5">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>

        <AuthInput label="Name" name="name" value={form.name} onChange={handleChange} />
        <AuthInput label="Email" name="email" value={form.email} onChange={handleChange} />
        <AuthInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} />
        <AuthInput label="Confirm Password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {isPending ? "Creating..." : "Register"}
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-indigo-600 cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}