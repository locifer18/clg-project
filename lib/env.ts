/**
 * Validate required environment variables at startup
 * Prevents runtime errors from missing config
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

const optionalEnvVars = [
  'NODE_ENV',
  'OTP_SECRET',
  'JWT_EXPIRY',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_SECURE',
  'EMAIL_FROM',
  'ALLOWED_ORIGINS',
];

/**
 * Validate environment configuration
 * Call this in your app entry point
 */
export function validateEnv(): void {
  console.log('🔍 Validating environment variables...\n');

  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check optional variables and warn if missing
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar] && process.env.NODE_ENV === 'production') {
      warnings.push(envVar);
    }
  }

  // Check for weak secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'your-secret-key-change-this') {
      missing.push('JWT_SECRET (must be changed from default)');
    }
    if (process.env.OTP_SECRET === 'your-secret-key-change-this') {
      missing.push('OTP_SECRET (must be changed from default)');
    }
    if (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
      missing.push('NEXTAUTH_SECRET (must be at least 32 characters)');
    }
  }

  // Report issues
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((env) => console.error(`   - ${env}`));
    console.error('\nPlease add these to your .env.local file\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Missing optional environment variables:');
    warnings.forEach((env) => console.warn(`   - ${env}`));
    console.warn('\nThese are optional but recommended for production\n');
  }

  console.log('✅ Environment variables validated\n');
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

/**
 * Get numeric environment variable
 */
export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];

  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return parseInt(value || String(defaultValue), 10);
}

/**
 * Get boolean environment variable
 */
export function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];

  if (!value) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Environment configuration object
 */
export const env = {
  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT & Auth
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  otpSecret: process.env.OTP_SECRET || 'your-secret-key-change-this',

  // NextAuth
  nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',

  // Email
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: parseInt(process.env.EMAIL_PORT || '587'),
  emailSecure: process.env.EMAIL_SECURE === 'true',
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER || '',

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
};

export default env;