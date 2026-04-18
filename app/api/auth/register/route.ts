import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

// ✅ Strong password validation for enterprise
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .refine((pass) => /[A-Z]/.test(pass), "Password must contain uppercase letter")
  .refine((pass) => /[a-z]/.test(pass), "Password must contain lowercase letter")
  .refine((pass) => /[0-9]/.test(pass), "Password must contain number")
  .refine((pass) => /[^A-Za-z0-9]/.test(pass), "Password must contain special character (!@#$%^&*)");

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be 10 digits")
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation Error", 
          error: validation.error.issues[0].message 
        },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = validation.data;

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true }, // Only select id for performance
    });

    if (existingUser) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json(
        { success: false, message: "Registration failed. Please try again." },
        { status: 409 }
      );
    }

    // ✅ Hash password with secure salt
    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ Create user with email NOT verified by default
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        emailVerified: null, // Not verified until OTP is confirmed
        cart: { create: {} }, // Create empty cart
      },
      select: { id: true, email: true }, // Don't return password
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Registration successful. Please verify your email.",
        nextStep: "EMAIL_VERIFICATION", // Hint for frontend
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}