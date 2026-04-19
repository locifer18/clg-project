import { asyncHandler, successResponse, ValidationError } from "@/lib/errors";
import { loginUser } from "@/services/AuthSerive";
import { loginPasswordSchema } from "@/lib/validation";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();

  const validation = loginPasswordSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(validation.error.issues[0].message);
  }

  const result = await loginUser(validation.data);
  return successResponse(result.message, result);
});