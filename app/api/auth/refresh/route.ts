import { asyncHandler, successResponse } from "@/lib/errors";
import { refreshTokenService } from "@/services/AuthSerive";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();
  const { refreshToken } = body;

  const result = await refreshTokenService(refreshToken);

  const response = successResponse("Token refreshed successfully", result);

  // ✅ Set cookies
  response.headers.set(
    "Set-Cookie",
    `accessToken=${result.accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`
  );

  response.headers.append(
    "Set-Cookie",
    `refreshToken=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800`
  );

  return response;
});