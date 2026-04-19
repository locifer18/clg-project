import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, register, logout } from "@/features/auth/auth.api";
import {  ApiResponse, LoginRequest, RegisterRequest } from "@/types";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, unknown, LoginRequest & { password: string }>({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] }); // 🔥 refresh user
    },
  });
};

export const useRegister = () => {
  return useMutation<ApiResponse, unknown, RegisterRequest>({
    mutationFn: register,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse>({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
  });
};