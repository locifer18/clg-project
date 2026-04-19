import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/features/auth/auth.api";
import { UserResponse } from "@/types";

export const useCurrentUser = (enabled: boolean = true) => {
  return useQuery<UserResponse>({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    enabled: enabled && !!localStorage.getItem("accessToken"),
  });
};