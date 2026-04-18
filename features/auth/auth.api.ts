import api from "@/lib/axios";

// LOGIN
export const login = async (data: { email: string; code: string }) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

// SEND OTP
export const sendOtp = async (data: { email: string; type: string }) => {
  const res = await api.post("/auth/otp/send-otp", data);
  return res.data;
};

// VERIFY OTP
export const verifyOtp = async (data: any) => {
  const res = await api.post("/auth/otp/verify-otp", data);
  return res.data;
};

// REGISTER
export const register = async (data: any) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

// GET CURRENT USER
export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

// LOGOUT
export const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};