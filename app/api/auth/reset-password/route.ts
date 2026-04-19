import { asyncHandler, successResponse, ValidationError } from "@/lib/errors";
import { resetPasswordSchema } from "@/lib/validation";
import { resetPasswordService } from "@/services/AuthSerive";
import { ResetPasswordRequest } from "@/types";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();

  const validation = resetPasswordSchema.safeParse(body);

  if (!validation.success) {
    throw new ValidationError(validation.error.issues[0].message);
  }

  // ✅ Now it's safe + typed
  const typedBody: ResetPasswordRequest = validation.data;

  const result = await resetPasswordService(typedBody);

  return successResponse(result.message);
});
