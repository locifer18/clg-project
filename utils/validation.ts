/**
 * Validation Utilities
 * Runtime validators (complementary to Zod schemas in lib/validation.ts)
 */

/**
 * Validate email format
 * @example isValidEmail("test@example.com") // true
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 * @example isValidPhone("+919876543210") // true
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

/**
 * Validate PIN code (Indian)
 * @example isValidPincode("110001") // true
 */
export function isValidPincode(pincode: string): boolean {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

/**
 * Validate GST number (Indian)
 * @example isValidGST("29ABCDE1234F1Z5") // true
 */
export function isValidGST(gst: string): boolean {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
}

/**
 * Validate PAN card number (Indian)
 * @example isValidPAN("ABCDE1234F") // true
 */
export function isValidPAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

/**
 * Validate Aadhaar number (Indian)
 * @example isValidAadhaar("123456789012") // true
 */
export function isValidAadhaar(aadhaar: string): boolean {
  const aadhaarRegex = /^[2-9]\d{11}$/;
  return aadhaarRegex.test(aadhaar.replace(/\s/g, ""));
}

/**
 * Validate URL
 * @example isValidURL("https://example.com") // true
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate credit card number (Luhn algorithm)
 * @example isValidCreditCard("4532015112830366") // true
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\s/g, "");

  if (!/^\d{13,19}$/.test(sanitized)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Get credit card type
 * @example getCreditCardType("4532015112830366") // "visa"
 */
export function getCreditCardType(
  cardNumber: string
): "visa" | "mastercard" | "amex" | "discover" | "unknown" {
  const sanitized = cardNumber.replace(/\s/g, "");

  if (/^4/.test(sanitized)) return "visa";
  if (/^5[1-5]/.test(sanitized)) return "mastercard";
  if (/^3[47]/.test(sanitized)) return "amex";
  if (/^6(?:011|5)/.test(sanitized)) return "discover";

  return "unknown";
}

/**
 * Validate CVV
 * @example isValidCVV("123", "visa") // true
 */
export function isValidCVV(cvv: string, cardType?: string): boolean {
  if (cardType === "amex") {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
}

/**
 * Validate expiry date (MM/YY)
 * @example isValidExpiry("12/25") // true/false
 */
export function isValidExpiry(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1]);
  const year = parseInt(match[2]) + 2000;

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const expiryDate = new Date(year, month);

  return expiryDate > now;
}

/**
 * Validate UPI ID
 * @example isValidUPI("username@paytm") // true
 */
export function isValidUPI(upi: string): boolean {
  const upiRegex = /^[\w.-]+@[\w]+$/;
  return upiRegex.test(upi);
}

/**
 * Validate IFSC code (Indian bank)
 * @example isValidIFSC("SBIN0001234") // true
 */
export function isValidIFSC(ifsc: string): boolean {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return ifscRegex.test(ifsc);
}

/**
 * Validate username (alphanumeric + underscore)
 * @example isValidUsername("john_doe123") // true
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Check password strength
 * @example checkPasswordStrength("MyPass123!") // { score: 80, level: "strong" }
 */
export function checkPasswordStrength(password: string): {
  score: number;
  level: "weak" | "fair" | "good" | "strong";
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Length
  if (password.length >= 12) score += 25;
  else if (password.length >= 8) score += 15;
  else feedback.push("Use at least 12 characters");

  // Lowercase
  if (/[a-z]/.test(password)) score += 20;
  else feedback.push("Add lowercase letters");

  // Uppercase
  if (/[A-Z]/.test(password)) score += 20;
  else feedback.push("Add uppercase letters");

  // Numbers
  if (/[0-9]/.test(password)) score += 20;
  else feedback.push("Add numbers");

  // Special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
  else feedback.push("Add special characters");

  let level: "weak" | "fair" | "good" | "strong";
  if (score < 40) level = "weak";
  else if (score < 60) level = "fair";
  else if (score < 80) level = "good";
  else level = "strong";

  return { score, level, feedback };
}

/**
 * Sanitize HTML (remove scripts)
 * @example sanitizeHTML("<script>alert('xss')</script>") // ""
 */
export function sanitizeHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}

/**
 * Validate JSON string
 * @example isValidJSON('{"name": "John"}') // true
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is empty or whitespace
 * @example isEmpty("   ") // true
 */
export function isEmpty(str: string): boolean {
  return str.trim().length === 0;
}

/**
 * Check if value is numeric
 * @example isNumeric("123.45") // true
 */
export function isNumeric(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
}

/**
 * Validate age (18+)
 * @example isValidAge(new Date('2000-01-01')) // true
 */
export function isValidAge(birthDate: Date, minAge = 18): boolean {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= minAge;
  }

  return age >= minAge;
}