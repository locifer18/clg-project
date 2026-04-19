import { asyncHandler, successResponse, AuthenticationError } from "@/lib/errors";
import { getUser } from "@/lib/auth";
import { getUserSessionsService } from "@/services/AuthSerive";

export const GET = asyncHandler(async (req: Request) => {
  const user = await getUser();

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const sessions = await getUserSessionsService(user.id);

  return successResponse("Sessions fetched", sessions);
});