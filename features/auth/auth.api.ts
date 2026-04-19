import api from "@/lib/axios";
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterFormData,
  SendOtpRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  UserWithoutPassword,
} from "@/types";

// ================= AUTH =================

// LOGIN (STEP 1 - PASSWORD)
export const login = async (
  data: LoginRequest & { password: string }
): Promise<ApiResponse<{ message: string; nextStep: string }>> => {
  const res = await api.post<
    ApiResponse<{ message: string; nextStep: string }>
  >("/auth/login", data);

  return res.data;
};

// VERIFY LOGIN OTP (STEP 2)
export const verifyLoginOtp = async (
  data: VerifyOtpRequest
): Promise<ApiResponse<AuthResponse>> => {
  const res = await api.post<ApiResponse<AuthResponse>>(
    "/auth/otp/verify-otp",
    data
  );

  return res.data;
};

// REGISTER
export const register = async (
  data: RegisterFormData
): Promise<ApiResponse<{ message: string; nextStep: string }>> => {
  const { name, email, password, phone } = data;
  
  const res = await api.post<ApiResponse<{ message: string; nextStep: string }>>(
    "/auth/register",
    {
      name,
      email,
      password,
      phone,
    }
  );
 
  return res.data;
};

// ================= OTP =================

export const sendOtp = async (
  data: SendOtpRequest
): Promise<ApiResponse> => {
  const res = await api.post<ApiResponse>(
    "/auth/otp/send-otp",
    data
  );

  return res.data;
};

export const verifyOtp = async (
  data: VerifyOtpRequest
): Promise<ApiResponse> => {
  const res = await api.post<ApiResponse>(
    "/auth/otp/verify-otp",
    data
  );
  return res.data;
};

// ================= USER =================

export const getMe = async (): Promise<ApiResponse<UserWithoutPassword>> => {
  const res = await api.get<ApiResponse<UserWithoutPassword>>("/auth/me");
  return res.data;
};

// ================= SESSION =================
// ok bro i got it now what is the next thing bro i think we need to test our our auth system bro 
// LOGOUT
export const logout = async (): Promise<ApiResponse> => {
  const res = await api.post<ApiResponse>("/auth/logout");
  return res.data;
};

// REFRESH TOKEN
export const refreshToken = async (
  refreshToken: string
): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
  const res = await api.post<
    ApiResponse<{ accessToken: string; refreshToken: string }>
  >("/auth/refresh", { refreshToken });

  return res.data;
};

// ================= PASSWORD =================

export const resetPassword = async (
  data: ResetPasswordRequest
): Promise<ApiResponse> => {
  const res = await api.post<ApiResponse>(
    "/auth/reset-password",
    data
  );

  return res.data;
};

// ================= SESSIONS =================

// GET SESSIONS
export const getSessions = async (): Promise<
  ApiResponse<
    {
      id: string;
      device: string;
      ipAddress: string;
      createdAt: Date;
      expiresAt: Date;
      isCurrentSession: boolean;
    }[]
  >
> => {
  const res = await api.get("/auth/sessions");
  return res.data;
};

// DELETE SESSION
export const deleteSession = async (
  sessionId: string
): Promise<ApiResponse> => {
  const res = await api.delete(
    `/auth/sessions?sessionId=${sessionId}`
  );
  return res.data;
};

// LOGOUT ALL DEVICES
export const logoutAll = async (): Promise<ApiResponse> => {
  const res = await api.post("/auth/sessions", {
    action: "logout-all",
  });
  return res.data;
};