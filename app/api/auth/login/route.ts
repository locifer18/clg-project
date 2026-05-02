import { asyncHandler, successResponse, ValidationError } from "@/lib/errors";
import { loginUser } from "@/services/AuthSerive";
import { loginPasswordSchema } from "@/lib/validation";

const sanitizeLog = (value: string): string =>
  value.replace(/[\r\n\t]/g, " ").trim();

export const POST = asyncHandler(async (req: Request) => {
  const body = await req.json();

  const validation = loginPasswordSchema.safeParse(body);
  if (!validation.success) {
    throw new ValidationError(sanitizeLog(validation.error.issues[0].message));
  }

  const result = await loginUser(validation.data);
  return successResponse(sanitizeLog(result.message), result);
});