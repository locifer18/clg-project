// api/auth/login-history.ts
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/auth/login-history?limit=50&offset=0
 * 
 * Get user's login history with IP and device info
 * Shows both successful and failed login attempts
 */
export async function GET(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100); // Max 100
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Get login history
    const logs = await prisma.loginLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await prisma.loginLog.count({
      where: { userId: user.id },
    });

    // Format response
    const history = logs.map((log) => ({
      id: log.id,
      success: log.success,
      timestamp: log.createdAt,
      device: parseUserAgent(log.userAgent),
      ipAddress: maskIpAddress(log.ipAddress),
      reason: log.reason,
      displayReason: getDisplayReason(log),
    }));

    // Detect suspicious activity
    const suspiciousActivity = detectAnomalies(logs);

    return NextResponse.json({
      success: true,
      history,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      alerts: suspiciousActivity,
    });

  } catch (error) {
    console.error("Login history error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Helper: Parse user agent
 */
function parseUserAgent(userAgent?: string): string {
  if (!userAgent) return "Unknown";

  // Browser detection
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return "Safari";
  if (/edge/i.test(userAgent)) return "Edge";

  // Device detection
  if (/mobile/i.test(userAgent)) return "Mobile";
  if (/tablet/i.test(userAgent)) return "Tablet";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/macintosh/i.test(userAgent)) return "Mac";
  if (/linux/i.test(userAgent)) return "Linux";

  return "Unknown";
}

/**
 * Helper: Mask IP for privacy
 */
function maskIpAddress(ip?: string): string {
  if (!ip) return "Unknown";

  if (ip.includes(":")) {
    // IPv6
    const parts = ip.split(":");
    return parts.slice(0, 3).join(":") + ":***";
  } else {
    // IPv4
    const parts = ip.split(".");
    return parts.slice(0, 3).join(".") + ".*";
  }
}

/**
 * Helper: Get human-readable reason
 */
function getDisplayReason(log: any): string {
  if (log.success) return "Successful login";

  const reasonMap: { [key: string]: string } = {
    "Invalid OTP": "Invalid OTP code entered",
    "Invalid OTP - Account locked": "Too many failed attempts - account locked",
    "Email not verified": "Email verification required",
    "Account locked": "Account is currently locked",
    "Invalid credentials": "Invalid email or password",
  };

  return reasonMap[log.reason || ""] || log.reason || "Failed login";
}

/**
 * Helper: Detect suspicious activity patterns
 */
function detectAnomalies(logs: any[]): any[] {
  const alerts = [];

  if (!logs || logs.length === 0) return alerts;

  // 1. Multiple failed attempts in short time
  const recentLogs = logs.slice(0, 10);
  const failedCount = recentLogs.filter((l) => !l.success).length;

  if (failedCount >= 3) {
    alerts.push({
      type: "multiple_failed_attempts",
      severity: "high",
      message: `${failedCount} failed login attempts in the last few hours`,
    });
  }

  // 2. New device login
  const uniqueDevices = new Set(logs.map((l) => parseUserAgent(l.userAgent)));
  if (uniqueDevices.size >= 5) {
    alerts.push({
      type: "multiple_devices",
      severity: "medium",
      message: `${uniqueDevices.size} different devices have accessed this account`,
    });
  }

  // 3. Login after lock (if available in logs)
  const lockLog = logs.find((l) => l.reason?.includes("locked"));
  if (lockLog) {
    const nextLog = logs.find((l) => l.createdAt > lockLog.createdAt && l.success);
    if (nextLog) {
      alerts.push({
        type: "login_after_lock",
        severity: "medium",
        message: "Account was locked due to failed attempts, then logged in",
      });
    }
  }

  // 4. Impossible travel (if you have geolocation)
  // This would require country/city data from IP geolocation service
  // Simplified version: just alert if very different IPs
  const ips = logs
    .slice(0, 5)
    .map((l) => l.ipAddress)
    .filter(Boolean);

  if (new Set(ips).size > 3) {
    alerts.push({
      type: "unusual_locations",
      severity: "low",
      message: "Logins from multiple different IP addresses",
    });
  }

  return alerts;
}