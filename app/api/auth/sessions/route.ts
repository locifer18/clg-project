import { asyncHandler, successResponse, AuthenticationError } from "@/lib/errors";
import { getUser } from "@/lib/auth";
import { getUserSessionsService, deleteSessionService } from "@/services/AuthSerive";

export const GET = asyncHandler(async (req: Request) => {
  const user = await getUser();

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const sessions = await getUserSessionsService(user.id);

  return successResponse("Sessions fetched", sessions);
});

export const DELETE = asyncHandler(async (req: Request) => {
  const user = await getUser();

  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    throw new Error("Session ID required");
  }

  const result = await deleteSessionService(user.id, sessionId);

  return successResponse(result.message);
});