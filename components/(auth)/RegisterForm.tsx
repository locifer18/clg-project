"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormData } from "@/types";
import { useRegister } from "@/hooks/auth.mutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PasswordStrength } from "./PasswordStrength";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [password, setPassword] = React.useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const watchPassword = watch("password", "");

  React.useEffect(() => {
    setPassword(watchPassword);
  }, [watchPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerMutation.mutateAsync(data);

      if (result.success) {
        toast.success(result.message || "Registration successful!", {
          description: "Please check your email to verify your account.",
          icon: <CheckCircle2 className="h-5 w-5" />,
        });

        // Redirect to verify email page
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error?.response?.data?.message || "Please try again later.",
        icon: <AlertCircle className="h-5 w-5" />,
      });
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              error={errors.name?.message}
              disabled={isSubmitting}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              error={errors.email?.message}
              disabled={isSubmitting}
            />
          </div>

          {/* Phone Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-gray-400 text-xs">(Optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              {...register("phone")}
              error={errors.phone?.message}
              disabled={isSubmitting}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••••••"
              {...register("password")}
              error={errors.password?.message}
              disabled={isSubmitting}
            />
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••••••"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
              disabled={isSubmitting}
            />
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              {...register("agreedToTerms")}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              disabled={isSubmitting}
            />
            <Label
              htmlFor="terms"
              className="text-sm text-gray-600 font-normal cursor-pointer"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-black hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-black hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.agreedToTerms && (
            <p className="text-xs text-red-600">{errors.agreedToTerms.message}</p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Account
          </Button>

          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-black font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}