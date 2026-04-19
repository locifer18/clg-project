/**
 * String Manipulation Utilities
 * For slugs, text formatting, search
 */

/**
 * Convert string to URL-friendly slug
 * @example slugify("iPhone 15 Pro Max") // "iphone-15-pro-max"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Capitalize first letter of each word
 * @example capitalize("hello world") // "Hello World"
 */
export function capitalize(text: string): string {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Capitalize only first letter
 * @example capitalizeFirst("hello world") // "Hello world"
 */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Truncate text with ellipsis
 * @example truncate("Long product description", 20) // "Long product descr..."
 */
export function truncate(text: string, length: number, suffix = "..."): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + suffix;
}

/**
 * Truncate text by word boundary
 * @example truncateWords("This is a long text", 3) // "This is a..."
 */
export function truncateWords(text: string, wordCount: number): string {
  const words = text.split(" ");
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ") + "...";
}

/**
 * Extract initials from name
 * @example getInitials("John Doe") // "JD"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Generate random string (for IDs, tokens)
 * @example randomString(8) // "aB3xY9zQ"
 */
export function randomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

/**
 * Mask email for privacy
 * @example maskEmail("john@example.com") // "j***@example.com"
 */
export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (name.length <= 1) return email;
  return `${name[0]}${"*".repeat(name.length - 1)}@${domain}`;
}

/**
 * Mask phone number
 * @example maskPhone("+919876543210") // "+91******3210"
 */
export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  const visible = 4;
  return (
    phone.slice(0, phone.length - visible).replace(/\d/g, "*") +
    phone.slice(-visible)
  );
}

/**
 * Extract numbers from string
 * @example extractNumbers("Order #12345") // "12345"
 */
export function extractNumbers(text: string): string {
  return text.replace(/\D/g, "");
}

/**
 * Check if string contains substring (case-insensitive)
 * @example containsIgnoreCase("iPhone 15 Pro", "iphone") // true
 */
export function containsIgnoreCase(text: string, search: string): boolean {
  return text.toLowerCase().includes(search.toLowerCase());
}

/**
 * Pluralize word based on count
 * @example pluralize(1, "item") // "item"
 * @example pluralize(5, "item") // "items"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  if (count === 1) return singular;
  return plural || singular + "s";
}

/**
 * Format file size
 * @example formatFileSize(1024) // "1 KB"
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Remove HTML tags from string
 * @example stripHtml("<p>Hello</p>") // "Hello"
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Escape HTML special characters
 * @example escapeHtml("<script>alert('xss')</script>")
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}