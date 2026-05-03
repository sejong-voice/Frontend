import { api } from "./axios";
import { AuthUser } from "@/components/auth/auth-provider";

export const authService = {
  login: async (studentNo: string, password: string) => {
    return api.post("/api/v1/auth/login", { studentNo, password });
  },

  consentLogin: async (data: { studentNo: string; password: string; serviceAgreed: boolean; policyAgreed: boolean }) => {
    return api.post("/api/v1/auth/consent-login", data);
  },

  logout: async () => {
    return api.post("/api/v1/auth/logout");
  },

  quit: async () => {
    return api.post("/api/v1/auth/quit", { agreed: true });
  },

  getProfile: async () => {
    return api.get<AuthUser>("/api/v1/auth/profile");
  },
};
