import { asyncHandler, successResponse, ValidationError } from "@/lib/errors";
import { verifyOtpSchema } from "@/lib/validation";
import { verifyLoginOtp } from "@/services/AuthSerive";
import { verifyOtpService } from "@/services/OtpServise";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();

  const validation = verifyOtpSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(validation.error.issues[0].message);
  }

  const data = validation.data;

  if (data.type === "EMAIL_VERIFICATION") {
    const result = await verifyOtpService(data);
    return successResponse("Email verified successfully", result);
  }

  if (data.type === "LOGIN_VERIFICATION") {
    const result = await verifyLoginOtp(data, req);

    const response = successResponse("Login successfully", result);

    response.headers.set(
      "Set-Cookie",
      `accessToken=${result.accessToken}; Path=/; HttpOnly; SameSite=Strict`
    );

    response.headers.append(
      "Set-Cookie",
      `refreshToken=${result.refreshToken}; Path=/api/auth/refresh; HttpOnly; SameSite=Strict`
    );

    return response;
  }

  if (data.type === "PASSWORD_RESET") {
    const result = await verifyOtpService(data);
    return successResponse("OTP verified successfully", result);
  }

  throw new ValidationError("Invalid type");
});