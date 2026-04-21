import { asyncHandler, successResponse, ValidationError } from "@/lib/errors";
import { registerUser } from "@/services/AuthSerive";
import { registerApiSchema } from "@/lib/validation";

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();
  
  const validation = registerApiSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(validation.error.issues[0].message);
  }

  const result = await registerUser(validation.data);
  return successResponse(result.message, result);
});