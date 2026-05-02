// constants/security.ts

/**
 * Security-related constants
 */

// Password requirements
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// Login security
export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
export const LOGIN_ATTEMPT_RESET_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// Token expiry times
export const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived
export const REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived
export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Rate limiting
export const OTP_RATE_LIMIT = 3; // Max 3 OTP requests
export const OTP_RATE_WINDOW_MS = 60 * 60 * 1000; // per 1 hour

export const LOGIN_RATE_LIMIT = 5; // Max 5 login attempts
export const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000; // per 15 minutes

export const API_RATE_LIMIT = 100; // Max 100 requests
export const API_RATE_WINDOW_MS = 60 * 1000; // per 1 minute

// OTP settings
export const OTP_LENGTH = 6;
export const OTP_DIGITS_ONLY = true;

// Bcrypt settings
export const BCRYPT_ROUNDS = 12;

// JWT algorithm
export const JWT_ALGORITHM = 'HS256';

// CORS & Security Headers
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
];

// Password hash iterations
export const PBKDF2_ITERATIONS = 100000;

export default {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  MAX_LOGIN_ATTEMPTS,
  ACCOUNT_LOCKOUT_DURATION_MS,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  OTP_EXPIRY_MS,
  SESSION_EXPIRY_MS,
  OTP_RATE_LIMIT,
  OTP_RATE_WINDOW_MS,
  LOGIN_RATE_LIMIT,
  LOGIN_RATE_WINDOW_MS,
  API_RATE_LIMIT,
  API_RATE_WINDOW_MS,
  OTP_LENGTH,
  BCRYPT_ROUNDS,
  JWT_ALGORITHM,
  ALLOWED_ORIGINS,
};
