import { api } from "@/lib/api";
import { AuthResponse } from "@/types";

export const twoFactorService = {
  setup: () =>
    api.get<{ secret: string; qrUri: string }>("/auth/2fa/setup"),

  enable: (code: string) =>
    api.post<AuthResponse>("/auth/2fa/enable", { code }),

  disable: (code: string) =>
    api.post<void>("/auth/2fa/disable", { code }),

  verify: (email: string, code: string) =>
    api.post<AuthResponse>("/auth/2fa/verify", { email, code }),
};
