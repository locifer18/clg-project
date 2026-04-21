import { asyncHandler, AuthenticationError } from "@/lib/errors";
import { refreshTokenService } from "@/services/AuthSerive";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = asyncHandler(async (req: Request) => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    throw new AuthenticationError("Refresh token missing");
  }

  const result = await refreshTokenService(refreshToken);

  const response = NextResponse.json({
    success: true,
    message: "Token refreshed",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });

  response.cookies.set("accessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  response.cookies.set("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
});