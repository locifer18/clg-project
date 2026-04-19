import { asyncHandler, successResponse, AuthenticationError } from "@/lib/errors";
import { getUser } from "@/lib/auth";
import { logoutAllSessionsService } from "@/services/AuthSerive";

export const POST = asyncHandler(async (req: Request) => {
  const user = await getUser();

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const result = await logoutAllSessionsService(user.id);

  const response = successResponse(result.message);

  // ✅ Clear cookies
  response.headers.set(
    "Set-Cookie",
    "accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0"
  );

  response.headers.append(
    "Set-Cookie",
    "refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=0"
  );

  return response;
});