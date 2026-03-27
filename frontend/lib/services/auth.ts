import { api } from "@/lib/api";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types";

export const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>("/auth/register", data),
};
