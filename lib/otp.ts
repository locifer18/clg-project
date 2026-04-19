import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET || 'your-secret-key';

export const hashOtp = (otp: string): string => {
  return crypto
    .createHmac('sha256', OTP_SECRET)
    .update(otp)
    .digest('hex');
};

export const verifyOtp = (plainOtp: string, hashedOtp: string): boolean => {
  const hash = hashOtp(plainOtp);
  // Test it:
console.log("Plain:", plainOtp); // Should be "123456"
console.log("Hashed from DB:", hashedOtp); // Should be hash
console.log("Our hash:", hashOtp(plainOtp)); // Should match DB hash
console.log("Match:", hash === hashedOtp); // Should be true
  return hash === hashedOtp;
  
};

// Track OTP attempts with Redis (recommended) or in-memory for small scale
const otpAttempts = new Map<string, { count: number; lockedUntil: Date }>();

export const checkOtpAttempts = (email: string): boolean => {
  const attempt = otpAttempts.get(email);
  
  if (!attempt) return true;
  
  if (new Date() < attempt.lockedUntil) {
    return false; // Still locked
  }
  
  otpAttempts.delete(email);
  return true;
};

export const recordOtpAttempt = (email: string): void => {
  const attempt = otpAttempts.get(email) || { count: 0, lockedUntil: new Date() };
  
  attempt.count += 1;
  
  if (attempt.count >= 5) {
    // Lock for 15 minutes after 5 failed attempts
    attempt.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  otpAttempts.set(email, attempt);
};

export const resetOtpAttempts = (email: string): void => {
  otpAttempts.delete(email);
};