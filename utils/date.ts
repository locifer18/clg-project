/**
 * Date and Time Utilities
 * For order dates, delivery estimates, timestamps
 */

/**
 * Format date in various styles
 * @example formatDate(new Date(), "short") // "19/04/2026"
 * @example formatDate(new Date(), "long") // "April 19, 2026"
 */
export function formatDate(
  date: Date | string,
  format: "short" | "long" | "medium" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return new Intl.DateTimeFormat("en-IN").format(d);
  }

  if (format === "medium") {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Format date with time
 * @example formatDateTime(new Date()) // "19 Apr 2026, 2:30 PM"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Get relative time (time ago)
 * @example timeAgo(new Date(Date.now() - 60000)) // "1 minute ago"
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);

    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

/**
 * Calculate days until date
 * @example daysUntil(new Date('2026-12-25')) // 249
 */
export function daysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days between two dates
 * @example daysBetween(date1, date2) // 7
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Add days to date
 * @example addDays(new Date(), 7) // Date 7 days from now
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get delivery estimate (business days only)
 * @example getDeliveryEstimate(3) // "Expected by 22 Apr 2026"
 */
export function getDeliveryEstimate(businessDays: number): string {
  let daysAdded = 0;
  let currentDate = new Date();

  while (daysAdded < businessDays) {
    currentDate = addDays(currentDate, 1);
    const dayOfWeek = currentDate.getDay();

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }

  return `Expected by ${formatDate(currentDate, "medium")}`;
}

/**
 * Check if date is today
 * @example isToday(new Date()) // true
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in the past
 * @example isPast(new Date('2020-01-01')) // true
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/**
 * Check if date is in the future
 * @example isFuture(new Date('2030-01-01')) // true
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() > Date.now();
}

/**
 * Get start of day
 * @example startOfDay(new Date()) // Today at 00:00:00
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 * @example endOfDay(new Date()) // Today at 23:59:59
 */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Format time only
 * @example formatTime(new Date()) // "2:30 PM"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Get month name
 * @example getMonthName(0) // "January"
 */
export function getMonthName(monthIndex: number): string {
  const date = new Date(2000, monthIndex, 1);
  return new Intl.DateTimeFormat("en-IN", { month: "long" }).format(date);
}