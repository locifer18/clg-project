import { asyncHandler, successResponse } from "@/lib/errors";
import { logoutUser } from "@/services/AuthSerive";

export const POST = asyncHandler(async (req: Request) => {
  const result = await logoutUser(req);

  const response = successResponse(result.message);

  response.headers.set(
    "Set-Cookie",
    "accessToken=; HttpOnly; Secure; Path=/; Max-Age=0"
  );

  response.headers.append(
    "Set-Cookie",
    "refreshToken=; HttpOnly; Secure; Path=/api/auth/refresh; Max-Age=0"
  );

  return response;
});