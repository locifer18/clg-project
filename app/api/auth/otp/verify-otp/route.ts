import { asyncHandler, successResponse, ValidationError } from "@/lib/errors";
import { verifyOtpSchema } from "@/lib/validation";
import { verifyLoginOtp } from "@/services/AuthSerive";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();

  const validation = verifyOtpSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(validation.error.issues[0].message);
  }

  const result = await verifyLoginOtp(validation.data, req);

  const response = successResponse("OTP verified successfully", result);

  response.headers.set(
    "Set-Cookie",
    `accessToken=${result.accessToken}; Path=/; HttpOnly; SameSite=Strict`
  );

  response.headers.append(
    "Set-Cookie",
    `refreshToken=${result.refreshToken}; Path=/api/auth/refresh; HttpOnly; SameSite=Strict`
  );

  return response;
});