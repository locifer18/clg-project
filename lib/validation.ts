// lib/validation.ts
import { z } from 'zod';

/**
 * Common validation patterns
 */

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

// Password validation (strong)
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .refine((pass) => /[A-Z]/.test(pass), 'Must contain uppercase letter (A-Z)')
  .refine((pass) => /[a-z]/.test(pass), 'Must contain lowercase letter (a-z)')
  .refine((pass) => /[0-9]/.test(pass), 'Must contain number (0-9)')
  .refine(
    (pass) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass),
    'Must contain special character (!@#$%^&*)'
  );

// Phone validation
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number')
  .optional()
  .or(z.literal(''));

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

// OTP validation
export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

// URL validation
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .startsWith('http', 'URL must start with http or https');

/**
 * Auth schemas
 */

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema,
  agreedToTerms: z.boolean().refine((val) => val === true, 'You must agree to terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: emailSchema,
  code: otpSchema,
  password: passwordSchema,
});

export const sendOtpSchema = z.object({
  email: emailSchema,
  type: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_VERIFICATION']),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: otpSchema,
  type: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_VERIFICATION']),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * Validate request body
 * Usage: const result = validateBody(schema, body);
 */
export async function validateBody<T extends z.ZodTypeAny>(schema: T, data: unknown): Promise<{ success: boolean; data?: z.infer<T>; error?: string }> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((issue) => issue.message).join(', ');
      return { success: false, error: messages };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 1000); // Limit length
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 10;
  else feedback.push('Use at least 12 characters');

  if (/[a-z]/.test(password)) score += 25;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 25;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*]/.test(password)) score += 10;
  else feedback.push('Add special characters');

  return {
    score: Math.min(100, score),
    feedback,
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const result = emailSchema.safeParse(email);
  return result.success;
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  const result = passwordSchema.safeParse(password);
  return result.success;
}

const validationFunctions = {
  emailSchema,
  passwordSchema,
  phoneSchema,
  nameSchema,
  otpSchema,
  urlSchema,
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  changePasswordSchema,
  resetPasswordSchema,
  validateBody,
  sanitizeInput,
  checkPasswordStrength,
  isValidEmail,
  isValidPassword,
};

export default validationFunctions