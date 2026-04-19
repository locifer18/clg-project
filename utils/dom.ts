/**
 * DOM and Browser Utilities
 * For clipboard, scroll, local storage, browser detection
 */

/**
 * Copy text to clipboard
 * @example await copyToClipboard("Hello World") // true/false
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Read from clipboard
 * @example await readFromClipboard() // "clipboard content"
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText();
  } catch (error) {
    console.error("Failed to read from clipboard:", error);
    return null;
  }
}

/**
 * Scroll to top of page
 * @example scrollToTop() // Smooth scroll to top
 */
export function scrollToTop(smooth = true): void {
  window.scrollTo({
    top: 0,
    behavior: smooth ? "smooth" : "auto",
  });
}

/**
 * Scroll to element
 * @example scrollToElement('#products')
 */
export function scrollToElement(
  selector: string,
  options?: ScrollIntoViewOptions
): void {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      ...options,
    });
  }
}

/**
 * Get scroll position
 * @example getScrollPosition() // { x: 0, y: 100 }
 */
export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  };
}

/**
 * Check if element is in viewport
 * @example isInViewport(element) // true/false
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Get viewport dimensions
 * @example getViewportSize() // { width: 1920, height: 1080 }
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/**
 * Detect operating system
 * @example getOS() // "mac" | "windows" | "linux" | "ios" | "android"
 */
export function getOS(): "mac" | "windows" | "linux" | "ios" | "android" | "unknown" {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  if (platform.includes("mac")) return "mac";
  if (platform.includes("win")) return "windows";
  if (platform.includes("linux")) return "linux";

  return "unknown";
}

/**
 * Detect browser
 * @example getBrowser() // "chrome" | "firefox" | "safari" | "edge"
 */
export function getBrowser(): "chrome" | "firefox" | "safari" | "edge" | "unknown" {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("edg")) return "edge";
  if (userAgent.includes("chrome")) return "chrome";
  if (userAgent.includes("firefox")) return "firefox";
  if (userAgent.includes("safari") && !userAgent.includes("chrome")) return "safari";

  return "unknown";
}

/**
 * Check if device is mobile
 * @example isMobile() // true/false
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if device is touch-enabled
 * @example isTouchDevice() // true/false
 */
export function isTouchDevice(): boolean {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Get device type
 * @example getDeviceType() // "mobile" | "tablet" | "desktop"
 */
export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth;

  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

/**
 * Local storage helpers (with error handling)
 */
export const storage = {
  /**
   * Save to localStorage
   * @example storage.set('cart', cartData)
   */
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      return false;
    }
  },

  /**
   * Get from localStorage
   * @example storage.get<Cart>('cart')
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Failed to get from localStorage:", error);
      return null;
    }
  },

  /**
   * Remove from localStorage
   * @example storage.remove('cart')
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Failed to remove from localStorage:", error);
      return false;
    }
  },

  /**
   * Clear all localStorage
   * @example storage.clear()
   */
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
      return false;
    }
  },
};

/**
 * Session storage helpers (with error handling)
 */
export const sessionStorage = {
  set<T>(key: string, value: T): boolean {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Failed to save to sessionStorage:", error);
      return false;
    }
  },

  get<T>(key: string): T | null {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Failed to get from sessionStorage:", error);
      return null;
    }
  },

  remove(key: string): boolean {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Failed to remove from sessionStorage:", error);
      return false;
    }
  },

  clear(): boolean {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error("Failed to clear sessionStorage:", error);
      return false;
    }
  },
};

/**
 * Download file programmatically
 * @example downloadFile('data.json', jsonData)
 */
export function downloadFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Share content (uses Web Share API if available)
 * @example shareContent({ title: 'Product', url: 'https://...' })
 */
export async function shareContent(data: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error("Failed to share:", error);
      return false;
    }
  }

  // Fallback: Copy URL to clipboard
  if (data.url) {
    return await copyToClipboard(data.url);
  }

  return false;
}

/**
 * Debounce function calls
 * @example const debouncedSearch = debounce(searchProducts, 300)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function calls
 * @example const throttledScroll = throttle(handleScroll, 100)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}