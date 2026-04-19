import { asyncHandler, successResponse, ValidationError } from "@/lib/errors";
import { sendOtpService } from "@/services/OtpServise";
import { sendOtpSchema } from "@/lib/validation";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();

  const validation = sendOtpSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(validation.error.issues[0].message);
  }

  await sendOtpService(validation.data);
  return successResponse("If account exists, OTP has been sent");
});