import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/features/auth/auth.api";
import { UserResponse } from "@/types";

export const useCurrentUser = () => {
  return useQuery<UserResponse>({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });
};