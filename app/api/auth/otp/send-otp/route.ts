import { asyncHandler, successResponse, ValidationError } from "@/lib/errors";
import { sendOtpService } from "@/services/OtpServise";
// import { sendOtpSchema } from "@/lib/validation";
import { SendOtpRequest } from "@/types";

export const POST = asyncHandler(async (req: Request) => {
  const body: SendOtpRequest = await req.json();

  // const validation = body;
  // if (!validation.success) {
  //   throw new ValidationError(validation.error.issues[0].message);
  // }

  await sendOtpService(body);
  return successResponse("If account exists, OTP has been sent");
});