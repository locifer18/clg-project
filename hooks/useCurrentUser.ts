import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/features/auth/auth.api";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });
};