import { asyncHandler, successResponse, ValidationError } from "@/lib/errors";
import { verifyOtpService } from "@/services/OtpServise";
import { verifyOtpSchema } from "@/lib/validation";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();

  const validation = verifyOtpSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(validation.error.issues[0].message);
  }

  const result = await verifyOtpService(validation.data);
  return successResponse("OTP verified successfully", result);
});