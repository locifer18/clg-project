// lib/password-check.ts
import axios from 'axios';
import crypto from 'crypto';

const HIBP_API = 'https://api.pwnedpasswords.com/range';
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty',
  'abc123', 'monkey', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
  'bailey', 'passw0rd', 'shadow', 'superman', 'qazwsx'
];

/**
 * Check if password is in common passwords list
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.some(
    (common) => password.toLowerCase().includes(common.toLowerCase())
  );
}

/**
 * Check if password has been compromised using Have I Been Pwned API
 * Uses k-anonymity model (only sends first 5 chars of SHA-1 hash)
 * 
 * SAFE: API never sees the full password hash
 * Reference: https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange
 */
export async function isPasswordCompromised(password: string): Promise<boolean> {
  try {
    // Hash password with SHA-1
    const hash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();
    
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Query HIBP API (only sends prefix - remaining 35 chars are not sent)
    const response = await axios.get(`${HIBP_API}/${prefix}`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'CLG-Ecommerce-App/1.0',
      },
    });

    // Check if our suffix is in the response
    // Response format: "SUFFIX:COUNT\nSUFFIX:COUNT\n..."
    const hashes = response.data.split('\r\n');
    
    for (const hashLine of hashes) {
      const [respSuffix] = hashLine.split(':');
      if (respSuffix === suffix) {
        console.warn(`⚠️ Password found in compromised database: ${prefix}${respSuffix.substring(0, 3)}***`);
        return true; // Password is compromised
      }
    }

    return false; // Password is safe
  } catch (error) {
    // If API fails, allow the request (don't block user due to external service failure)
    console.warn('⚠️ Password compromise check failed (API unreachable):', error);
    return false;
  }
}

/**
 * Validate password strength and security
 * Returns { valid: boolean, errors: string[] }
 */
export async function validatePasswordSecurity(password: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (password.length > 128) {
    errors.push('Password is too long (max 128 characters)');
  }

  // Common password check
  if (isCommonPassword(password)) {
    errors.push('Password is too common. Choose something more unique');
  }

  // Check if compromised
  if (await isPasswordCompromised(password)) {
    errors.push('This password has been compromised in a data breach. Choose a different one');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  isCommonPassword,
  isPasswordCompromised,
  validatePasswordSecurity,
};
