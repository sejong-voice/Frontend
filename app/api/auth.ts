import { api } from "./axios";
import { AuthUser } from "@/components/auth/auth-provider";

export const authService = {
  login: async (studentNo: string, password: string) => {
    return api.post("/api/v1/auth/login", { studentNo, password });
  },

  logout: async () => {
    return api.post("/api/v1/auth/logout");
  },

  getProfile: async () => {
    return api.get<AuthUser>("/api/v1/auth/profile");
  },
};
