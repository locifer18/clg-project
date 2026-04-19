import { asyncHandler, successResponse, ValidationError } from "@/lib/errors";
import { loginUser } from "@/services/AuthSerive";
import { loginSchema } from "@/lib/validation"; // 🔥 USE THIS

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();
  
  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(validation.error.issues[0].message);
  }

  const result = await loginUser(validation.data);
  return successResponse(result.message, result);
});